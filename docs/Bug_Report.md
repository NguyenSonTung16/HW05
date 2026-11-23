# Bug Report – HW05 Performance Testing (EShop SUT)

Nguồn: các lượt chạy JMeter trong `perf/results/` (raw .jtl, `node-usage.csv`, đối chiếu DB) và mã nguồn `eshop-sut/backend/server.js`. Mỗi mục có file riêng trong `bug-reports/` dùng làm nội dung GitHub Issue. Cột Issue điền sau khi sinh viên đăng.

| Mã | Tiêu đề | Mức độ | Phát hiện từ | Issue |
|---|---|---|---|---|
| [BUG-01](../bug-reports/BUG-01.md) | [Perf][FR-08] Checkout không xóa giỏ hàng → bộ nhớ backend tăng theo số lần mua, không giảm sau tải | Cao | Spike, Soak, Stress-nothink (RAM) | _chưa đăng_ |
| [BUG-02](../bug-reports/BUG-02.md) | [FR-07] Thêm cùng một sản phẩm vào giỏ tạo dòng mới thay vì tăng số lượng | Trung bình | Đọc mã khi phân tích BUG-01 | _chưa đăng_ |
| [BUG-03](../bug-reports/BUG-03.md) | [FR-02] Khóa tài khoản ngay sau lần đăng nhập sai thứ 2 và khóa 180 s thay vì 30 s | Cao | Nhánh lockout-probe (load2) + DB | _chưa đăng_ |
| [BUG-04](../bug-reports/BUG-04.md) | [FR-08] Backend chấp nhận total_amount do client gửi, không tự tính từ giỏ | Nghiêm trọng | Đọc mã + dữ liệu đơn hàng | _chưa đăng_ |
| [PERF-01](../bug-reports/PERF-01.md) | [Perf] Checkout là nút cổ chai khi backend bão hòa (~1 450 req/s): p99 > 500 ms ở 160 VU không think time | Hiệu năng | Stress-nothink, Spike | _chưa đăng_ |

Ngoài phạm vi HW05 (lỗi bảo mật/chức năng đã thấy ở các bài trước, không do kiểm thử hiệu năng phát hiện): SQL injection ở `GET /api/products?search=`, `GET /api/products/:id` trả 200 `{}` khi không có sản phẩm, response đăng nhập chứa mật khẩu.
