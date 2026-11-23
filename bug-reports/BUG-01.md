# BUG-01: [Perf][FR-08] Checkout không xóa giỏ hàng → bộ nhớ backend tăng theo số lần mua, không giảm sau tải

**Mức độ:** Cao (rò rỉ dữ liệu trong bộ nhớ; không giới hạn)  
**Yêu cầu vi phạm:** README FR-08 "Sau thanh toán thành công, giỏ hàng được xóa."  
**Môi trường:** EShop SUT `eshop-sut/backend` (Express 5, sqlite3), Node v24.11.1, máy MSI (Ryzen 5 5600H, 12 lõi, 15,4 GB), Windows 10.0.26300; JMeter 5.6.3.

### Mô tả
`POST /api/checkout` chỉ chèn một dòng vào `orders`, không đụng tới `userCarts[userId]` (biến toàn cục trong bộ nhớ, `server.js` dòng 14). `POST /api/cart` chỉ `push` (dòng 293). Mỗi vòng mua hàng làm giỏ dài thêm, không bao giờ được giải phóng cho tới khi backend khởi động lại.

### Bước tái hiện
1. Đăng nhập `POST /api/login` lấy token.
2. `POST /api/cart` với `{"id":1,"name":"iPhone 15 Pro Max","price":30000000,"quantity":1}` (Bearer token).
3. `POST /api/checkout` với `{"total_amount":30000000,"shipping_address":"HCM"}` → 200, có `orderId`.
4. `GET /api/cart` → **Thực tế:** vẫn còn sản phẩm vừa mua. **Mong đợi:** `[]`.
5. Lặp lại 2–4: giỏ dài thêm 1 dòng mỗi lần.

### Bằng chứng hiệu năng
- Spike (`perf/results/spike/`, `node-usage.csv`): RAM backend 84 MB (giây 120) → 183 MB (giây 150, lúc đỉnh) → **186 MB lúc kết thúc (giây 421)**, không giảm dù 200 VU đỉnh đã dừng ở giây 180. Ảnh: `evidence/screenshots/spike/spike-sau-dinh-51vu-details.png` (PID 23600 vẫn ~160 MB khi tải về mức nền).
- Soak 15 phút, 300 VU (`perf/results/soak/`): RAM tăng đều ~173 → ~179 MB từ phút 3 đến phút 14 (≈ +0,6 MB/phút) trong khi tải không đổi (224–225 req/s). Ảnh 3 mốc: `evidence/screenshots/soak/soak-phut{02,08,14}-details.png` (145 / 148 / 152 MB).
- Stress không think time (`perf/results/stress-nothink/`): RAM 53 → 259 MB sau 72 031 lần thêm vào giỏ trong 5 phút.

### Đề xuất sửa
Trong callback thành công của checkout: `userCarts[userId] = [];` (hoặc lưu giỏ trong DB và xóa theo `user_id`). Thêm test: sau checkout, `GET /api/cart` trả `[]`.
