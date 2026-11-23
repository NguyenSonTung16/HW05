# P5 – Chốt plan Spike (2026-11-23 12:22)

Sinh viên giao cho AI chọn theo các đề xuất ở `P4-spike.md`. Điểm 1 ở P4 chỉ nêu các phương án mà chưa chọn, nên AI chọn và ghi lý do ở đây; sinh viên có thể đổi bằng `-J`.

| # | Quyết định | Lý do |
|---|---|---|
| 1 | Nhóm đỉnh **200 VU không think time** (thay cho 500 VU có think time) | 500 VU có think time chỉ ~410 req/s ≈ 30 % năng lực (~1 450 req/s ở `stress-nothink`) nên không thử được quá tải. 200 VU không think time vượt bão hòa (160 VU ở `stress-nothink` cho p95 375 ms) nhưng vẫn trong phạm vi JMeter cùng máy chịu được (đã chạy 160 VU ổn). Đánh đổi: đỉnh là "lưu lượng dồn dập" không giống người dùng thật từng giây; ghi rõ trong báo cáo. |
| 2 | Hồi phục = 3 cửa sổ 10 s liên tiếp sau giây 180 có p95 ≤ 1,5 × p95 trung vị giai đoạn trước đỉnh (30–120 s) và lỗi 0 % | Định nghĩa đo được từ `summary.md` (bảng cửa sổ 10 s), chốt trước khi chạy để tránh chọn ngưỡng theo kết quả. |
| 3 | Số tài khoản: 50 + 200 = 250 ≤ 500 đã có ⇒ không cần tạo thêm | Đề xuất 600 tài khoản ở P4 không còn cần do đổi điểm 1. |
| 4 | Chạy smoke trước: 2 VU nền + 4 VU đỉnh, đỉnh ở giây 10–25, tổng 40 s | Kiểm tra plan mới (hai nhóm dùng chung CSV, nhóm đỉnh tắt think time, View Results Tree bật) trước lượt thật 7 phút. |

## Kết quả smoke (`perf/results/smoke-spike/`, 12:24 ICT)
- JMeter exit 0, lỗi 0 %, 21 890 mẫu.
- `AUTH login` = 6, đúng 6 thread khác nhau (nền 1-1, 1-2; đỉnh 2-1…2-4) → hai nhóm dùng chung `users.csv`, mỗi VU một tài khoản.
- Nhóm đỉnh chỉ có mẫu trong cửa sổ 10–30 s (đúng `spike_delay=10`, `spike_duration=15`); cửa sổ 10–20 s đạt 1 421 req/s chỉ với 4 VU không think time → think time của nhóm đỉnh đã tắt đúng, và xác nhận lại backend bão hòa quanh ~1 400 req/s.
- Nhóm nền 57 mẫu trong 40 s cho 2 VU, think time vẫn còn (≈ 0,7 req/s/VU).
- Checkout 3 645 = 3 645 đơn trong DB → KHỚP. View Results Tree không làm hỏng lượt chạy non-GUI.
