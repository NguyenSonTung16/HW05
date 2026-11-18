# P2 – Khảo sát API EShop cho workflow P1 (áp dụng skill `jmeter-performance-testing`)
Thời gian: 2026-11-18 ~11:10 (UTC+07:00). Nguồn: `eshop-sut/backend/server.js`, `database.js`, `package.json`, `api_specification.md`, đọc DB `database.sqlite` ở chế độ chỉ đọc. Chưa gửi request nào tới SUT; mọi nhận định về hành vi khi chạy là **dự đoán từ mã nguồn**.

## Kiến trúc ảnh hưởng tới hiệu năng
- Một tiến trình Node (`node server.js`), Express 5, `body-parser` JSON, CORS mở, cổng 3000.
- SQLite qua gói `sqlite3` v6, **một kết nối** dùng chung, `journal_mode = delete` (không phải WAL). Chỉ có index tự sinh của `coupons.code`; `users.email` và `products.name` không có index.
- **Mỗi lần khởi động, `database.js` xóa (DROP) và tạo lại mọi bảng rồi seed**: 5 sản phẩm, 2 người dùng, 0 đơn hàng. Hệ quả:
  - Khởi động lại backend = DB sạch; không cần `db-snapshot.mjs restore`.
  - Tài khoản test (`perf*`, `lock*`) mất sau mỗi lần khởi động → phải chạy `prepare-data.mjs --accounts-only` sau mỗi lần (đã bổ sung vào skill v1.1).
  - Việc seed chạy bất đồng bộ lúc khởi động; chờ health check `GET /api/products` trả 200 rồi mới seed tài khoản.
- Giỏ hàng nằm trong biến `userCarts` của tiến trình: mất khi khởi động lại.

## Từng endpoint trong workflow
| Nhãn | Endpoint | Thành công | Từ chối / lỗi | Ghi chú hiệu năng / chức năng (dự đoán) |
|---|---|---|---|---|
| AUTH login | `POST /api/login` `{email,password}` | 200 `{message, token, user}` | 401 sai email/mật khẩu; 403 đang khóa; 500 lỗi DB | Quét bảng `users` theo email (không index; ~110 dòng nên nhẹ). Đăng nhập đúng: thêm một lệnh UPDATE (ghi DB) mỗi lần → auth cũng tạo tải ghi. JWT ký đồng bộ, không hết hạn. Phản hồi trả **cả object user gồm mật khẩu dạng rõ** (vấn đề bảo mật, ngoài phạm vi đo). |
| (khóa) | như trên, sai mật khẩu | – | 401, rồi 403 | `login_attempts += 2`, khóa khi ≥ 3 → **khóa ở lần sai thứ 2**, khóa 180 giây. Lệch FR-02 (3 lần). |
| READ list | `GET /api/products` | 200 mảng 5 sản phẩm | – | Nhánh không có `search` bỏ qua lỗi DB (lỗi sẽ thành 200 với body rỗng). |
| READ search | `GET /api/products?search=k` | 200 mảng | 500 trả **HTML** `<h1>Database Error</h1>` | Từ khóa **nối thẳng vào SQL** (`LIKE '%k%'`): dấu nháy đơn gây 500 (SQL injection). CSV đã bỏ dấu `'`. Từ khóa dùng: `iPhone`, `Samsung`, `MacBook`, `Tai`, `Bàn`. |
| READ detail | `GET /api/products/:id` | 200 object | không có lỗi 404: id không tồn tại vẫn 200 `{}` | Id chẵn trả `price` dạng **chuỗi**, id lẻ dạng số (không nhất quán). Assertion kiểm `$.id` đúng id nên không bị ảnh hưởng. |
| TXN add-cart | `POST /api/cart` (Bearer) | 200 `{message}` | 401 thiếu token; 403 token sai | Đẩy nguyên body vào mảng trong bộ nhớ, không kiểm tra dữ liệu. |
| TXN view-cart | `GET /api/cart` (Bearer) | 200 mảng | 401/403 | Trả toàn bộ mảng giỏ; vì checkout không xóa giỏ, mảng dài dần theo số vòng của từng tài khoản. Với 100 tài khoản xoay vòng, một lượt Soak 15 phút chỉ thêm vài chục phần tử/tài khoản → dự đoán tăng RAM nhỏ, khó thấy trong thời lượng bài. |
| TXN checkout | `POST /api/checkout` `{total_amount, shipping_address}` (Bearer) | 200 `{message, orderId}` | 500 lỗi DB | INSERT vào `orders` (ghi đĩa mỗi lần, journal delete). Dự đoán: **điểm nghẽn đầu tiên khi Stress** là các lệnh ghi (checkout + UPDATE khi login) xếp hàng trên một kết nối SQLite. Server tin `total_amount` từ client, không đối chiếu giỏ, không xóa giỏ. |

## Quy trình reset giữa các lượt (thay cho bước restore DB)
1. Đóng cửa sổ backend (tắt tiến trình), chạy lại `tools\start-backend.bat`.
2. Chờ `http://localhost:3000/api/products` trả 200.
3. `node skills\jmeter-performance-testing\scripts\prepare-data.mjs --accounts-only` (tạo lại 100 `perf*` + 10 `lock*`).
4. Chạy kịch bản bằng `run-scenario.mjs`.
`reset-lockout.mjs` chỉ cần khi muốn chạy tiếp mà không khởi động lại backend; DB nằm ở `eshop-sut\backend\database.sqlite`.

## Ứng viên bug / vấn đề (sẽ xác nhận bằng lượt chạy thật trước khi đăng Issue)
1. Khóa tài khoản sau 2 lần sai thay vì 3 (bộ đếm +2).
2. Tìm kiếm có dấu `'` trả 500 kèm HTML lỗi SQL (SQL injection).
3. `GET /api/products/:id` không tồn tại trả 200 `{}` thay vì 404; `price` lúc số lúc chuỗi.
4. Checkout không xóa giỏ; giỏ trong bộ nhớ tăng không giới hạn.
5. Phản hồi đăng nhập lộ mật khẩu.

## Chưa xác nhận
- Thời gian seed lúc khởi động; độ trễ thật của các lệnh ghi; hành vi khi ghi đồng thời nhiều (kỳ vọng xếp hàng, không lỗi `SQLITE_BUSY` vì một kết nối).
