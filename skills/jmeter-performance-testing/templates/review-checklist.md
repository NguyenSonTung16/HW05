# Checklist review plan do AI sinh (P5)
Mỗi mục: Đạt / Không đạt / Không áp dụng, kèm dẫn chứng (dòng trong .jmx hoặc kết quả smoke). Mục không đạt ghi vào `audit/P5-review-findings.md` với: AI sai gì, vì sao (prompt, giới hạn model, đặc tính endpoint), sửa thế nào.

## Hồ sơ tải
- [ ] Ramp-up hợp lý (Load không thành spike; Spike thật sự đột ngột).
- [ ] Think time khác 0 ở Load/Soak, đặt đúng chỗ người dùng thật dừng lại (xem hàng, trước thanh toán), không chờ trước đăng nhập; nếu Stress bỏ think time thì có lý do.
- [ ] Số thread phù hợp phần cứng (dựa trên smoke), không phải con số "tròn" vô căn cứ.
- [ ] Thời gian giữ tải đủ dài (Load ≥ 5 phút, Soak 10–15 phút); duration của các bậc Stress đúng phép tính.
- [ ] Không có Loop Count cố định làm kết thúc sớm khi đã dùng scheduler.

## Workflow và dữ liệu
- [ ] Workflow phủ đủ các nhóm endpoint; nhãn có tiền tố nhóm.
- [ ] CSV đúng tên cột, đủ dòng, recycle/shareMode đúng ý đồ; dữ liệu không chứa ký tự làm vỡ JSON.
- [ ] Mô hình phiên đúng thực tế: đăng nhập một lần/VU rồi lặp duyệt và mua (Once Only Controller), không đăng nhập lại mỗi vòng nếu không có lý do.
- [ ] Mỗi VU một tài khoản riêng (CSV không recycle hoặc đọc 1 lần/VU), số VU ≤ số tài khoản; không để hai VU dùng chung trạng thái theo người dùng (giỏ hàng...).
- [ ] Token lấy bằng extractor và gửi đúng định dạng (`Bearer <token>`); có giá trị mặc định để lộ lỗi khi không lấy được.
- [ ] Tài khoản workflow không bao giờ nhập sai; nhánh khóa dùng tài khoản riêng.
- [ ] Hiểu đúng cơ chế khóa của SUT (ngưỡng thật, thời gian khóa, mã trả về), không giả định theo tài liệu.
- [ ] Dữ liệu tích lũy theo tải (đơn hàng, giỏ trong bộ nhớ) có kế hoạch reset.

## Assertion
- [ ] Mỗi sampler kiểm mã trạng thái **và** nội dung (token, orderId, đúng id sản phẩm...).
- [ ] Không chấp nhận 3xx/401/403/5xx như thành công (trừ nhánh đăng nhập sai: chỉ 401/403, và assertion phải bật **Ignore Status**, nếu không JMeter vẫn tính mẫu 4xx là lỗi).
- [ ] Thao tác ghi (đặt hàng...) được đối chiếu với dữ liệu lưu thật sau khi chạy (`run-scenario.mjs --verify-db`).
- [ ] Không có assertion "luôn đúng" (ví dụ chỉ kiểm body không rỗng).

## Báo cáo và chạy
- [ ] Mỗi plan đúng một listener, ba plan ba loại khác nhau; View Results Tree chỉ ghi lỗi.
- [ ] Tên file `{MSSV}_{Scenario}_{YYYYMMDD}.jmx`.
- [ ] Chạy non-GUI, `.jtl` dạng CSV có header, xuất HTML dashboard.
- [ ] Timeout kết nối/đáp ứng được đặt (không treo vô hạn).
