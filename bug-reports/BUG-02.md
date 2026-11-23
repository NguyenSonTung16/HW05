# BUG-02: [FR-07] Thêm cùng một sản phẩm vào giỏ tạo dòng mới thay vì tăng số lượng

**Mức độ:** Trung bình (sai chức năng; làm BUG-01 nặng thêm)  
**Yêu cầu vi phạm:** README FR-07 "Thêm cùng một sản phẩm vào giỏ sẽ tăng số lượng, không tạo dòng mới."  
**Môi trường:** như BUG-01.

### Mô tả
`POST /api/cart` (`server.js` dòng 290–295) luôn `userCarts[userId].push(req.body)`, không kiểm tra sản phẩm đã có trong giỏ.

### Bước tái hiện
1. Đăng nhập lấy token.
2. `POST /api/cart` hai lần với cùng body `{"id":1,"name":"iPhone 15 Pro Max","price":30000000,"quantity":1}`.
3. `GET /api/cart` → **Thực tế:** 2 phần tử `id=1`, mỗi phần tử `quantity=1`. **Mong đợi:** 1 phần tử `id=1`, `quantity=2`.

### Liên quan hiệu năng
Workflow JMeter thêm cùng một nhóm 5 sản phẩm lặp lại (`perf/data/products.csv`); vì không gộp dòng, kích thước giỏ tăng tuyến tính theo số vòng thay vì tối đa 5 dòng/người dùng, góp phần vào mức tăng bộ nhớ ở BUG-01.

### Đề xuất sửa
Tìm phần tử có cùng `id`; nếu có thì cộng `quantity`, nếu không thì thêm mới.
