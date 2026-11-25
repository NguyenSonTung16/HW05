# Prompt phân tích kết quả JMeter (C2 – HW05)

Dán nguyên văn phần dưới đây vào một phiên AI mới, cùng với các file đính kèm. Không thêm ngữ cảnh nào khác.

---

Bạn là kỹ sư kiểm thử hiệu năng. Bạn sẽ phân tích kết quả chạy JMeter của một ứng dụng web thương mại điện tử (EShop, backend Node.js/Express, cơ sở dữ liệu SQLite). Dữ liệu đính kèm gồm:

- Các file `.md` tóm tắt, tạo bởi một script tính phân vị theo phương pháp nearest-rank từ file `.jtl`.
- Dòng tiêu đề và khoảng 200 dòng đầu của file `.jtl` gốc (định dạng CSV của JMeter).
- File `summary.md` và `run-meta.json` của từng kịch bản.

Có ba kịch bản: Stress (tăng tải theo bậc, không có thời gian suy nghĩ giữa các thao tác), Spike (tăng đột ngột lên đỉnh rồi hạ xuống) và Soak (tải ổn định lâu).

Hãy làm theo các bước sau và trả lời bằng tiếng Việt.

1. **Đọc cấu trúc dữ liệu.** Liệt kê các cột trong `.jtl` mà bạn thấy và ý nghĩa của từng cột dùng cho phân tích (ví dụ `timeStamp`, `elapsed`, `label`, `responseCode`, `success`, `Latency`, `allThreads`). Nếu có cột nào bạn không chắc ý nghĩa, nói rõ.

2. **Tính các chỉ số cho từng kịch bản** từ dữ liệu đính kèm: tổng số mẫu, tỉ lệ lỗi, p50, p90, p95, p99, thông lượng (req/s) trung bình và theo cửa sổ thời gian. Với mỗi số, ghi rõ bạn lấy từ dòng hoặc cột nào, hoặc tính theo công thức nào. Nếu một số không thể tính từ dữ liệu được cung cấp, ghi "không đủ dữ liệu" thay vì ước lượng.

3. **Xác định điểm gãy** trong kịch bản Stress và Spike, nếu có. Nêu tiêu chí bạn dùng (ví dụ p95 vượt ngưỡng, tỉ lệ lỗi vượt ngưỡng, thông lượng không tăng theo tải). Nếu không có điểm gãy trong dữ liệu, nói rõ.

4. **Đề xuất ngưỡng** cho từng kịch bản: ngưỡng p95 (ms), ngưỡng tỉ lệ lỗi (%), và ngưỡng thông lượng nếu có ý nghĩa. Với mỗi ngưỡng, nêu lý do dựa trên dữ liệu và nêu rủi ro nếu chọn quá chặt hoặc quá lỏng.

5. **Đề xuất tối ưu hiệu năng** tối đa 5 mục, xếp theo mức ưu tiên. Với mỗi mục, nêu: vấn đề bạn thấy trong dữ liệu, giả thuyết nguyên nhân, cách kiểm chứng bằng chính dữ liệu này hoặc một lần chạy thêm, và mức độ chắc chắn của bạn.

6. **Điều không chắc chắn.** Liệt kê những chỗ bạn không chắc, và những gì bạn cần thêm để kết luận chắc hơn.

Quy tắc:
- Chỉ dùng số liệu có trong dữ liệu đính kèm. Không bịa số, không suy đoán số liệu của các dòng không được cung cấp.
- Nếu bạn phát hiện mâu thuẫn trong dữ liệu, nêu rõ mâu thuẫn thay vì chọn một bên.
- Trình bày kết quả chính bằng bảng, phần lập luận bằng văn xuôi ngắn.

---
