# HW05 – Performance Testing: Báo cáo chính

**MSSV:** 23120399 · **GitHub:** https://github.com/NguyenSonTung16/HW05 · **SUT:** EShop (backend Node.js/Express + SQLite) · **Công cụ:** JMeter 5.6.3 (non-GUI), Claude (phân tích và sinh plan)

## 1. Phạm vi và workflow

Ba nhóm endpoint, cùng một workflow end-to-end 7 bước cho mọi kịch bản (chi tiết trong `audit/P1-workflow.md`):

| Nhóm | Endpoint | Nhãn sampler |
|---|---|---|
| Auth-heavy | `POST /api/login` (và nhánh đăng nhập sai trên tài khoản `lock*` để đo khóa tài khoản) | `AUTH login`, `AUTH login-wrong` |
| Read-heavy | `GET /api/products`, `GET /api/products?search=`, `GET /api/products/:id` | `READ list/search/detail` |
| Transactional | `POST /api/cart`, `GET /api/cart`, `POST /api/checkout` | `TXN add-cart/view-cart/checkout` |

Mỗi người dùng ảo đăng nhập một lần bằng tài khoản riêng, rồi xem danh sách, tìm kiếm, xem chi tiết, thêm giỏ, xem giỏ và đặt hàng. Dữ liệu đọc từ CSV (`perf/data/`): `users.csv` (500 tài khoản `perfNNN@test.local`), `products.csv` (5 sản phẩm), `orders.csv` (số lượng, địa chỉ), `lock-users.csv` (10 tài khoản cho nhánh khóa). Không đưa vào: đăng ký, coupon, lịch sử đơn, admin.

## 2. Môi trường

| Mục | Giá trị |
|---|---|
| Máy (hostname) | MSI |
| CPU | AMD Ryzen 5 5600H, 12 luồng logic |
| RAM | 15,4 GB |
| Hệ điều hành | Windows 11 Home Single Language 64-bit, build 26300 (10.0.26300) |
| Node.js / JMeter | v24.11.1 / 5.6.3 |
| Cách chạy | JMeter và SUT cùng một máy (localhost:3000); giám sát CPU/RAM tiến trình `node` mỗi giây (`node-usage.csv`) |

Báo cáo phần cứng: `evidence/hardware/` (ảnh DxDiag và `DxDiag.txt`, `hostname.png` với lệnh `hostname`/`whoami`, ảnh Task Manager, bảng cấu hình `cau-hinh.md`).

Hạn chế: JMeter và SUT tranh CPU trên cùng máy nên số liệu chỉ đúng cho phần cứng này.

## 3. Quy trình có AI và review

Mỗi plan được AI sinh theo từng bước (P1 workflow, P2 khảo sát API, P3 dữ liệu, P4 sinh plan), rồi sinh viên review (P5) trước khi chạy (P6). Phát hiện chính của review, nằm trong `audit/P5-*.md`:

| Plan | AI sai hoặc thiếu | Vì sao AI sai hoặc bỏ sót | Cách sửa |
|---|---|---|---|
| Load | Đăng nhập lại mỗi vòng; CSV dùng chung và recycle; think time đặt mức Thread Group; cứng 50 VU; assertion checkout chỉ kiểm `orderId`; nhánh đăng nhập sai không bật Ignore Status | **Chất lượng prompt:** prompt "sinh plan Load" không mô tả hành vi người dùng, nên AI dùng mẫu JMeter phổ biến (mỗi vòng một phiên, một timer chung). **Đặc tính endpoint:** P2 đã ghi giỏ hàng lưu theo user trong bộ nhớ nhưng AI không nối vào cấu hình CSV. **Giới hạn model:** không có dữ liệu phần cứng nên đoán số VU; oracle chỉ kiểm phản hồi HTTP, không kiểm dữ liệu lưu; không biết JMeter tự đánh lỗi mẫu 4xx nếu không bật Ignore Status vì chưa kiểm bằng chạy thật | Đăng nhập một lần/VU, mỗi VU một tài khoản, think time chỉ trước xem hàng và thanh toán, chốt VU sau smoke, đối chiếu DB, bật Ignore Status |
| Stress | Không chặn việc chạy khi chỉ có 100 tài khoản cho 400 VU; assertion 401/403 viết bằng regex khó đọc; ngưỡng p95 500 ms không rõ là ngưỡng phân tích hay ngưỡng dừng | AI có nêu thiếu tài khoản ở P4 nhưng chỉ như một câu hỏi, không coi là điều kiện bắt buộc; dùng cách viết assertion quen thuộc thay vì cách dễ review; prompt không yêu cầu chốt ngưỡng trước khi chạy | Tạo 500 tài khoản; thử nghiệm xác nhận 5 Thread Group dùng chung một con trỏ CSV (`smoke-stress-csvtest`); assertion Equals + OR; chốt p95 500 ms là ngưỡng phân tích |
| Spike | Chỉ liệt kê phương án đỉnh mà không chọn; định nghĩa hồi phục chưa đo được | Prompt không nêu năng lực bão hòa đo được ở Stress và không yêu cầu tiêu chí hồi phục có số | Đỉnh 200 VU không think time (vượt mức bão hòa ~1 450 req/s), hồi phục = 3 cửa sổ 10 s liên tiếp có p95 ≤ 1,5 × p95 nền và lỗi 0 %, smoke trước khi chạy thật |

