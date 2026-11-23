---
name: jmeter-performance-testing
description: Thiết kế, chạy và phân tích kiểm thử hiệu năng (Load, Stress, Spike, Soak) bằng JMeter cho một nhóm endpoint REST, có cổng duyệt của người, dữ liệu CSV, bằng chứng thật và đối chiếu phân tích của AI với số liệu tính từ .jtl thô. Dùng khi cần kiểm thử hiệu năng một API và muốn quy trình lặp lại được trên endpoint khác mà không bịa số liệu.
---

# JMeter performance testing (có kiểm chứng)

Skill biến một nhóm endpoint (tài liệu API và/hoặc mã nguồn) thành bộ test plan JMeter data-driven, chạy non-GUI có ghi tài nguyên tiến trình backend, rồi phân tích `.jtl` bằng script tất định trước khi cho AI diễn giải. Skill **sinh bản nháp và số liệu tính toán**; người dùng duyệt workflow và plan, tự chạy, tự chụp bằng chứng, và quyết định cuối cùng.

## Đầu vào cần có (hỏi nếu thiếu, không đoán)
- Nhóm endpoint cần test và vai trò của từng nhóm (auth-heavy, read-heavy, transactional...).
- Địa chỉ SUT (host, port), cách truy cập DB (để reset dữ liệu test), cách khởi động lại backend.
- MSSV và ngày để đặt tên plan `{MSSV}_{Scenario}_{YYYYMMDD}.jmx`.
- Máy chạy: JMeter (`jmeter` trong PATH hoặc đường dẫn), Java, hệ điều hành (script giám sát tài nguyên hiện viết cho Windows PowerShell).

## Cấu trúc
```
templates/  plan.template.jmx        plan JMeter mẫu, tham số hóa bằng -J (threads, rampup, duration, think time, host, port, data_dir)
            data/*.csv.template       mẫu CSV: users, lock-users, products, orders
            scenario-params.md        cách chọn tham số Load/Stress/Spike/Soak và dựng tải bậc thang không cần plugin
            review-checklist.md       lỗi AI hay mắc khi sinh plan (dùng ở P5)
            analysis-prompt.md        prompt chuẩn cho AI phân tích .jtl (P8)
scripts/    prepare-data.mjs          tạo tài khoản test qua API (không trùng), xuất users/lock-users/products/orders CSV
            db-snapshot.mjs           lưu/khôi phục DB sạch (từ chối khôi phục khi backend còn chạy)
            reset-lockout.mjs         mở khóa đúng các tài khoản test (theo mẫu email), không đụng tài khoản khác
            monitor-node.ps1          ghi CPU/RAM của tiến trình backend mỗi giây ra CSV
            run-scenario.mjs          kiểm tra tên plan + SUT sống → bật giám sát → jmeter -n ... -l .jtl -e -o html → tóm tắt
            jtl-summary.mjs           số liệu thật từ .jtl: theo label/nhóm, p50/p90/p95/p99, lỗi %, RPS, chuỗi thời gian, điểm gãy
            sqlite-open.mjs           mở SQLite bằng node:sqlite (Node ≥ 22.13) hoặc gói sqlite3 của backend SUT
            test/                     kiểm thử script bằng dữ liệu GIẢ (FAKE-*, fake-jmeter, API giả); chỉ để test script, không phải bằng chứng
                                      node --test scripts/test/jtl-summary.test.mjs scripts/test/run-scenario.test.mjs scripts/test/prepare-data.test.mjs
                                      sh scripts/test/reset-lockout.test.sh <database.sqlite> (chạy trên bản sao); hai test dùng sh chạy trên Linux/macOS/Git Bash
```

## Quy trình (P1–P8). Mỗi bước ghi vào `audit/` và commit riêng
**P1. Phân tích workflow.** Lập bảng: endpoint → nhóm → lý do nằm trong workflow; workflow end-to-end một VU đi qua đủ các nhóm (ví dụ: đăng nhập → xem danh sách → tìm → chi tiết → thêm giỏ → xem giỏ → đặt hàng). Ghi nhánh đặc biệt (ví dụ đăng nhập sai để đo hành vi khóa tài khoản) chạy trên tài khoản riêng. Đặt nhãn sampler có tiền tố nhóm (`AUTH`, `READ`, `TXN`) để phân tích theo nhóm. **DỪNG: gửi người dùng duyệt.**

