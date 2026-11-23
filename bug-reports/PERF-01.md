# PERF-01: [Perf] Checkout là nút cổ chai khi backend bão hòa (~1 450 req/s): p99 > 500 ms ở 160 VU không think time

**Loại:** Vấn đề hiệu năng (không vi phạm yêu cầu chức năng; chưa có SLA chính thức)  
**Môi trường:** như BUG-01; JMeter chạy cùng máy với backend.

### Quan sát
- Stress không think time (`perf/results/stress-nothink/`): throughput bão hòa ~1 400–1 550 req/s ngay từ 10 VU; p95 tổng 17 → 375 ms khi VU 10 → 160. `TXN checkout` chậm nhất mọi bậc: p95 22 → 448 ms, **p99 501 ms** ở 160 VU.
- Spike (`perf/results/spike/`): lúc đỉnh 251 VU, `TXN checkout` p95 494 ms, p99 540 ms; người dùng nền p95 4 → 420 ms. Hồi phục ≤ 10 s sau đỉnh.
- CPU backend ≈ 1 lõi (Node một luồng chính); CPU toàn máy 39–45 % nên giới hạn nằm ở backend.

### Nguyên nhân khả dĩ (chưa đo riêng)
Mọi truy vấn đi qua **một** kết nối sqlite3 (`database.js`), ghi `INSERT orders` tuần tự, `journal_mode=delete`; bảng `users.email`, `products.name` không có index.

### Đề xuất
Đo lại sau khi: bật WAL (`PRAGMA journal_mode=WAL`), thêm index `users(email)`; cân nhắc giới hạn đồng thời / hàng đợi có timeout cho checkout. Mức năng lực hiện tại tương đương ~1 900 người dùng có think time 1–3 s (ước tính từ 0,75 req/s/VU).