Chi tiết từng điểm: `audit/P5-review-findings.md`, `audit/P5-stress-review.md`, `audit/P5-spike-review.md`.

## 4. Tham số và kết quả ba kịch bản bắt buộc

Số liệu lấy từ `perf/results/<lượt>/summary.md` do `jtl-summary.mjs` tính từ `.jtl` thô (percentile nearest-rank; RPS = mẫu / (kết thúc cuối − bắt đầu đầu)). Tất cả lượt: lỗi 0% (401/403 của nhánh đăng nhập sai được chủ ý chấp nhận), số đơn trong DB khớp số mẫu checkout.

| Kịch bản | Tham số | Mẫu | p95 | p99 | RPS trung bình | RPS cửa sổ 10 s cao nhất | CPU TB / RAM đỉnh (node) |
|---|---|---|---|---|---|---|---|
| Load (`load2`) | 50 VU, 7 phút, có think time | 14 692 | 4 ms | 5 ms | 35 | 39,7 | 0,27% / 146,7 MB |
| Stress (`stress`) | 5 bậc đến 400 VU, 15 phút, có think time | 100 544 | 3 ms | 4 ms | 111,7 | 308,1 | 0,70% / 126,7 MB |
| Stress không think time (`stress-nothink`) | 5 bậc 10→160 VU, 5 phút, think time = 0 | 432 595 | 165 ms | 367 ms | 1 442,5 | 1 656,8 | 8,10% / 259,1 MB |
| Spike (`spike`) | nền 50 VU, đỉnh thêm 200 VU không think time, 7 phút | 110 649 | 411 ms | 486 ms | 263,6 | 1 777,3 | 1,34% / 188,9 MB |

Plan: `23120399_Load_20261118.jmx` (Load), `23120399_Stress_20261123.jmx` (cả hai lượt Stress), `23120399_Spike_20261123.jmx` (Spike).

Report view: mỗi plan bật đúng một listener và không lặp kiểu: Load dùng **Summary Report**, Stress dùng **Aggregate Report**, Spike dùng **View Results Tree** (chỉ ghi mẫu lỗi). Hai listener còn lại trong mỗi plan để ở trạng thái tắt. Ngoài ra mỗi lượt đều có báo cáo HTML của JMeter (`-e -o`) trong `perf/results/<lượt>/html/`.

Nhận xét:

- **Load 50 VU:** không có áp lực, 42/42 cửa sổ khỏe.
- **Stress có think time đến 400 VU:** không gãy (p95 3 ms, 90/90 cửa sổ khỏe), vì think time 1–3 s giữ tải thực chỉ khoảng 300 req/s. Vì vậy mình chạy thêm lượt **không think time** để tìm điểm bão hòa: throughput phẳng quanh 1 400–1 500 req/s từ bậc 10 VU đến 160 VU, trong khi p95 tăng gần tuyến tính theo số VU (bậc 160 VU: p95 cửa sổ 296–400 ms). CPU của tiến trình Node chỉ khoảng 8–11% trên 12 lõi, tức khoảng một lõi, phù hợp với việc Node xử lý trên một luồng. Checkout là thao tác chậm nhất (p95 373 ms).
- **Spike:** đỉnh 120–180 s đạt 1 452–1 777 req/s, p95 tăng từ 264 lên 476 ms, không có lỗi. Cửa sổ 180–190 s đã về p95 4 ms và 37 req/s, tức hồi phục trong vòng 10 s. Phần đỉnh thực chất là một đợt stress ngắn vì nhóm đỉnh tắt think time.

Bằng chứng: `.jtl` thô và thư mục `html/` của từng lượt trong `perf/results/`; ảnh JMeter và Task Manager trong `evidence/screenshots/<kịch bản>/`. Lượt `load` đầu (`threads=500`) hỏng vì `users.csv` chỉ có 100 tài khoản, được giữ lại làm bằng chứng và không dùng để báo cáo. Ảnh Stress có think time được chụp ở lượt `stress2`: sinh viên quên chụp ở lượt `stress`, nên chạy lại đúng plan và cấu hình; throughput hai lượt lệch dưới 2 % (99 999 mẫu, lỗi 0 %, p95 5 ms; xem `audit/P6-stress.md`). Số liệu trong bảng trên vẫn lấy từ lượt `stress`.

