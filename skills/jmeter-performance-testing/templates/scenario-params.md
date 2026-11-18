# Chọn tham số kịch bản (giá trị ban đầu là DỰ ĐOÁN, hiệu chỉnh sau smoke)

## Bước 0: smoke
`threads=2 rampup=10 duration=60`. Mục tiêu: mọi sampler pass, không lỗi assertion, biết thời gian một vòng workflow (T_iter ≈ tổng thời gian đáp ứng + tổng think time).

## Cách ước lượng số VU từ mục tiêu RPS
RPS_workflow ≈ VU × số_request_mỗi_vòng / T_iter. Với template v1.4: đăng nhập 1 lần/VU, mỗi vòng 6 request (3 READ + 3 TXN), think 1–3 s trước 4 bước (trung bình 2 s × 4 = 8 s) → T_iter ≈ 8 s + tổng thời gian đáp ứng đo ở smoke. Ghi phép tính này (với số đo smoke thật) vào báo cáo khi chọn số VU. Số VU ≤ số tài khoản trong users.csv.

## Load (tải mong đợi)
- Mục tiêu: hành vi ở tải bình thường. Ramp-up đủ dài để không thành spike (≥ 1 giây/VU với tải nhỏ, thường 60–120 s), giữ tải ≥ 5 phút, think time khác 0.
- Mặc định gợi ý: `threads=50 rampup=60 duration=420` (60 s ramp + 6 phút giữ).
- Chỉ số: p95 theo nhóm, lỗi % ≈ 0, RPS ổn định.

## Stress (tăng bậc đến khi gãy)
Không cần plugin: nhân bản Thread Group workflow thành N bậc; mỗi bậc thêm VU và **chạy đến hết bài** (duration giảm dần theo delay):

| Bậc | threads | delay (s) | rampup (s) | duration (s) | Tổng VU sau bậc |
|---|---|---|---|---|---|
| 1 | 25 | 0 | 30 | 900 | 25 |
| 2 | 25 | 180 | 30 | 720 | 50 |
| 3 | 50 | 360 | 30 | 540 | 100 |
| 4 | 100 | 540 | 30 | 360 | 200 |
| 5 | 200 | 720 | 30 | 180 | 400 |

Dừng phân tích ở bậc đầu tiên có lỗi > 5% hoặc p95 vượt ngưỡng đã chọn (ghi rõ ngưỡng). `jtl-summary.mjs --bucket 30 --p95-limit <ms>` chỉ ra cửa sổ đầu tiên vi phạm và số thread lúc đó. Có thể giảm think time ở Stress nhưng phải ghi lý do.

## Spike (tăng đột ngột)
Hai Thread Group: nền `threads=10 delay=0 rampup=10 duration=420`; đỉnh `threads=300 delay=120 rampup=5 duration=60`. Đo: lỗi và p95 trong cửa sổ đỉnh, thời gian hồi phục sau đỉnh (`--bucket 10`).

## Soak / ngưỡng bền (10–15 phút)
Tải cố định ≈ 70–80% mức VU ở bậc ổn định cuối cùng của Stress; `duration=600–900`. Theo dõi xu hướng RAM (`node-usage.csv`): RAM tăng đều mà không giảm là dấu hiệu rò rỉ / dữ liệu tích lũy trong bộ nhớ.

## Nhánh khóa tài khoản
`lock_threads=1 lock_think_ms=5000`: đủ để đo hành vi khóa dưới tải mà không làm méo số liệu workflow. Tài khoản `lock*` không bao giờ dùng trong workflow.

## Lệnh chạy mẫu
`node run-scenario.mjs --plan perf/plans/23120399_Load_20261119.jmx --out perf/results/load -J threads=50 -J rampup=60 -J duration=420`
