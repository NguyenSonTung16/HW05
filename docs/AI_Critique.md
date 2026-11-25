# AI Critique

Trong bài này AI đọc số liệu tổng hợp khá tốt nhưng sai khi khái quát. Khi phân tích kết quả, AI chỉ có 200 dòng đầu của mỗi file `.jtl`, vậy mà nó khẳng định rằng cột Connect chỉ có giá trị ở dòng login đầu, `allThreads` luôn bằng `grpThreads + 1` và Latency gần bằng elapsed. Khi mình đếm lại trên toàn file thì cả ba đều sai: Connect lớn hơn 0 ở hàng trăm đến hàng nghìn dòng, ở cả READ và TXN. AI cũng nhầm 32 396 mẫu checkout thành số dòng của bảng `orders`.

Ở phần tối ưu, AI đề xuất chạy nhiều tiến trình Node, gộp transaction và trừ kho, phân trang danh sách. Đối chiếu mã nguồn cho thấy giỏ hàng nằm trong bộ nhớ và `initDatabase()` xóa bảng khi khởi động nên không chạy nhiều tiến trình được, checkout chỉ có một INSERT và không có bước trừ kho, còn bảng sản phẩm chỉ có 5 dòng nên phân trang không có lợi ích.

AI không bắt được những lỗi này vì nó suy diễn theo mẫu quen thuộc của JMeter thay vì giới hạn mình trong dữ liệu được đưa, và nó không có mã nguồn của SUT. Khi sinh plan cũng vậy: AI chọn đăng nhập lại mỗi vòng, dùng chung CSV và đặt cứng 50 VU.

Nguyên tắc rút ra: giao cho AI phần diễn giải, còn số liệu và nhận định về dữ liệu phải do script tính từ dữ liệu thô rồi đối chiếu từng điểm. Cần nói rõ phạm vi dữ liệu đã đưa cho AI, và đếm lại trên toàn file mọi khẳng định tổng quát. Mọi đề xuất kỹ thuật phải được kiểm bằng mã nguồn trước khi tin.
