# P1 – Workflow và phạm vi endpoint (áp dụng skill `jmeter-performance-testing`, ĐÃ DUYỆT 2026-11-18 11:05)
Thời gian: 2026-11-18 ~11:00 (UTC+07:00). Nguồn: `eshop-sut/backend/server.js`, `eshop-sut/api_specification.md`, quyết định D1 trong PLAN.md. Chưa chạy gì; nhận xét về hành vi là đọc từ mã nguồn (dự đoán).

## Workflow một vòng của mỗi VU (dùng chung cho Load, Stress, Spike, Soak)
| # | Nhãn sampler | Request | Nhóm | Dữ liệu CSV | Kiểm tra (assertion) |
|---|---|---|---|---|---|
| 1 | `AUTH login` | `POST /api/login` | auth-heavy | `users.csv`: email, password | 200 + có `token`; lưu token |
| 2 | `READ list` | `GET /api/products` | read-heavy | – | 200 + có sản phẩm đầu tiên |
| 3 | `READ search` | `GET /api/products?search=<keyword>` | read-heavy | `products.csv`: keyword | 200 + có kết quả |
| 4 | `READ detail` | `GET /api/products/<id>` | read-heavy | `products.csv`: product_id | 200 + `id` đúng sản phẩm |
| 5 | `TXN add-cart` | `POST /api/cart` (Bearer token) | transactional | `products.csv` + `orders.csv`: quantity | 200 + có `message` |
| 6 | `TXN view-cart` | `GET /api/cart` (Bearer token) | transactional | – | 200 + giỏ có sản phẩm |
| 7 | `TXN checkout` | `POST /api/checkout` (Bearer token) | transactional | `orders.csv`: shipping_address; total = price × quantity | 200 + có `orderId` |

Think time 1–3 giây (ngẫu nhiên) trước mỗi request, mô phỏng người dùng đọc trang. Mỗi vòng đăng nhập lại (một vòng = một phiên mua hàng), nên nhóm auth chịu tải theo đúng số phiên.

## Nhánh phụ: hành vi khóa tài khoản dưới tải
- Thread Group riêng, 1 VU, mỗi 5 giây gửi `AUTH login-wrong` (`POST /api/login` sai mật khẩu) bằng tài khoản `lock01…lock10`.
- Chỉ chấp nhận 401 (sai mật khẩu) hoặc 403 (đã khóa); 200 hay 5xx là lỗi.
- Tài khoản workflow `perf001…perf100` không bao giờ nhập sai, nên lỗi ở workflow không thể do khóa tài khoản gây ra.
- Từ mã nguồn: mỗi lần sai cộng 2 vào bộ đếm, khóa khi ≥ 3 (tức khóa ngay lần sai thứ 2), khóa 180 giây, trả 403. Lệch quy tắc "3 lần sai" của FR-02: sẽ xác nhận khi chạy và báo bug nếu đúng.

## Vì sao workflow phủ đủ 3 nhóm
- **Auth-heavy:** mỗi vòng có một lần đăng nhập đúng (tạo JWT, đọc/ghi bảng `users`), cộng nhánh đăng nhập sai chạm cơ chế khóa.
- **Read-heavy:** 3/7 request là đọc sản phẩm: danh sách đầy đủ, tìm kiếm `LIKE`, chi tiết theo id.
- **Transactional:** 3/7 request thay đổi trạng thái: giỏ hàng (trong bộ nhớ tiến trình) và đặt hàng (ghi bảng `orders` trong SQLite).

## Không đưa vào workflow (và lý do)
- `POST /api/register`: chỉ dùng khi chuẩn bị dữ liệu; đăng ký trong lúc chạy tải sẽ tạo tài khoản rác và làm DB lớn dần.
- Coupon (`/api/apply-coupon`, `/api/coupon-usage`): thuộc FR-09, không nằm trong 3 nhóm đã chốt; coupon có giới hạn lượt dùng nên làm lỗi giả khi chạy tải.
- Lịch sử đơn, admin: ngoài phạm vi D1.

## Điểm cần lưu ý khi chạy (sẽ ghi chi tiết ở P2)
- Giỏ hàng lưu trong bộ nhớ và checkout không xóa giỏ, nên `GET /api/cart` sẽ trả mảng ngày càng dài theo số vòng: có thể làm thời gian `TXN view-cart` và RAM backend tăng dần (soak sẽ cho thấy).
- Checkout lấy `total_amount` từ client (không tính lại phía server): ghi nhận như rủi ro chức năng, không ảnh hưởng đo hiệu năng.
- Mỗi lượt chạy sinh đơn hàng mới, nên phải khôi phục DB sạch và khởi động lại backend giữa các lượt.

## Câu hỏi để duyệt
1. Đồng ý workflow 7 bước trên (tỉ lệ AUTH 1 : READ 3 : TXN 3)?
2. Đồng ý nhánh đăng nhập sai 1 VU / 5 giây trên tài khoản `lock*`?
3. Đồng ý không đưa coupon và đăng ký vào workflow?
