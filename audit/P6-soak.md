# P6 – Chạy Soak 15 phút

Plan `perf/plans/23120399_Soak_20261123.jmx` (mặc định 300 VU có think time 1–3 s, ramp 60 s, 900 s). Kết quả `perf/results/soak/`. Máy MSI, 2026-11-23 12:50:00 → 13:05:10 ICT, JMeter exit 0, backend PID 1824 (khớp ảnh và `node-usage.csv`).

## Tổng (`summary.md`)
195 439 mẫu, lỗi 0 %, p95 4 ms, 217,2 req/s (tính cả ramp-up); 90/90 cửa sổ 10 s khỏe, đỉnh 229,8 req/s. Checkout 32 396 = 32 396 đơn trong DB → KHỚP. CPU backend TB 1,3 % / max 4 % (thang 12 lõi).

## Theo thời gian (cửa sổ 2 phút, `jtl-summary.mjs --from-sec/--to-sec`)
| Cửa sổ (s) | Mẫu | req/s | Avg | p95 | p99 | Max | Lỗi |
|---|---|---|---|---|---|---|---|
| 60–180 | 26 862 | 223,9 | 1,4 | 4 | 7 | 25 | 0 % |
| 180–300 | 27 048 | 225,4 | 1,1 | 3 | 5 | 14 | 0 % |
| 420–540 | 26 966 | 224,7 | 1,2 | 3 | 5 | 29 | 0 % |
| 600–720 | 26 883 | 224,0 | 1,1 | 3 | 5 | 14 | 0 % |
| 780–900 | 26 992 | 225,0 | 1,6 | 5 | 8 | 25 | 0 % |

`TXN view-cart` p95 1 ms ở cả 120–180 s và 780–840 s.

## RAM backend (working set, `node-usage.csv`, mốc mỗi phút)
70 → 116 → 174 MB (phút 0–2, lúc 300 VU đăng nhập và tải tăng) → 173,2 (phút 4) → 174,6 (phút 9) → 177,6 (phút 12) → 179,3 MB (phút 14); cuối 176,8 MB, đỉnh 179,6 MB. Task Manager (private working set) ở 3 ảnh: 145 / 148 / 152 MB.

## Nhận xét
- **Không suy giảm hiệu năng trong 15 phút:** throughput giữ 224–225 req/s, p95 3–5 ms, lỗi 0 %.
- p95 cửa sổ cuối nhích lên 5 ms (Avg 1,6 so với 1,1 ms); trùng thời điểm sinh viên thao tác chụp ảnh (13:04, phút ~14) trên cùng máy. Mức chênh rất nhỏ so với ngưỡng 500 ms, không coi là suy giảm.
- **RAM tăng nhẹ, đều sau khi ổn định:** ~173 → ~179 MB từ phút 3 đến phút 14 (≈ +0,6 MB/phút), hai nguồn đo (script và Task Manager) cùng xu hướng. Khớp với giỏ hàng không được xóa sau checkout (số món tăng tuyến tính theo số vòng). 15 phút không đủ để khẳng định rò rỉ; ngoại suy (chưa đo) ≈ +36 MB/giờ ở mức tải này. `view-cart` chưa chậm đi vì mỗi giỏ mới có vài chục món.
- Kết hợp với Spike (RAM không giảm sau đỉnh) ⇒ đủ cơ sở để báo lỗi "checkout không xóa giỏ hàng trong bộ nhớ" kèm bằng chứng hiệu năng.
