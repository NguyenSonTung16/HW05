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

## Lượt Stress phụ không think time (`stress-nothink`)
Thiết kế: `audit/P4-stress-nothink.md`. Cùng plan, `-J think_min_ms=0 think_range_ms=0`, 5 bậc 10/20/40/80/160 VU × 60 s (ramp 10 s), 2026-11-23 12:10:07 → 12:15:23 ICT, máy MSI, JMeter exit 0, backend PID 17220 (khớp `node-usage.csv` và ảnh).

**Sự cố công cụ:** bước tóm tắt của `run-scenario.mjs` lỗi `RangeError: Maximum call stack size exceeded` do `Math.min(...mảng)` với 432 595 mẫu. JMeter đã chạy xong và .jtl/html/node-usage còn nguyên. Đã sửa (skill v1.6, thêm test 500k mẫu) và tính lại bằng `run-scenario.mjs --resume` (12:2x ICT) — không chạy lại JMeter. Đối chiếu DB lúc tính lại: backend vẫn chạy nhưng không còn request nào sau lượt, nên số đơn không đổi.

Tổng: 432 595 mẫu, lỗi 0 %, p95 165 ms, p99 367 ms, max 565 ms, 1 442,5 req/s; 30/30 cửa sổ 10 s khỏe, đỉnh 1 656,8 req/s. Checkout 71 981 = 71 981 đơn trong DB → KHỚP. CPU backend TB 8,1 % / max 10,7 % (thang 12 lõi ≈ 97–128 % một lõi; vượt 100 % vì sqlite3 chạy truy vấn trên threadpool của libuv). RAM 53,3 → 199,1 MB (đỉnh 259,1 MB).

| VU | req/s | p95 tổng | Avg | p95 checkout | p95 view-cart | Lỗi |
|---|---|---|---|---|---|---|
| 10 | 1 543 | 17 | 6,3 | 22 | 7 | 0 % |
| 20 | 1 411 | 34 | 14,0 | 43 | 16 | 0 % |
| 40 | 1 384 | 75 | 28,7 | 94 | 30 | 0 % |
| 80 | 1 482 | 169 | 53,7 | 196 | 48 | 0 % |
| 160 | 1 405 | 375 | 113,6 | 448 | 102 | 0 % |
(phần ổn định mỗi bậc: 10–60, 70–120, 130–180, 190–240, 250–300 s)

### Nhận xét
- **Bão hòa ngay từ bậc 10 VU:** throughput đứng ở ~1 400–1 550 req/s, thêm VU chỉ làm tăng độ trễ. Avg và p95 gần như nhân đôi mỗi lần nhân đôi VU (đúng định luật Little: thời gian chờ ≈ số VU / throughput). Không có lỗi: hệ thống không sập mà xếp hàng.
- **Năng lực ước tính của backend trên máy này ≈ 1 450 req/s** cho hỗn hợp request của workflow. Với workflow có think time (0,75 req/s mỗi VU, đo ở lượt `stress`), tương đương khoảng 1 900 người dùng đồng thời. Khớp với ngoại suy thô trước đó (~1 500 req/s, ~2 000 VU). Đây là ước tính, chưa chạy kiểm chứng ở 2 000 VU.
- **Chưa vượt ngưỡng phân tích p95 500 ms** ở 160 VU (375 ms). Theo xu hướng nhân đôi, p95 tổng sẽ qua 500 ms ở khoảng 200–220 VU không think time (ngoại suy, chưa đo).
- **`TXN checkout` là nút cổ chai:** chậm nhất ở mọi bậc (p95 448 ms, p99 501 ms ở 160 VU), vì mỗi lần ghi đi qua một kết nối sqlite duy nhất. Đây là endpoint chạm ngưỡng đầu tiên.
- **Giỏ hàng không được xóa:** RAM backend tăng 53 → 259 MB cùng 72 031 lần thêm vào giỏ, khớp với lỗi checkout không xóa `userCarts`. Tuy vậy p95 `view-cart` (7 → 102 ms) tăng cùng tỷ lệ với các label khác, nên ở quy mô 5 phút chưa tách được ảnh hưởng riêng của giỏ dài lên độ trễ; cần Soak để thấy rõ.
- **Máy kiểm thử:** ảnh tab Performance lúc 160 VU: CPU toàn máy 45 %, RAM toàn máy 89 % (13,7/15,4 GB). JMeter chạy cùng máy nên số liệu có thể bị ảnh hưởng nhẹ; CPU máy chưa bão hòa nên giới hạn chủ yếu ở backend.
