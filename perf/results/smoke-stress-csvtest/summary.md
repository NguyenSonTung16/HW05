# Tóm tắt 23120399_Stress_20261123.jtl
Tính bởi jtl-summary.mjs. Phân vị nearest-rank; throughput = samples / (lastEnd - firstStart); cửa sổ 0s → hết; đơn vị thời gian ms.

## Tổng
| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TOTAL | 103 | 0 | 2.8 | 2 | 4 | 5 | 39 | 50 | 5 | 2.6 | 200:96 401:7 |

## Theo nhóm
| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AUTH | 11 | 0 | 6.3 | 3 | 4 | 39 | 39 | 39 | 39 | 0.3 | 200:4 401:7 |
| READ | 49 | 0 | 1.7 | 2 | 2 | 2 | 3 | 3 | 2 | 1.3 | 200:49 |
| TXN | 43 | 0 | 3.1 | 1 | 5 | 5 | 50 | 50 | 5 | 1.3 | 200:43 |

## Theo label
| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AUTH login | 4 | 0 | 12.3 | 3 | 39 | 39 | 39 | 39 | 39 | 0.3 | 200:4 |
| AUTH login-wrong | 7 | 0 | 2.9 | 3 | 4 | 4 | 4 | 4 | 4 | 0.2 | 401:7 |
| READ detail | 15 | 0 | 1.7 | 2 | 2 | 2 | 2 | 2 | 2 | 0.5 | 200:15 |
| READ list | 17 | 0 | 1.7 | 2 | 2 | 3 | 3 | 3 | 3 | 0.5 | 200:17 |
| READ search | 17 | 0 | 1.8 | 2 | 2 | 3 | 3 | 3 | 3 | 0.5 | 200:17 |
| TXN add-cart | 15 | 0 | 1.1 | 1 | 2 | 2 | 2 | 2 | 2 | 0.5 | 200:15 |
| TXN checkout | 13 | 0 | 7.9 | 4 | 5 | 50 | 50 | 50 | 50 | 0.5 | 200:13 |
| TXN view-cart | 15 | 0 | 0.8 | 1 | 1 | 1 | 1 | 1 | 1 | 0.5 | 200:15 |

## Ổn định (cửa sổ 10s; khỏe = lỗi ≤ 1% và p95 ≤ 1000 ms)
- Cửa sổ khỏe: 4/4; RPS cao nhất trong cửa sổ khỏe: 3.4
- Cửa sổ vi phạm đầu tiên: không có

| Từ (s) | Đến (s) | Mẫu | RPS | Lỗi % | p95 | Avg | Threads |
|---|---|---|---|---|---|---|---|
| 0 | 10 | 13 | 1.3 | 0 | 50 | 8.8 | 4 |
| 10 | 20 | 23 | 2.3 | 0 | 4 | 2.1 | 5 |
| 20 | 30 | 33 | 3.3 | 0 | 5 | 1.8 | 5 |
| 30 | 40 | 34 | 3.4 | 0 | 5 | 1.8 | 5 |

## Lỗi (label | mã | thông điệp → số lần, dòng đầu tiên trong .jtl)
- Không có

## Tài nguyên backend (node-usage.csv, 46 mẫu)
- CPU trung bình 0% / tối đa 0.1% (chia theo 12 lõi)
- RAM (working set) đầu 51.6 MB, cuối 54 MB, đỉnh 54 MB