**P2. Khảo sát API.** Đọc mã nguồn/tài liệu: body, mã trạng thái thành công và từ chối, cách gửi token, dữ liệu lưu ở đâu (DB hay bộ nhớ tiến trình), cơ chế khóa tài khoản (ngưỡng, thời gian khóa, mã trả về), dữ liệu tích lũy theo tải (đơn hàng, giỏ hàng), **SUT có tự xóa/tạo lại DB khi khởi động không** (quyết định cách reset và việc có phải tạo lại tài khoản test sau mỗi lần khởi động), chỗ nối chuỗi vào SQL (dữ liệu CSV không được chứa ký tự làm hỏng câu lệnh). Ghi `audit/P2-api-survey.md`; chỗ chưa xác nhận ghi là dự đoán.

**P3. Dữ liệu.** `prepare-data.mjs` tạo tài khoản test (mặc định `perfNNN@test.local`, `lockNN@test.local`) và CSV; `db-snapshot.mjs save` lưu DB sạch sau khi seed. CSV đủ dòng để mỗi VU một tài khoản (tránh nhiều VU dùng chung một tài khoản nếu SUT có trạng thái theo người dùng).

**P4. Sinh plan bằng AI, từng bước.** Từ `templates/plan.template.jmx`: thread group, ramp-up, CSV Data Set Config, JSON Extractor lấy token, assertion (mã trạng thái **và** nội dung). Mô hình người dùng mặc định: **đăng nhập một lần/VU, mỗi VU một tài khoản riêng, think time chỉ ở bước xem hàng và trước thanh toán**. Mặc định 2 VU; số VU thật chốt sau smoke. Mỗi plan một loại listener khác nhau (Summary Report / Aggregate Report / View Results Tree chỉ lỗi). Tham số ban đầu theo `scenario-params.md`, ghi rõ là dự đoán, hiệu chỉnh sau smoke. Tên file `{MSSV}_{Scenario}_{YYYYMMDD}.jmx`. **DỪNG: người dùng review trước khi chạy.**

**P5. Review và sửa.** Đi qua `review-checklist.md`; ghi `audit/P5-review-findings.md`: AI sai/thiếu gì, vì sao (prompt, giới hạn model, đặc tính endpoint), sửa thế nào. Commit bản AI sinh và bản đã sửa thành hai commit riêng.

**P6. Chạy.** Thứ tự: smoke (1–2 VU, 1 phút) → kịch bản thật. Trước mỗi lượt: dừng backend → `db-snapshot.mjs restore` → khởi động lại backend (xóa trạng thái trong bộ nhớ) → `reset-lockout.mjs`. Nếu SUT tự tạo lại DB khi khởi động (xem P2): chỉ cần khởi động lại backend → `prepare-data.mjs --accounts-only` (tài khoản test đã mất cùng DB cũ), bỏ bước restore. Chạy bằng `run-scenario.mjs` (non-GUI), thêm `--verify-db` để đối chiếu số bản ghi được tạo (ví dụ đơn hàng) với số mẫu thành công. Người dùng chụp JMeter/terminal **cùng khung** với Task Manager (tab Details, tiến trình `node` của backend). Không chạy hai lượt song song.

**P7. Ngưỡng bền (Soak 10–15 phút).** Tải ổn định khoảng 70–80% mức tải ở điểm gãy tìm được từ Stress. Báo cáo bằng số lấy từ `jtl-summary.mjs` và `node-usage.csv`: RPS ổn định tối đa, p95, tỉ lệ lỗi, RAM đỉnh và xu hướng RAM của backend.

**P8. Phân tích có kiểm chứng.** (1) Chạy `jtl-summary.mjs` → bảng giá trị đúng. (2) Cho AI phân tích `.jtl` bằng `analysis-prompt.md` trong phiên riêng, lưu nguyên văn. (3) Đối chiếu từng con số/nhận định của AI với bảng giá trị đúng và dòng `.jtl` gốc; ghi chỗ sai và vì sao. (4) Cho AI đề xuất tối ưu; phân loại khả thi / ảo tưởng dựa trên mã nguồn thật của SUT.