### Reset khóa tài khoản giữa các lượt

Theo mã nguồn, mỗi lần đăng nhập sai cộng 2 vào bộ đếm và khóa khi đạt 3, nên tài khoản bị khóa ngay sau lần sai thứ 2, trong 180 s (BUG-03). Mỗi plan có nhóm `TG lockout-probe` cố ý đăng nhập sai trên tài khoản `lock01`–`lock10`, nên sau mỗi lượt Stress/Spike các tài khoản này đã bị khóa. Tài khoản workflow (`perf*`) không bao giờ bị nhập sai mật khẩu. Các bước reset giữa hai lượt:

1. Dừng backend (`Ctrl+C` ở cửa sổ chạy `node server.js`), rồi khởi động lại trong `eshop-sut/backend`. Khi khởi động, `database.js` xóa và tạo lại mọi bảng, nên trạng thái khóa, đơn hàng và giỏ hàng (lưu trong bộ nhớ) đều về sạch.
2. Chờ `GET http://localhost:3000/api/products` trả 200.
3. Tạo lại tài khoản test vì chúng mất cùng DB cũ: `node skills\jmeter-performance-testing\scripts\prepare-data.mjs --accounts-only`.
4. Chạy lượt kế tiếp bằng `run-scenario.mjs`, ghi vào một thư mục kết quả mới.

Khi cần chạy tiếp mà không khởi động lại backend, dùng `node skills\jmeter-performance-testing\scripts\reset-lockout.mjs --db "<đường dẫn>\eshop-sut\backend\database.sqlite"`. Chạy trước với `--dry-run` để xem danh sách tài khoản sẽ mở khóa. Script chỉ mở khóa tài khoản test theo mẫu email `perf*`/`lock*`. Quy trình gốc: `audit/P2-api-survey.md`, mục "Quy trình reset giữa các lượt".

## 5. Ngưỡng bền (Soak 15 phút)

Plan `23120399_Soak_20261123.jmx`, 300 VU có think time, ramp 60 s, giữ tải 900 s (khoảng 75% mức ổn định của Stress). Kết quả `perf/results/soak/`:

| Chỉ số | Giá trị |
|---|---|
| Mẫu / lỗi | 195 439 / 0% |
| RPS ổn định tối đa (cửa sổ 10 s) | 229,8 req/s; sau ramp, các cửa sổ dao động 219,7–229,8 |
| p95 / p99 | 4 ms / 6 ms (cửa sổ 3–6 ms; từ giây 840 p95 ổn định ở 6 ms) |
| RAM tiến trình Node | 70,2 MB lúc đầu → 176,8 MB lúc cuối, đỉnh 179,6 MB |
| CPU tiến trình Node | trung bình 1,31%, tối đa 4% (thang 12 lõi) |
| Đối chiếu DB | 32 396 mẫu checkout = 32 396 đơn trong DB |

Ngưỡng bền thực nghiệm trên máy này: khoảng 225 req/s ở tải có think time, giữ ổn định 15 phút; RAM đỉnh khoảng 180 MB. Giới hạn bão hòa không think time khoảng 1 400–1 500 req/s. Điều chưa xác định: nguyên nhân độ trễ soak nhích lên từ giây 840 (p95 3→6 ms); cần chạy soak dài hơn.

## 6. Bug và vấn đề hiệu năng

4 bug và 1 vấn đề hiệu năng đã đăng GitHub Issues (chi tiết `docs/Bug_Report.md`, ảnh trong `evidence/screenshots/issues/`):

