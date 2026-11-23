# Tóm tắt 23120399_Load_20261118.jtl
Tính bởi jtl-summary.mjs. Phân vị nearest-rank; throughput = samples / (lastEnd - firstStart); cửa sổ 0s → hết; đơn vị thời gian ms.

## Tổng
| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TOTAL | 93 | 0 | 2.7 | 2 | 4 | 5 | 40 | 40 | 5 | 1.6 | 200:82 401:11 |

## Theo nhóm
| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AUTH | 13 | 0 | 4.8 | 3 | 4 | 30 | 30 | 30 | 30 | 0.2 | 200:2 401:11 |
| READ | 41 | 0 | 1.8 | 2 | 2 | 3 | 3 | 3 | 3 | 0.7 | 200:41 |
| TXN | 39 | 0 | 2.9 | 1 | 5 | 5 | 40 | 40 | 5 | 0.7 | 200:39 |

## Theo label
| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AUTH login | 2 | 0 | 16.5 | 3 | 30 | 30 | 30 | 30 | 30 | 2.2 | 200:2 |
| AUTH login-wrong | 11 | 0 | 2.6 | 2 | 4 | 4 | 4 | 4 | 4 | 0.2 | 401:11 |
| READ detail | 13 | 0 | 1.7 | 2 | 2 | 2 | 2 | 2 | 2 | 0.3 | 200:13 |
| READ list | 15 | 0 | 1.7 | 2 | 3 | 3 | 3 | 3 | 3 | 0.3 | 200:15 |
| READ search | 13 | 0 | 1.9 | 2 | 3 | 3 | 3 | 3 | 3 | 0.3 | 200:13 |
| TXN add-cart | 13 | 0 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 0.3 | 200:13 |
| TXN checkout | 13 | 0 | 7.2 | 4 | 5 | 40 | 40 | 40 | 40 | 0.3 | 200:13 |
| TXN view-cart | 13 | 0 | 0.5 | 1 | 1 | 1 | 1 | 1 | 1 | 0.3 | 200:13 |

## Ổn định (cửa sổ 10s; khỏe = lỗi ≤ 1% và p95 ≤ 1000 ms)
- Cửa sổ khỏe: 6/6; RPS cao nhất trong cửa sổ khỏe: 1.7
- Cửa sổ vi phạm đầu tiên: không có

| Từ (s) | Đến (s) | Mẫu | RPS | Lỗi % | p95 | Avg | Threads |
|---|---|---|---|---|---|---|---|
| 0 | 10 | 16 | 1.6 | 0 | 40 | 6 | 3 |
| 10 | 20 | 16 | 1.6 | 0 | 5 | 2.4 | 3 |
| 20 | 30 | 17 | 1.7 | 0 | 4 | 1.6 | 3 |
| 30 | 40 | 14 | 1.4 | 0 | 4 | 1.9 | 3 |
| 40 | 50 | 16 | 1.6 | 0 | 5 | 2.1 | 3 |
| 50 | 60 | 14 | 1.4 | 0 | 5 | 1.8 | 3 |

## Lỗi (label | mã | thông điệp → số lần, dòng đầu tiên trong .jtl)
- Không có

## Tài nguyên backend (node-usage.csv, 68 mẫu)
- CPU trung bình 0% / tối đa 0.4% (chia theo 12 lõi)
- RAM (working set) đầu 55.4 MB, cuối 57.3 MB, đỉnh 57.3 MB

## Đối chiếu DB
- `TXN checkout` thành công trong .jtl: 13/13
- `SELECT COUNT(*) AS n FROM orders` → 13
- Kết luận: **KHỚP**
