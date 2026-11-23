# BUG-04: [FR-08] Backend chấp nhận total_amount do client gửi, không tự tính từ giỏ

**Mức độ:** Nghiêm trọng (người dùng tự đặt giá đơn hàng)  
**Yêu cầu vi phạm:** README FR-08 "Backend phải tự tính lại tổng tiền; không chấp nhận giá trị total_amount do client gửi lên."  
**Môi trường:** như BUG-01.

### Mô tả
`POST /api/checkout` (`server.js` dòng 297–310) chèn thẳng `total_amount` từ body vào `orders`, không đọc giỏ hàng, không kiểm tra giỏ rỗng.

### Bước tái hiện
1. Đăng nhập lấy token; giỏ có thể rỗng.
2. `POST /api/checkout` với `{"total_amount":1,"shipping_address":"HCM"}`.
3. **Thực tế (theo mã nguồn):** 200 `Checkout successful` và đơn có `total_amount = 1`. **Mong đợi:** backend tự tính tổng từ giỏ; từ chối khi giỏ rỗng.
> Trạng thái: xác nhận qua đọc mã nguồn và qua việc mọi lượt chạy JMeter đều gửi `total_amount` do client tự tính (`price × quantity`) và đều được chấp nhận (vd. Soak: 32 396 đơn, 10 giá trị tổng khác nhau đúng bằng các tích trong `orders.csv`). Sinh viên chạy lại bước 2 bằng tay để chụp ảnh trước khi đăng Issue.

### Đề xuất sửa
Tính tổng từ `userCarts[userId]` (giá lấy từ bảng `products`, không lấy từ body), từ chối khi giỏ rỗng, bỏ qua `total_amount` của client.
