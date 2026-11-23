# P4 – Plan Soak (AI sinh, chưa chạy)

File `perf/plans/23120399_Soak_20261123.jmx`, sinh từ plan Load đã review; chỉ đổi tên TestPlan, mặc định `threads=300`, `duration=900` (15 phút), ramp-up 60 s, và assertion lockout-probe sang Equals + OR (401, 403) như Stress/Spike.

## Số VU: đổi so với đề xuất trong chat
Trong chat (12:37) AI đề xuất 50 VU và sinh viên đồng ý ("ok"). Khi soạn plan, AI đối chiếu `skills/.../templates/scenario-params.md`: Soak nên ở ≈ 70–80 % bậc ổn định cuối của Stress. Stress có think time ổn định tới 400 VU (p95 3 ms) ⇒ ≈ 300 VU. 50 VU (≈ 12 %) quá nhẹ để thấy xu hướng bộ nhớ trong 15 phút. Vì vậy mặc định để 300 VU và báo lại sinh viên; muốn giữ 50 VU thì chạy với `-J threads=50`.

## Cách đọc
- RAM backend theo thời gian (`node-usage.csv`): tăng đều không giảm ⇒ dữ liệu tích lũy trong bộ nhớ (nghi lỗi giỏ hàng không được xóa, đã thấy ở Stress và Spike).
- p95 theo từng phút (`jtl-summary.mjs --bucket 60`): so phút 2–3 với phút 13–14.
- Ước tính: 300 VU × 0,75 req/s ≈ 225 req/s, ≈ 200 000 mẫu, .jtl ≈ 30 MB.
