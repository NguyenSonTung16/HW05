# P4 – Stress phụ không think time (`stress-nothink`), chưa chạy

## Vì sao cần
Hai lượt `stress`/`stress2` cho throughput tăng đúng 0,75 req/s mỗi VU (6 request / ~8 s think time) và không gãy tới 400 VU: tải bị giới hạn bởi kịch bản, chưa chạm giới hạn backend. Skill cho phép giảm think time ở Stress nếu ghi lý do; lý do ở đây có số liệu.

## Cấu hình (cùng plan `23120399_Stress_20261123.jmx`, chỉ khác tham số -J, ghi lại trong `run-meta.json`)
- `think_min_ms=0`, `think_range_ms=0`: mỗi VU gửi request liên tục.
- 5 bậc cộng dồn 10 → 20 → 40 → 80 → 160 VU, mỗi bậc 60 s, ramp-up 10 s, `total_duration=300` (5 phút).
- Lý do bậc nhỏ hơn bản chính: không có think time thì vài chục VU đã đủ đẩy một tiến trình Node đến bão hòa.
- Lý do 5 phút: ước tính 1 000–3 000 req/s × 300 s ≈ 0,3–0,9 triệu dòng .jtl (~145 byte/dòng ⇒ 45–130 MB); dài hơn sẽ vượt giới hạn 100 MB/file của GitHub.

## Cách đọc kết quả (chốt trước khi chạy)
- **Điểm bão hòa** = bậc mà throughput thôi tăng khi thêm VU (đầu gối đồ thị). Theo định luật Little, sau điểm này p95 tăng gần tỷ lệ với số VU.
- Ngưỡng phân tích giữ nguyên: p95 500 ms hoặc lỗi 5 % (`--bucket 10 --p95-limit 500 --err-limit 5`). Có thể không bậc nào vượt 500 ms dù đã bão hòa; khi đó báo cáo điểm bão hòa theo throughput.
- **Yếu tố gây nhiễu đã biết:** `POST /api/checkout` không xóa giỏ (`userCarts[userId].push` ở `server.js` dòng 293, không có chỗ xóa). Không có think time, mỗi VU lặp hàng nghìn vòng nên giỏ dài ra liên tục và `GET /api/cart` trả JSON ngày càng lớn. Nếu `TXN view-cart` chậm dần theo thời gian trong cùng một bậc thì đó là do lỗi này, không phải do số VU. Phân tích sẽ tách `view-cart` ra khỏi các label khác.
- JMeter chạy cùng máy với backend; chụp thêm tab Performance (CPU toàn máy) để phân biệt máy nghẽn hay backend nghẽn.
