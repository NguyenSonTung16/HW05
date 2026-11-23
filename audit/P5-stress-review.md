# P5 – Review plan Stress của sinh viên (2026-11-23 10:53)

Plan: `perf/plans/23120399_Stress_20261123.jmx`. Sinh viên nêu 5 điểm; dưới đây là cách xử lý và đánh giá trung thực về phần AI.

| # | Sinh viên nêu | Đánh giá | Xử lý |
|---|---|---|---|
| 1 | `users.csv` chỉ có 100 tài khoản, không đủ 400 VU | Đúng. AI có nhắc ở P4 nhưng chỉ như một câu hỏi, không chặn việc chạy. Nếu chạy luôn thì 300 VU tự dừng ở EOF, lặp lại lỗi của lượt `load` (threads=500). | Khởi động lại backend, chạy `prepare-data.mjs --out perf\data --users 500 --force` trước khi chạy. Ghi cho skill v2: `run-scenario.mjs` nên tự kiểm tra tổng VU ≤ số dòng `users.csv`. |
| 2 | Mỗi Thread Group đọc CSV riêng nên có thể trùng tài khoản giữa các bậc | Một phần. 5 phần tử CSV Data Set cùng đường dẫn `${DATA_DIR}/users.csv` và `shareMode.all`; theo tài liệu JMeter, chế độ "All threads" dùng chung một con trỏ đọc file cho mọi thread của mọi Thread Group, nên về lý thuyết không trùng. Nhưng đây mới là lập luận, chưa có bằng chứng. | Kiểm chứng bằng thực nghiệm: `perf/data-csvtest/users.csv` chỉ có 4 tài khoản, chạy 5 bậc × 2 VU = 10 VU. Nếu dùng chung: đúng 4 mẫu `AUTH login`, 6 VU dừng ở EOF. Nếu mỗi bậc đọc riêng: 10 mẫu, có tài khoản trùng. Nếu kết quả khác 4 thì đổi sang chia file theo bậc. |
| 3 | Assertion `40[13]` cần kiểm tra chính xác 401 hoặc 403 | Về hành vi, `test_type=1` trong JMeter là "Matches" (khớp toàn bộ chuỗi theo regex), nên `40[13]` vốn đã chỉ nhận đúng 401 hoặc 403. Tuy vậy ý đồ khó đọc khi review, và tên assertion không nói rõ chế độ so khớp. | Đổi sang `Equals + OR` (`test_type=40`) với hai giá trị `401`, `403`; giữ Ignore Status. Plan Load đã chạy giữ nguyên vì hành vi tương đương; template skill cập nhật ở v2. |
| 4 | Chốt p95 500 ms là ngưỡng phân tích hay ngưỡng dừng chạy | Đúng, P4 để mơ hồ. | Chốt là ngưỡng PHÂN TÍCH (cùng lỗi 5 %): plan không tự dừng, luôn chạy đủ 900 s; `jtl-summary.mjs --bucket 30 --p95-limit 500 --err-limit 5` chỉ ra cửa sổ vi phạm đầu tiên và số VU lúc đó. Ghi vào mô tả TestPlan. |
| 5 | Ghi chú bậc 5 chỉ 3 phút nên chỉ đủ thấy dấu hiệu ban đầu | Đúng. | Ghi vào mô tả TestPlan và sẽ ghi trong báo cáo: kết quả ở 400 VU chỉ là dấu hiệu ban đầu, không kết luận độ ổn định. |

## Kết quả phép thử chia sẻ CSV (10:57, `perf/results/smoke-stress-csvtest/`)
- `users.csv` thử có 4 tài khoản; 5 bậc × 2 VU = 10 VU.
- `AUTH login` = **4** mẫu, mỗi bậc 1–4 một lần (thread 1-1, 2-1, 3-1, 4-1); `jmeter.log` có 6 dòng "End of file" (6 VU còn lại dừng ở EOF).
- Nếu mỗi bậc đọc file riêng thì sẽ có 10 lần đăng nhập và tài khoản trùng nhau. Kết luận: với cùng đường dẫn và `shareMode.all`, 5 Thread Group dùng chung một con trỏ CSV, không trùng tài khoản. Không cần chia file theo bậc.
- Lỗi 0 %, nhánh lockout-probe 7 × 401 (chưa tới 403 vì mỗi tài khoản lock chỉ bị thử một lần trong 40 s).
- `perf/data/users.csv` đã có 500 tài khoản (501 dòng kể cả header) → đủ cho 400 VU.