## Quy tắc bắt buộc
1. **Không chạy kịch bản trước khi plan được duyệt** (P1, P4 có điểm dừng).
2. **Không bịa bằng chứng**: không tạo `.jtl`, ảnh, video, số liệu thay cho lượt chạy thật; số chưa chạy ghi "dự đoán". Dữ liệu giả chỉ dùng trong `scripts/test/` và phải ghi rõ là giả.
3. **Số liệu đối chiếu do script tính từ `.jtl` thô**; AI chỉ diễn giải. Khi trích số vào báo cáo, ghi nguồn (file, label, cửa sổ thời gian).
4. **Assertion kiểm cả mã trạng thái và nội dung** (ví dụ có `token`, có `orderId`), và **đối chiếu dữ liệu lưu thật** sau khi chạy (`--verify-db`). Nhánh đăng nhập sai chỉ pass với 401/403 và phải bật **Ignore Status** (JMeter tự đánh lỗi mọi mẫu 4xx); không chấp nhận 200 hay 5xx.
5. **Tài khoản riêng cho từng mục đích và từng VU**: mỗi VU một tài khoản (CSV không recycle, số VU ≤ số tài khoản); tài khoản workflow không bao giờ bị nhập sai mật khẩu; nhánh khóa tài khoản dùng tài khoản riêng. Reset theo đúng mẫu email test, không reset rộng.
6. **Mỗi lượt một thư mục kết quả mới**; `run-scenario.mjs` từ chối ghi đè. Không xóa hay sửa `.jtl` sau khi chạy.
7. **Non-GUI để lấy số liệu**; listener trong plan dùng để mở lại `.jtl` làm "report view" khi chụp ảnh. View Results Tree chỉ ghi lỗi.
8. **Phân biệt** thời gian đáp ứng của mọi mẫu với của mẫu thành công; RPS cả lượt với RPS giai đoạn giữ tải; avg với p95. Ghi rõ cách tính phân vị (nearest-rank) và rằng dashboard JMeter có thể lệch nhẹ do thuật toán khác.
9. **Nêu rõ giới hạn**: JMeter và SUT cùng máy thì tranh CPU; số liệu chỉ đúng cho phần cứng đã ghi.
10. Commit theo từng bước; log AI theo quy ước của dự án.

## Đầu ra
`perf/plans/{MSSV}_{Scenario}_{YYYYMMDD}.jmx`, `perf/data/*.csv`, `perf/results/<scenario>/` (`.jtl`, `html/`, `jmeter.log`, `node-usage.csv`, `run-meta.json`, `summary.md`, `summary.json`), các file `audit/P*-*.md`.

## Giới hạn
Skill không chạy được JMeter hay trình duyệt thay người dùng khi môi trường không có SUT; P6–P7 do người dùng chạy và chụp. `monitor-node.ps1` chỉ cho Windows (trên Linux/macOS dùng `pidstat`/`top` và ghi chú). Plan mẫu không dùng plugin; tải bậc thang dựng bằng nhiều Thread Group có độ trễ.

## Lịch sử phiên bản
- v1 (2026-11-18): bản đầu, đã review.
- v1.1 (2026-11-18): từ P2 trên EShop: thêm kiểm tra "SUT tự tạo lại DB khi khởi động" và "nối chuỗi vào SQL" vào P2; `prepare-data.mjs --accounts-only`; bỏ dấu nháy đơn khỏi dữ liệu CSV.
- v1.2 (2026-11-18): `run-scenario.mjs` bọc ngoặc kép đối số khi gọi `jmeter.bat` qua shell trên Windows (đường dẫn có dấu cách bị cắt).
- v1.3 (2026-11-18): đổi `plan.jmx.template` → `plan.template.jmx` để hộp Open của JMeter (chỉ lọc `.jmx`) thấy được.
- v1.4 (2026-11-18): từ review P5 của sinh viên: template đăng nhập 1 lần/VU, mỗi VU một tài khoản riêng, think time chỉ trước xem hàng và thanh toán, mặc định 2 VU (smoke trước), nhánh đăng nhập sai bật Ignore Status; `run-scenario.mjs --verify-db`.
- v1.5 (2026-11-23): sau lượt chạy thật đầu tiên trên Windows: `monitor-node.ps1` lưu UTF-8 có BOM (PowerShell 5.1 hiển thị sai tiếng Việt); `run-scenario.mjs` tự ghép chuỗi lệnh khi gọi `jmeter.bat` (Node 24 cảnh báo DEP0190); ẩn cảnh báo thử nghiệm của `node:sqlite`.
