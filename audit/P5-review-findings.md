# P5 – Review plan do AI sinh và cách sửa
Người review: sinh viên 23120399, 2026-11-18 12:01 (UTC+07:00). AI sửa theo review: Claude Opus 5.5.
Plan: `perf/plans/23120399_Load_20261118.jmx`. Bản AI sinh: commit `cc0cd4a` ("P4: plan Load do AI sinh"). Bản sửa: commit kế tiếp ("P5: sửa plan Load theo review").

## Phát hiện của sinh viên (nguyên ý, theo thứ tự trong tin nhắn)
| # | AI đã làm | Vì sao sai / thiếu (sinh viên) | Vì sao AI bỏ sót (phân tích) | Cách sửa |
|---|---|---|---|---|
| 1 | Mỗi vòng lặp đăng nhập lại | Người dùng thật đăng nhập một lần rồi duyệt và mua nhiều lần; đăng nhập liên tục làm phồng tải nhóm auth | **Prompt và thói quen của model**: prompt "sinh plan Load" không mô tả hành vi người dùng; AI dùng cấu trúc phẳng phổ biến trong ví dụ JMeter (mỗi vòng một phiên) và chỉ tự nêu là "điểm cần soi" chứ không tự sửa | `Once Only Controller` bọc `AUTH login`: mỗi VU đăng nhập đúng 1 lần, token dùng cho mọi vòng sau (JWT của SUT không hết hạn, theo P2) |
| 2 | `users.csv` dùng chung, đọc lần lượt, recycle | Hai VU có thể dùng chung tài khoản và ghi vào giỏ hàng của nhau | **Đặc tính endpoint bị bỏ qua khi sinh plan**: P2 đã ghi giỏ hàng lưu theo user trong bộ nhớ, nhưng AI không nối thông tin đó vào cấu hình CSV | CSV users đặt làm con của `AUTH login` (chỉ đọc khi login chạy, tức 1 lần/VU); `recycle=false`, `stopThread=true`: hết tài khoản thì thread dừng (lộ ra ngay, không âm thầm dùng chung). Số VU không được vượt số tài khoản (Stress/Spike phải seed thêm) |
| 3 | Think time ở mức Thread Group, chờ trước mọi request kể cả đăng nhập | Chỉ nên chờ khi lướt xem hàng hoặc trước khi bấm thanh toán, không chờ trước khi kịp đăng nhập | **Giới hạn của template + model**: AI đặt một timer ở Thread Group cho đơn giản; không mô hình hóa từng bước của người dùng | Bỏ timer chung; 1–3 s chỉ trước `READ list`, `READ search`, `READ detail`, `TXN checkout`. `TXN add-cart`, `TXN view-cart` chạy ngay sau bước trước |
| 4 | Đặt cứng 50 VU | Con số đoán mò; phải chạy thử 1–2 người trước rồi mới chốt cho vừa sức máy | **Model không có dữ liệu phần cứng / thời gian đáp ứng thật**; AI có nêu là dự đoán nhưng vẫn đặt làm mặc định | Mặc định `threads=2` (smoke). Số VU của Load chốt sau smoke, truyền bằng `-J threads=..` và ghi lý do vào báo cáo |
| 5 | Assertion checkout chỉ kiểm có `orderId` | Chạy xong phải vào DB đếm số đơn lưu thật có đủ không | **Oracle yếu**: AI chỉ kiểm phản hồi HTTP, không kiểm trạng thái lưu trữ phía server | `run-scenario.mjs --verify-db <database.sqlite>`: so số mẫu `TXN checkout` thành công trong `.jtl` với `SELECT COUNT(*) FROM orders` (DB sạch vì backend tự tạo lại DB khi khởi động) |
| 6 | Nhánh đăng nhập sai: Response Assertion "code khớp 40[13]" nhưng **không bật Ignore Status** | Phải để công cụ hiểu bị từ chối là bình thường, không phải bài test lỗi | **Giới hạn kiến thức công cụ của model, không được kiểm bằng chạy thật**: JMeter tự đánh dấu mẫu 4xx là lỗi; assertion khớp mã không đảo được kết quả nếu không bật "Ignore Status". AI không tự nêu điểm này ở P4 | Bật `Assertion.assume_success` (Ignore Status) cho assertion của `AUTH login-wrong`: 401/403 = thành công, 200 hoặc 5xx = lỗi |

Điểm 1–5 AI đã tự nêu ở P4 như "điểm cần soi" nhưng không tự sửa; sinh viên quyết định sửa và chỉ rõ cách sửa. Điểm 6 là phát hiện riêng của sinh viên.

## Gợi ý của AI chưa được xử lý (chờ sinh viên quyết)
- Nhánh đăng nhập sai không kiểm **thứ tự** 401 → 403, nên không tự phát hiện việc khóa ở lần sai thứ 2 thay vì thứ 3.
- 10 tài khoản `lock*`, mỗi 5 s một lần, khóa 180 s: sau khoảng 1–2 phút gần như mọi request sai đều nhận 403 (nhánh khóa sẵn), ít đo được đường 401.
- `TXN view-cart` chỉ kiểm giỏ có phần tử đầu tiên, không kiểm sản phẩm vừa thêm có trong giỏ.

## Chưa kiểm chứng (xác nhận bằng smoke)
- CSV đặt dưới sampler trong Once Only Controller chỉ được đọc 1 lần/VU: smoke 2 VU phải có đúng 2 mẫu `AUTH login`.
- Ignore Status: mẫu `AUTH login-wrong` phải có `success=true` với mã 401/403.
