# Prompt chuẩn cho AI phân tích .jtl (P8)
Dùng trong một phiên AI riêng. Lưu nguyên văn prompt và câu trả lời vào audit. KHÔNG đưa cho AI bảng `summary.md` do script tính (để kiểm tra AI tự đọc số có đúng không); chỉ đưa file `.jtl` (hoặc phần đầu + số dòng nếu quá lớn), `run-meta.json` và `node-usage.csv`.

---
Bạn là kỹ sư kiểm thử hiệu năng. Đính kèm là kết quả JMeter thô (`.jtl`, CSV có header) của kịch bản <Load|Stress|Spike|Soak> trên API <tên SUT>, cùng thông tin máy (`run-meta.json`) và CPU/RAM của tiến trình backend theo giây (`node-usage.csv`).
Hồ sơ tải: <threads, ramp-up, duration, think time, các bậc nếu có>.
Nhãn sampler có tiền tố nhóm: AUTH (đăng nhập), READ (đọc sản phẩm), TXN (giỏ hàng, đặt hàng).

1. Với từng nhãn và từng nhóm: số mẫu, tỉ lệ lỗi, trung bình, p90, p95, p99, max, throughput (req/s). Nói rõ bạn tính throughput trên khoảng thời gian nào.
2. Mô tả diễn biến theo thời gian (tăng tải, điểm bắt đầu suy giảm, hồi phục) và liên hệ với CPU/RAM của backend.
3. Liệt kê các mã lỗi và thông điệp lỗi, phân biệt lỗi do SUT, do dữ liệu test, do giới hạn máy tải.
4. Đề xuất ngưỡng hiệu năng (SLO) cho từng nhóm, có lý do.
5. Đề xuất tối ưu cho SUT (cụ thể, gắn với endpoint), mỗi đề xuất nêu bằng chứng trong dữ liệu.
Ghi rõ chỗ nào bạn suy đoán chứ không đọc được từ dữ liệu.
---

## Sau khi AI trả lời
Đối chiếu từng con số với `summary.json` (cùng cửa sổ thời gian) và dòng `.jtl` gốc. Lỗi hay gặp cần soi: nhầm trung bình với p95; tính RPS gồm cả thời gian ramp-up; gộp/loại mẫu lỗi khi tính thời gian đáp ứng; nhầm `elapsed` với `Latency`/`Connect`; đọc `allThreads` là số người dùng đồng thời thật; gán nguyên nhân CPU khi máy tải cũng là máy chạy SUT; đề xuất tối ưu không khớp kiến trúc thật (ví dụ connection pool cho SQLite một file, index cho `LIKE '%x%'`).

## Kiểm cột trên toàn file (v2)
Khi đưa cho AI chỉ phần đầu `.jtl`, AI hay khái quát sai. Đếm lại trên toàn file (cột theo thứ tự chuẩn: 2 elapsed, 3 label, 4 responseCode, 8 success, 12 grpThreads, 13 allThreads, 15 Latency, 16 IdleTime, 17 Connect):
```
awk -F, 'NR>1{n++; if($17>0)c++; if($15!=$2)l++; if($16!=0)i++; if($8!="true")f++; d[$13-$12]++} END{print n,"Connect>0:",c+0,"Latency!=elapsed:",l+0,"IdleTime!=0:",i+0,"success!=true:",f+0; for(k in d)print "allThreads-grpThreads="k,d[k]}' file.jtl
```
Lưu ý: awk cắt theo dấu phẩy nên chỉ đúng khi `responseMessage`, `failureMessage` không chứa dấu phẩy; nếu có, dùng script có parser CSV.
Trong prompt gửi AI, nêu rõ phạm vi dữ liệu đã đưa (ví dụ "200 dòng đầu") và yêu cầu AI đánh dấu mọi nhận định chỉ dựa trên phần đó.
