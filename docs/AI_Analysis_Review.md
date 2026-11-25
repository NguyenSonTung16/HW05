# AI Analysis Review (C5)

Ba mức phán quyết: Đúng, Sai, Không áp dụng được.

## 1. Phán quyết về các nhận định số liệu (từ C3)

| Nhóm nhận định của AI | Phán quyết | Bằng chứng |
|---|---|---|
| Tổng mẫu, p50–p99, Max, RPS trung bình của stress/spike/soak | Đúng | `summary.md`, bảng Tổng; tổng các cửa sổ 10 s bằng tổng mẫu |
| Mã 401/403 (29/30, 30/53, 59/120) và lỗi 0% | Đúng | Đếm `responseCode` và `success` trên toàn `.jtl`: không dòng nào success ≠ true |
| Điểm gãy: không gãy theo lỗi/p95, throughput bão hòa | Đúng | 30/30 và 42/42 cửa sổ khỏe; RPS phẳng quanh 1400–1500 khi tăng thread |
| Checkout chiếm ~44–45% thời gian; READ list chậm hơn detail/search | Đúng | `summary.md`, bảng Theo label (checkout p95 373/489 ms; list 159/373 ms) |
| CPU, RAM stress/soak/spike | Đúng | `node-usage.csv` (CPU TB 8,10%, max 10,7%; RAM max 259,1 MB) |
| Stress "RPS quanh 1390–1510" | Sai một phần | Đó là trung bình theo bậc; cửa sổ 10 s dao động 1302–1657 |
| Spike nền "37–39 RPS" | Sai một phần | Cửa sổ 30–110 s: 35,7–38,8 |
| Connect > 0 chỉ ở dòng login đầu | Sai | Toàn file: 318 (stress), 570 (spike), 3 658 (soak) dòng, ở READ, TXN, login |
| `allThreads = grpThreads + 1` luôn đúng | Sai | Toàn file có nhiều giá trị khác (ví dụ soak 919 dòng chênh 0) |
| Latency ≈ elapsed | Sai khi tổng quát | Lệch ở 3 091 (stress), 274 (spike), 466 (soak) dòng; chỉ đúng với 200 dòng đầu |
| "bảng orders 32 396 dòng" gây tăng độ trễ soak | Sai (nhầm khái niệm) | 32 396 là số mẫu checkout, không phải số dòng bảng `orders` |

Nguyên nhân chung của ba lỗi Connect, allThreads, Latency: AI chỉ có 200 dòng đầu nhưng khái quát cho cả lượt chạy.

## 2. Phán quyết về các đề xuất tối ưu (từ C4)

| Đề xuất của AI | Phán quyết | Bằng chứng |
|---|---|---|
| Chạy 2–4 tiến trình Node | Không áp dụng được ngay | `server.js` dòng 14 (`userCarts` trong bộ nhớ); `database.js` dòng 15–17 `DROP TABLE`, dòng 117 `initDatabase()` |
| Bật WAL cho checkout | Áp dụng được, cần đo lại | `database.js` không có PRAGMA |
| Gộp transaction / trừ kho trong checkout | Không áp dụng được (một phần bịa) | `server.js` dòng 297–309: chỉ một INSERT, không có bước trừ kho |
| Phân trang/cache READ list | Không có lợi ích hiện tại | `server.js` dòng 141–157; bảng `products` có 5 dòng |
| Soak dài hơn để đo RAM | Áp dụng được (chẩn đoán) | `node-usage.csv` chỉ có số đầu, cuối, max |

## 3. Kết luận

AI mạnh ở việc đọc số liệu tổng hợp, yếu ở việc khái quát từ mẫu nhỏ và đề xuất tối ưu không đối chiếu mã nguồn. Cần luôn kiểm số bằng dữ liệu gốc và đề xuất bằng mã trước khi tin.
