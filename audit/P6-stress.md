# P6 – Chạy Stress thật (5 bậc đến 400 VU, 15 phút)

Plan: `perf/plans/23120399_Stress_20261123.jmx` (mặc định, không truyền -J). Kết quả: `perf/results/stress/`. Máy MSI (Ryzen 5 5600H, 12 lõi, 15,4 GB), 2026-11-23 11:04:33 → 11:19:41 ICT, JMeter exit 0.

## Tổng (từ `summary.md`)
100 544 mẫu, lỗi 0 %, p95 3 ms, max 98 ms, 111,7 req/s tính trên cả 15 phút; 90/90 cửa sổ 10 s khỏe, đỉnh 308,1 req/s. 400 `AUTH login` = 400 VU, mỗi VU một tài khoản. Checkout 16 527 trong .jtl = 16 527 đơn trong DB → KHỚP. Lockout-probe 401 ×59, 403 ×120, không tính lỗi.

## Theo bậc (phần ổn định sau ramp-up 30 s; `jtl-summary.mjs --from-sec/--to-sec`)
| Bậc | VU | Cửa sổ (s) | Mẫu | Lỗi % | p95 (ms) | Max (ms) | req/s | CPU backend TB* | RAM đỉnh* |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 25 | 30–180 | 2 842 | 0 | 4 | 9 | 19,0 | 0,17 % | 71,6 MB |
| 2 | 50 | 210–360 | 5 701 | 0 | 4 | 98 | 38,0 | 0,32 % | 107,2 MB |
| 3 | 100 | 390–540 | 11 328 | 0 | 4 | 10 | 75,5 | 0,56 % | 126,7 MB |
| 4 | 200 | 570–720 | 22 536 | 0 | 3 | 58 | 150,2 | 0,95 % | 82,4 MB |
| 5 | 400 | 750–900 | 44 989 | 0 | 3 | 16 | 299,9 | 1,53 % | 100,3 MB |

\* Từ `node-usage.csv`, cắt theo khối 180 mẫu (~180 s, gần đúng ranh giới bậc). CPU chia theo 12 lõi.

## Nhận xét
- **Không tìm thấy điểm gãy trong phạm vi đã thử.** Không cửa sổ nào vượt ngưỡng phân tích (p95 500 ms, lỗi 5 %); p95 giữ 3–4 ms từ 25 đến 400 VU.
- **Throughput tăng tuyến tính đúng 0,75 req/s mỗi VU** (19 → 38 → 75,5 → 150 → 300). Mỗi vòng có 6 request và 4 think time trung bình 2 s (≈ 8 s), tức 6/8 = 0,75. Nghĩa là tải bị giới hạn bởi think time của kịch bản, không phải bởi backend: 400 VU chỉ tạo ~300 req/s.
- Backend Node chạy một luồng chính; 1,53 % trên thang 12 lõi ≈ 18 % của một lõi ở ~300 req/s. Ngoại suy thô (chưa kiểm chứng): một lõi bão hòa quanh ~1 500 req/s, tương đương ~2 000 VU với think time hiện tại.
- RAM không tăng đơn điệu (đỉnh 126,7 MB ở bậc 3, giảm còn ~100 MB): không có dấu hiệu rò rỉ trong 15 phút này; GC vẫn thu hồi được dù giỏ hàng nằm trong bộ nhớ.
- Max 98 ms ở bậc 2 là một mẫu lẻ (p99 vẫn 4 ms), không lặp lại ở bậc cao hơn.

## Hạn chế
- Kết luận đúng chỉ cho kịch bản có think time 1–3 s; chưa biết giới hạn thật của backend.
- Không đo CPU của chính JMeter; nếu tăng tải mạnh, máy chạy JMeter cũng là máy chạy backend nên có thể tranh tài nguyên.

## Lượt lặp lại `stress2` (lấy ảnh minh chứng)
Lượt `stress` không có ảnh do sinh viên quên chụp. `stress2` chạy lại đúng plan và cấu hình (không -J), 2026-11-23 11:49:51 → 12:05:05 ICT, máy MSI, JMeter exit 0, backend PID 3408 (khớp cột `pid` trong `node-usage.csv` và ảnh). Số liệu chính của báo cáo vẫn là lượt `stress`; ảnh trong `evidence/screenshots/stress/` thuộc lượt `stress2`:
- `stress2-bac4-200vu.png`: `00:11:00`, Active 201, ~150 req/s, lỗi 0 (không có taskbar/đồng hồ trong khung).
- `stress2-bac5-400vu.png`: `00:13:30`, Active 401, ~298 req/s, lỗi 0, đồng hồ 12:03 PM 11/23/2026.

### So sánh hai lượt (phần ổn định từng bậc, `jtl-summary.mjs --from-sec/--to-sec`)
| VU | req/s stress | req/s stress2 | p95 stress | p95 stress2 | Lỗi (cả hai) |
|---|---|---|---|---|---|
| 25 | 19,0 | 19,1 | 4 | 4 | 0 % |
| 50 | 38,0 | 37,3 | 4 | 4 | 0 % |
| 100 | 75,5 | 75,6 | 4 | 3 | 0 % |
| 200 | 150,2 | 149,5 | 3 | 4 | 0 % |
| 400 | 299,9 | 298,1 | 3 | 6 | 0 % |

Tổng `stress2`: 99 999 mẫu, lỗi 0 %, p95 5 ms, max 113 ms, 90/90 cửa sổ khỏe, đỉnh 303,7 req/s; CPU backend TB 0,7 % / max 3,9 %; RAM 68,9 → 91,1 MB (đỉnh 120,2 MB); checkout 16 438 = 16 438 đơn trong DB → KHỚP.

Nhận xét: throughput hai lượt gần như trùng nhau (lệch < 2 %), xác nhận kết luận "tải bị giới hạn bởi think time, không gãy tới 400 VU". p95 ở 400 VU của `stress2` cao hơn (6 so với 3 ms, avg 2,1 so với 1,1 ms); khả năng do sinh viên thao tác chụp ảnh và mở Task Manager trên cùng máy trong lúc chạy (JMeter và backend dùng chung máy). Chênh lệch vẫn rất xa ngưỡng 500 ms nên không đổi kết luận. Mẫu đếm RAM không tăng đơn điệu ở cả hai lượt.