| Mã | Tiêu đề | Issue |
|---|---|---|
| BUG-01 | Checkout không xóa giỏ → RAM backend tăng theo số lần mua | [#1](https://github.com/NguyenSonTung16/HW05/issues/1) |
| BUG-02 | Thêm cùng sản phẩm tạo dòng mới thay vì tăng số lượng | [#2](https://github.com/NguyenSonTung16/HW05/issues/2) |
| BUG-03 | Khóa tài khoản ngay sau lần sai thứ 2 và khóa 180 s thay vì 30 s | [#3](https://github.com/NguyenSonTung16/HW05/issues/3) |
| BUG-04 | Backend chấp nhận `total_amount` do client gửi | [#4](https://github.com/NguyenSonTung16/HW05/issues/4) |
| PERF-01 | Checkout là nút cổ chai khi bão hòa (~1 450 req/s) | [#5](https://github.com/NguyenSonTung16/HW05/issues/5) |

## 7. Task 2 – Phân tích bằng AI và săn lỗi diễn giải

AI được cho phân tích kết quả ba kịch bản (chỉ nhận 200 dòng đầu mỗi `.jtl`, các bản tóm tắt `.md`, `summary.md` và `run-meta.json`). Toàn bộ prompt và phản hồi nằm trong `audit/P8-ai-analysis.md`; bảng đối chiếu từng nhận định với `.jtl` thô, mã nguồn nằm ở mục C3 và C4 của file đó, phán quyết ở `docs/AI_Analysis_Review.md`.

Lỗi chính của AI:

- **Connect:** AI nói chỉ dòng login đầu có Connect > 0. Thực tế toàn file có 318 (stress), 570 (spike) và 3 658 (soak) dòng Connect > 0, ở cả READ và TXN.
- **allThreads:** AI nói luôn bằng `grpThreads + 1`. Sai trên toàn file (soak có 919 dòng chênh 0, nhiều dòng khác).
- **Latency và elapsed:** AI nói gần bằng nhau. Chỉ đúng trong 200 dòng đầu; toàn file lệch ở 3 091 dòng stress, 274 dòng spike, 466 dòng soak.
- **"Bảng orders lớn dần (32 396 dòng)":** 32 396 là số mẫu checkout, không phải số dòng của bảng.
- **Khoảng số liệu:** "RPS 1390–1510" là khoảng trung bình theo bậc, khoảng dao động cửa sổ thật là 1 302–1 657; spike nền thực tế 35,7–38,8 req/s chứ không phải 37–39.

Phân loại đề xuất tối ưu theo mã nguồn: chạy 2–4 tiến trình Node **không áp dụng được ngay** (giỏ hàng nằm trong bộ nhớ ở `server.js` dòng 14, `initDatabase()` xóa bảng khi khởi động); WAL **áp dụng được** nhưng cần đo; gộp transaction/trừ kho **không áp dụng được** (checkout chỉ có một INSERT, mã không có bước trừ kho); phân trang hoặc cache danh sách **không có lợi ích hiện tại** (bảng `products` có 5 dòng).

## 8. Task 3 – Đề xuất kiểm thử hiệu năng liên tục

Chi tiết và lưu đồ Mermaid trong `docs/CPT_Proposal.md`. Tóm tắt: webhook commit → lọc thay đổi (backend, DB, route) → smoke perf 30–60 s → so p95 với baseline (trung vị 5 lần chạy gần nhất, ngưỡng +25%) → lặp 2/3 lần khi vi phạm → chạy đầy đủ → cảnh báo hoặc chặn merge. Đánh đổi: smoke ở mỗi PR rẻ, bản đầy đủ (soak 15 phút) đắt nên chỉ chạy khi nghi ngờ. Nhiễu cần xử lý: lượng tử hóa p95 khi chỉ vài ms, máy dùng chung, trạng thái SUT. Đây là đề xuất, chưa triển khai trên CI thật.

## 9. Agent Skill

Skill `skills/jmeter-performance-testing/` (v2.0) đóng gói quy trình P1–P9 và các script (`prepare-data`, `db-snapshot`, `reset-lockout`, `monitor-node.ps1`, `run-scenario`, `jtl-summary`), kèm test script bằng dữ liệu giả. Các bản v1.1–v1.6 sửa lỗi thật phát sinh khi chạy (đường dẫn Windows có dấu cách, BOM của PowerShell, tràn stack khi tóm tắt 430 000 mẫu). Bản v2.0 bổ sung từ Task 2 và 3: kiểm nhận định về cột trên toàn file, phân loại đề xuất bốn mức, P9 kiểm thử liên tục. Video demo: xem README.

## 10. Tuân thủ

Tên plan đúng `{MSSV}_{Scenario}_{YYYYMMDD}`, `.jtl` thô nộp đầy đủ, hostname trong `run-meta.json` là MSI. Khai báo dùng AI: *I use AI tools for the following tasks:* thiết kế và sinh test plan JMeter theo từng bước, viết script của Agent Skill, phân tích log `.jtl` và đề xuất tối ưu, soạn bản nháp báo cáo, đề xuất kiểm thử hiệu năng liên tục và kịch bản video. Công cụ: Claude (Anthropic) trên claude.ai, các model Opus 5.5, Sonnet 5.5 và Haiku 5.5. Toàn bộ quá trình dùng AI được ghi trong `audit/AI_LOG.md` (tên công cụ, ngày giờ, prompt, output) và tổng hợp trong AI Audit Report. Báo cáo này được AI soạn bản nháp từ số liệu trong repo, sinh viên đã đối chiếu số liệu với `summary.md` và `.jtl`.
