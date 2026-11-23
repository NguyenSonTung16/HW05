# P6 – Chạy Load thật (50 VU, 7 phút)

Plan: `perf/plans/23120399_Load_20261118.jmx`. Kết quả: `perf/results/load2/`. Máy: MSI (Ryzen 5 5600H, 12 lõi, 15,4 GB), Windows 10.0.26300, bắt đầu 2026-11-23 10:24:43 ICT.

## Lượt chạy hỏng, giữ lại làm bằng chứng
`perf/results/load/` chạy với `-J threads=500` nhưng `users.csv` chỉ có 100 tài khoản (recycle=false, stopThread=true), nên luồng 101–500 tự dừng và tải thật chỉ là 100 VU, không phải con số ghi trong `run-meta.json`. Không dùng lượt này để báo cáo. Nguyên nhân: sinh viên chọn số VU mà không đối chiếu với số tài khoản; skill chưa có bước kiểm tra "VU ≤ số tài khoản" (ghi nhận để thêm vào skill v2).

## Lượt hợp lệ `load2`
Điều kiện: backend khởi động lại (DB tạo lại), `prepare-data.mjs --accounts-only`, `-J threads=50`, 50 VU + 1 VU lockout-probe (ramp-up 60 s, giữ đến 420 s).

| Chỉ số | Giá trị (từ `summary.md`, do script tính từ .jtl) |
|---|---|
| Mẫu / lỗi | 14 692 / 0 % |
| p95 tổng | 4 ms (p99 5 ms, max 34 ms) |
| Throughput | 35 req/s tính cả ramp; 37–39 req/s ở giai đoạn ổn định |
| Cửa sổ 10 s khỏe | 42/42 |
| Checkout thành công | 2408 trong .jtl, 2408 trong bảng `orders` → KHỚP |
| Nhánh lockout-probe | 401 ×30, 403 ×53, không tính là lỗi (Ignore Status) |
| Backend (PID 9176) | CPU TB 0,3 % / tối đa 1,2 % (chia 12 lõi); RAM 55,4 → 145,2 MB (đỉnh 146,7 MB) |

Ảnh minh chứng: `evidence/screenshots/load/load2-50vu-min5-taskmanager.png` (PID 9176 trong ảnh khớp cột `pid` của `node-usage.csv`).

## Nhận xét của sinh viên (đã đối chiếu với số của script)
- Hệ thống ở mức Load này còn rất nhàn: p95 4 ms, CPU backend dưới 2 %. Đây là mốc nền; điểm gãy phải tìm ở Stress.
- RAM backend tăng ~90 MB trong 7 phút khi có 2408 đơn và giỏ hàng giữ trong bộ nhớ. Chưa đủ để kết luận rò rỉ (có thể do GC chưa chạy); cần soak 10–15 phút để xem có tiếp tục tăng không.
- Số mẫu giảm dần theo thứ tự bước (add-cart/view-cart 2423, checkout 2408): 15 VU bị cắt giữa vòng lặp khi hết thời gian, không phải lỗi.
- `AUTH login-wrong` RPS 0,2 và nhóm `AUTH` 0,3 là do script chia theo khoảng thời gian riêng của từng label, không phản ánh tải thật.
- Tài khoản lock01–10 đã bị khóa sau lượt chạy: phải chạy `reset-lockout.mjs` (hoặc khởi động lại backend) trước lượt kế tiếp.
- Việc còn mở từ P5: chưa assert thứ tự 401 → 403; tài khoản lock cạn sau ~1–2 phút (chỉ mở khóa lại sau 180 s); assertion view-cart còn yếu.
