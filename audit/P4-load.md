# P4 – Plan Load do AI sinh (CHƯA REVIEW, CHƯA CHẠY)
Thời gian: 2026-11-18 11:47 (UTC+07:00). Prompt của sinh viên: "P4: sinh plan Load". Model: Claude Opus 5.5.
File: `perf/plans/23120399_Load_20261118.jmx`, sinh từ `skills/jmeter-performance-testing/templates/plan.template.jmx` (v1.3). Khác template đúng 6 dòng: tên Test Plan, ghi chú, mặc định `threads`, `rampup`, `duration` (hai Thread Group).

## Tham số (DỰ ĐOÁN, hiệu chỉnh sau smoke)
| Tham số | Giá trị | Lý do |
|---|---|---|
| threads | 50 VU | Cửa hàng demo nhỏ; 50 người mua đồng thời là mức "bình thường" giả định. Chưa có số liệu lưu lượng thật của SUT để dựa vào, nên con số này cần smoke xác nhận máy chịu được nhẹ nhàng. |
| rampup | 60 s | Khoảng 1,2 s thêm một VU: tăng dần, không thành spike. |
| duration | 420 s | 60 s ramp-up + 6 phút giữ tải (đề và skill yêu cầu Load ≥ 5 phút). |
| think time | 1000 + ngẫu nhiên 0–2000 ms trước mỗi request | Mô phỏng thời gian đọc trang; Load không được để think time 0. |
| lockout-probe | 1 VU, 1 lần / 5 s | Đo hành vi khóa dưới tải mà không làm lệch số liệu workflow. |
| report view | Summary Report | Plan Stress dùng Aggregate Report, Spike dùng View Results Tree (chỉ lỗi). |

## Ước lượng tải (để đối chiếu sau khi chạy)
- Một vòng = 7 request, mỗi request chờ trung bình 2 s → T_vòng ≈ 14 s + thời gian đáp ứng (dự đoán < 0,5 s tổng) ≈ 14,5 s.
- Thông lượng workflow khi đủ 50 VU ≈ 50 × 7 / 14,5 ≈ **24 req/s**; nhánh lockout thêm 0,2 req/s.
- Trong 6 phút giữ tải: ≈ 8.700 mẫu, ≈ 1.240 đơn hàng mới, ≈ 1.240 lần đăng nhập đúng.
- Phân tích giai đoạn giữ tải: `jtl-summary.mjs <jtl> --from-sec 60 --to-sec 420`.

## Điểm AI tự nêu để sinh viên soi khi review (P5)
1. Mỗi vòng đăng nhập lại: nhóm auth chịu tải theo số phiên. Nếu coi người dùng thật đăng nhập một lần rồi mua nhiều lần thì tỉ lệ này cao hơn thực tế.
2. CSV `users.csv` dùng chung cho mọi VU (`shareMode.all`, đọc lần lượt): với 100 tài khoản và 50 VU, hai VU có thể dùng cùng tài khoản cùng lúc; giỏ hàng trong bộ nhớ của tài khoản đó bị hai VU cùng ghi.
3. Think time đặt ở mức Thread Group nên cũng chờ trước `AUTH login` đầu vòng.
4. Con số 50 VU chưa có căn cứ đo; smoke sẽ cho thời gian đáp ứng thật để tính lại.
5. Assertion checkout chỉ kiểm có `orderId`, không kiểm đơn có thật trong DB.

## Cách chạy (CHỈ sau khi sinh viên duyệt plan)
Trước mỗi lượt: đóng cửa sổ backend → `tools\start-backend.bat` → chờ `http://localhost:3000/api/products` → `node skills\jmeter-performance-testing\scripts\prepare-data.mjs --accounts-only`.
- Smoke (1 phút, 2 VU): `node skills\jmeter-performance-testing\scripts\run-scenario.mjs --plan perf\plans\23120399_Load_20261118.jmx --out perf\results\smoke-load -J threads=2 -J rampup=10 -J duration=60`
- Load thật (sau khi hiệu chỉnh): `node skills\jmeter-performance-testing\scripts\run-scenario.mjs --plan perf\plans\23120399_Load_20261118.jmx --out perf\results\load`
