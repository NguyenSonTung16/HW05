# Checklist review plan do AI sinh (P5)
Mỗi mục: Đạt / Không đạt / Không áp dụng, kèm dẫn chứng (dòng trong .jmx hoặc kết quả smoke). Mục không đạt ghi vào `audit/P5-review-findings.md` với: AI sai gì, vì sao (prompt, giới hạn model, đặc tính endpoint), sửa thế nào.

## Hồ sơ tải
- [ ] Ramp-up hợp lý (Load không thành spike; Spike thật sự đột ngột).
- [ ] Think time khác 0 ở Load/Soak; nếu Stress bỏ think time thì có lý do.
- [ ] Số thread phù hợp phần cứng (dựa trên smoke), không phải con số "tròn" vô căn cứ.
- [ ] Thời gian giữ tải đủ dài (Load ≥ 5 phút, Soak 10–15 phút); duration của các bậc Stress đúng phép tính.
- [ ] Không có Loop Count cố định làm kết thúc sớm khi đã dùng scheduler.

## Workflow và dữ liệu
- [ ] Workflow phủ đủ các nhóm endpoint; nhãn có tiền tố nhóm.
- [ ] CSV đúng tên cột, đủ dòng, recycle/shareMode đúng ý đồ; dữ liệu không chứa ký tự làm vỡ JSON.
- [ ] Token lấy bằng extractor và gửi đúng định dạng (`Bearer <token>`); có giá trị mặc định để lộ lỗi khi không lấy được.
- [ ] Tài khoản workflow không bao giờ nhập sai; nhánh khóa dùng tài khoản riêng.
- [ ] Hiểu đúng cơ chế khóa của SUT (ngưỡng thật, thời gian khóa, mã trả về), không giả định theo tài liệu.
- [ ] Dữ liệu tích lũy theo tải (đơn hàng, giỏ trong bộ nhớ) có kế hoạch reset.

## Assertion
- [ ] Mỗi sampler kiểm mã trạng thái **và** nội dung (token, orderId, đúng id sản phẩm...).
- [ ] Không chấp nhận 3xx/401/403/5xx như thành công (trừ nhánh đăng nhập sai: chỉ 401/403).
- [ ] Không có assertion "luôn đúng" (ví dụ chỉ kiểm body không rỗng).

## Báo cáo và chạy
- [ ] Mỗi plan đúng một listener, ba plan ba loại khác nhau; View Results Tree chỉ ghi lỗi.
- [ ] Tên file `{MSSV}_{Scenario}_{YYYYMMDD}.jmx`.
- [ ] Chạy non-GUI, `.jtl` dạng CSV có header, xuất HTML dashboard.
- [ ] Timeout kết nối/đáp ứng được đặt (không treo vô hạn).
