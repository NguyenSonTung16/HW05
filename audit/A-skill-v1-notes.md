# Giai đoạn A – Skill `jmeter-performance-testing` v1 (bản nháp, chờ sinh viên review)
Thời gian: 2026-11-18 ~10:35–10:45 (UTC+07:00). Model: Claude Opus 5.5. Chưa áp dụng cho SUT, chưa commit.

## Đã tạo (`skills/jmeter-performance-testing/`)
- `SKILL.md`: quy trình P1–P8, điểm dừng ở P1 và P4, 10 quy tắc bắt buộc.
- `templates/plan.jmx.template`: workflow AUTH login → READ list/search/detail → TXN add-cart/view-cart/checkout + Thread Group riêng cho đăng nhập sai (tài khoản `lock*`, chỉ chấp nhận 401/403); tham số qua `-J`; 3 listener (chỉ bật Summary Report).
- `templates/data/*.csv.template`, `scenario-params.md`, `review-checklist.md`, `analysis-prompt.md`.
- `scripts/`: `jtl-summary.mjs`, `prepare-data.mjs`, `db-snapshot.mjs`, `reset-lockout.mjs`, `sqlite-open.mjs`, `monitor-node.ps1`, `run-scenario.mjs`, `test/`.

## Kiểm tra đã chạy (máy ảo Linux của phiên AI, Node v22.23.4)
- `node --test` 3 file: 10/10 pass (dữ liệu GIẢ: `FAKE-sample.jtl`, JMeter giả, API giả).
- `reset-lockout.test.sh` trên **bản sao** `eshop-sut/backend/database.sqlite`: PASS. DB thật của SUT không bị sửa.
- `plan.jmx.template`: XML hợp lệ (parse được), 8 sampler.

## Lỗi tự phát hiện khi test và đã sửa
- `reset-lockout.mjs` v0 chấp nhận mẫu `%@test.local` và đã mở khóa cả `other@test.local` (trên bản sao DB). Nguyên nhân: chỉ kiểm độ dài mẫu sau khi bỏ ký tự đại diện. Sửa: phần trước `@` phải bắt đầu bằng ≥ 2 ký tự cố định; thêm ca test chặn mẫu rộng.
- Test `run-scenario` ban đầu fail do test gọi tiến trình con đồng bộ làm chặn HTTP server giả (lỗi ở test, không phải script); đổi sang gọi bất đồng bộ.

## Chưa kiểm chứng (cần sinh viên làm trên Windows)
- Mở `plan.jmx.template` trong JMeter GUI thật (JMeter 5.6.x) xem có cảnh báo/thiếu thuộc tính không.
- `monitor-node.ps1` chưa chạy lần nào (máy ảo không có PowerShell/Windows).
- `sqlite-open.mjs` nhánh dự phòng `sqlite3` chưa chạy (máy ảo dùng `node:sqlite`); cần biết phiên bản Node trên Windows.
- `prepare-data.mjs` mới test với API giả, chưa chạy với SUT thật.
