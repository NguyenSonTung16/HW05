# Tóm tắt 23120399_Spike_20261123.jtl
Tính bởi jtl-summary.mjs. Phân vị nearest-rank; throughput = samples / (lastEnd - firstStart); cửa sổ 0s → hết; đơn vị thời gian ms.

## Tổng
| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TOTAL | 21890 | 0 | 2.5 | 1 | 6 | 8 | 9 | 45 | 8 | 562.1 | 200:21883 401:7 |

## Theo nhóm
| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AUTH | 13 | 0 | 7.4 | 3 | 11 | 45 | 45 | 45 | 45 | 0.4 | 200:6 401:7 |
| READ | 10940 | 0 | 2 | 1 | 5 | 6 | 7 | 13 | 6 | 300.2 | 200:10940 |
| TXN | 10937 | 0 | 3 | 1 | 8 | 8 | 10 | 38 | 8 | 319.8 | 200:10937 |

## Theo label
| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AUTH login | 6 | 0 | 10.8 | 3 | 45 | 45 | 45 | 45 | 45 | 0.5 | 200:6 |
| AUTH login-wrong | 7 | 0 | 4.4 | 3 | 11 | 11 | 11 | 11 | 11 | 0.2 | 401:7 |
| READ detail | 3646 | 0 | 1.4 | 1 | 2 | 3 | 4 | 11 | 3 | 110.2 | 200:3646 |
| READ list | 3648 | 0 | 3.4 | 3 | 6 | 7 | 8 | 13 | 7 | 101 | 200:3648 |
| READ search | 3646 | 0 | 1.3 | 1 | 2 | 2 | 4 | 12 | 2 | 111.1 | 200:3646 |
| TXN add-cart | 3646 | 0 | 1.1 | 1 | 2 | 2 | 3 | 16 | 2 | 110.2 | 200:3646 |
| TXN checkout | 3645 | 0 | 6.6 | 7 | 9 | 10 | 11 | 38 | 10 | 113.3 | 200:3645 |
| TXN view-cart | 3646 | 0 | 1.3 | 1 | 2 | 2 | 3 | 7 | 2 | 110.2 | 200:3646 |

## Ổn định (cửa sổ 10s; khỏe = lỗi ≤ 1% và p95 ≤ 1000 ms)
- Cửa sổ khỏe: 4/4; RPS cao nhất trong cửa sổ khỏe: 1421.4
- Cửa sổ vi phạm đầu tiên: không có

| Từ (s) | Đến (s) | Mẫu | RPS | Lỗi % | p95 | Avg | Threads |
|---|---|---|---|---|---|---|---|
| 0 | 10 | 144 | 14.4 | 0 | 4 | 1.9 | 4 |
| 10 | 20 | 14214 | 1421.4 | 0 | 8 | 2.5 | 7 |
| 20 | 30 | 7514 | 751.4 | 0 | 7 | 2.5 | 7 |
| 30 | 40 | 18 | 1.8 | 0 | 4 | 1.4 | 3 |

## Lỗi (label | mã | thông điệp → số lần, dòng đầu tiên trong .jtl)
- Không có

## Tài nguyên backend (node-usage.csv, 45 mẫu)
- CPU trung bình 2.6% / tối đa 9.6% (chia theo 12 lõi)
- RAM (working set) đầu 71 MB, cuối 180.3 MB, đỉnh 183.9 MB

## Đối chiếu DB
- `TXN checkout` thành công trong .jtl: 3645/3645
- `SELECT COUNT(*) AS n FROM orders` → 3645
- Kết luận: **KHỚP**
