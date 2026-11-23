# P6 – Chạy Spike thật

Plan `perf/plans/23120399_Spike_20261123.jmx` (mặc định, không -J). Kết quả `perf/results/spike/`. Máy MSI, 2026-11-23 12:27:53 → 12:34:53 ICT, JMeter exit 0, backend PID 23600 (dòng "Giám sát PID 23600" trong ảnh, khớp `node-usage.csv`).

## Tổng (`summary.md`)
110 649 mẫu, lỗi 0 %, p95 411 ms, 263,6 req/s trung bình cả lượt; 42/42 cửa sổ 10 s khỏe (ngưỡng mặc định 1 000 ms), đỉnh 1 777,3 req/s. Checkout 18 360 = 18 360 đơn trong DB → KHỚP.

## Theo giai đoạn (`jtl-summary.mjs --from-sec/--to-sec`)
| Giai đoạn | Cửa sổ (s) | Mẫu | req/s | Avg | p95 | p99 | Max | p95 checkout | Lỗi |
|---|---|---|---|---|---|---|---|---|---|
| Trước đỉnh (51 VU) | 30–120 | 3 599 | 40 | 1,5 | 4 | 6 | 12 | 6 | 0 % |
| Đỉnh (251 VU) | 125–180 | 88 452 | 1 603 | 127,9 | 427 | 490 | 594 | 494 | 0 % |
| Sau đỉnh (51 VU) | 180–420 | 9 017 | 37,6 | 1,3 | 4 | 5 | 131 | 5 | 0 % |

**Riêng 50 người dùng nền** (có think time, lọc `threadName` chứa "nền" trực tiếp từ .jtl bằng Python, phân vị nearest-rank):
| Giai đoạn | Mẫu | Avg (ms) | p95 (ms) | Max (ms) |
|---|---|---|---|---|
| Trước đỉnh | 3 359 | 1,4 | 4 | 8 |
| Đỉnh | 1 839 | 163,4 | 420 | 594 |
| Sau đỉnh | 8 969 | 1,3 | 4 | 131 |

Cửa sổ 10 s lúc đỉnh: p95 264 → 373 → 415 → 441 → 476 → 476 ms, throughput 1 777 → 1 494 req/s (giảm dần khi hàng đợi dài ra).

## Hồi phục (định nghĩa chốt ở P5 trước khi chạy)
p95 trung vị trước đỉnh = 4 ms ⇒ ngưỡng 6 ms. Ba cửa sổ đầu sau đỉnh 180–190, 190–200, 200–210 s có p95 4/4/4 ms, lỗi 0 % ⇒ **hồi phục trong ≤ 10 s** (độ phân giải của cửa sổ). Max 131 ms ở giai đoạn sau là vài request còn xếp hàng ngay khi nhóm đỉnh dừng.

## Tài nguyên backend (`node-usage.csv`, mẫu mỗi ~1 s)
CPU TB 1,3 %, max 10,8 % (thang 12 lõi; lúc đỉnh ≈ 1 lõi). RAM: 84 MB ở giây 120 → 183 MB ở giây 150 → 187 MB ở giây 200 → 186 MB lúc kết thúc (giây 421). **RAM không giảm sau đỉnh** dù 200 VU đỉnh đã dừng: khớp với lỗi checkout không xóa `userCarts` (dữ liệu giỏ của các tài khoản đỉnh nằm lại trong bộ nhớ).

## Nhận xét
- Đỉnh 200 VU không think time đẩy backend lên ~1 600 req/s (bão hòa, khớp ~1 450–1 550 ở Stress). Không có lỗi: backend xếp hàng chứ không từ chối request.
- Người dùng thật (nhóm nền) chịu hậu quả: độ trễ trung bình tăng ~117 lần (1,4 → 163 ms), p95 4 → 420 ms, sát ngưỡng phân tích 500 ms. `TXN checkout` vượt khi xét p99 (540 ms) và max (583 ms).
- Hồi phục gần như tức thì (≤ 10 s) về throughput và độ trễ; nhưng bộ nhớ không hồi phục.
- Hạn chế: đỉnh là lưu lượng không think time (dồn dập), JMeter cùng máy (CPU máy 39 % lúc đỉnh, RAM máy 85 %).
