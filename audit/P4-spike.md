# P4 – Plan Spike (AI sinh, chưa review, chưa chạy)

File: `perf/plans/23120399_Spike_20261123.jmx`. Sinh từ plan Load đã qua review (cùng workflow: đăng nhập một lần/VU, tài khoản riêng, think time 1–3 s, Once Only, assertion), nhân thành 2 nhóm + lockout-probe.

| Nhóm | VU | Bắt đầu (s) | Ramp (s) | Kéo dài (s) | Tham số |
|---|---|---|---|---|---|
| Nền | 50 | 0 | 30 | 420 | `base_threads`, `base_rampup`, `total_duration` |
| Đỉnh | 500 | 120 | 5 | 60 (dừng ở giây 180) | `spike_threads`, `spike_delay`, `spike_rampup`, `spike_duration`, `spike_think_min_ms`, `spike_think_range_ms` |
| Lockout-probe | 1 | 0 | 1 | 420 | `lock_threads`, `lock_think_ms` |

- Report view: **View Results Tree (chỉ lỗi)** bật; Summary và Aggregate tắt (Load dùng Summary, Stress dùng Aggregate → đủ 3 view khác nhau).
- Assertion lockout-probe dùng Equals + OR (401, 403) như bản Stress đã sửa.
- Cửa sổ phân tích: trước đỉnh 30–120 s, đỉnh 125–180 s, sau đỉnh 180–420 s; `--bucket 10`.

## Điểm AI tự thấy cần sinh viên quyết
1. **Đỉnh 500 VU có think time sẽ không làm quá tải backend.** Ước tính 550 × 0,75 ≈ 410 req/s, chỉ ~30 % năng lực đo được ở `stress-nothink` (~1 450 req/s). Spike này đo được tác động của 500 lần đăng nhập dồn trong 5 s và độ trễ lúc tăng đột ngột, nhưng nhiều khả năng p95 vẫn vài ms. Muốn đỉnh vượt năng lực thì cần ~2 000 VU có think time (cần 2 000 tài khoản, JMeter cùng máy có thể thành nút cổ chai) hoặc cho nhóm đỉnh chạy không think time (`-J spike_think_min_ms=0 -J spike_think_range_ms=0`, khi đó 50 VU đỉnh đã đủ bão hòa).
2. Định nghĩa "đã hồi phục": đề xuất = 3 cửa sổ 10 s liên tiếp sau giây 180 có p95 ≤ 1,5 × p95 trung vị giai đoạn trước đỉnh và lỗi 0 %.
3. Số tài khoản: 50 + 500 = 550 VU ⇒ cần chạy `prepare-data.mjs --out perf\data --users 600 --force`.
4. Có smoke trước không (đề xuất: 2 VU nền + 4 VU đỉnh, 40 s) để kiểm tra plan mới trước lượt thật 7 phút.
