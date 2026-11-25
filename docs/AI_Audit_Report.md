**Khoa Công nghệ Thông tin (FIT) – Trường Đại học Khoa học Tự nhiên (HCMUS)**

**CS423 / CSC13003 – Kiểm chứng Phần mềm (AI-augmented · 2026)**

**CHÍNH SÁCH AI · BIỂU MẪU — 2026 v1.0**

# AI Audit Report — Mẫu 5 mục cho mỗi Artifact

*Phụ lục bắt buộc đính kèm cho mọi bài tập có dùng AI (HW#01–HW#06, Seminar).*

*Tài liệu được biên soạn lại từ Med Kharbach, PhD (2026) — Mẫu Chính sách Sử dụng AI cho Giáo dục Đại học. Giấy phép CC BY-NC-SA 4.0. Phiên bản này được FIT@HCMUS điều chỉnh cho môn CS423 / CSC15003 Kiểm chứng Phần mềm.*

## 1. Thông tin Sinh viên

| Mục                              | Giá trị                                                                                                                                        |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Họ tên sinh viên (in hoa):       | \[ĐIỀN HỌ TÊN IN HOA\]                                                                                                                         |
| MSSV:                            | 23120399                                                                                                                                       |
| Lớp / Khoá:                      | \[ĐIỀN LỚP / KHOÁ\]                                                                                                                            |
| Mã bài tập (ví dụ HW#00, HW#02): | HW05 (Performance Testing)                                                                                                                     |
| Ngày làm bài:                    | 18/11/2026 – 25/11/2026                                                                                                                        |
| Công cụ AI đã dùng:              | Claude (Opus 5.5, Sonnet 5.5, Haiku 5.5) trên claude.ai (Project "software testing"); công cụ khác: JMeter 5.6.3, Task Manager (không phải AI) |
| Công cụ AI đã dùng:              | \[x\] Có \[ \] Không                                                                                                                           |

## 2. Hướng dẫn (đọc trước khi điền)

- Thêm 1 hàng cho mỗi artifact AI sinh (test case, script, checklist, OpenAPI spec, JMeter plan…).

- Dán nguyên văn prompt — KHÔNG paraphrase.

- Dán nguyên văn output AI (hoặc kèm screenshot có chú thích trong báo cáo).

- Gắn nhãn: VALID / INVALID / INCOMPLETE.

- Lý do phải dẫn chiếu slide, mục ISTQB, hoặc RFC kỹ thuật.

- Hiển thị bản sửa với phần thay đổi được tô sáng.

- Hàng mẫu in nghiêng — thay trước khi nộp.

## 3. Bảng Audit — 1 hàng / artifact

<table style="width:100%;">
<colgroup>
<col style="width: 24%" />
<col style="width: 30%" />
<col style="width: 9%" />
<col style="width: 18%" />
<col style="width: 16%" />
</colgroup>
<thead>
<tr class="header">
<th>(1) Prompt + Công cụ</th>
<th>(2) Output AI</th>
<th>(3) Verdict</th>
<th>(4) Lý do (ISTQB)</th>
<th>(5) Bản SV sửa</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Artifact #1: Agent Skill v1 (jmeter-performance-testing)<br />
Tool: Claude (Opus 5.5)<br />
Thời gian: 10:43 18/11/2026<br />
Prompt:<br />
1. 3 nhóm endpoint này hoàn toàn phù hợp<br />
2. 2. đã có java và jmeter<br />
3. https://github.com/NguyenSonTung16/HW05.git<br />
4. đồng ý</td>
<td>Giai đoạn A xong: skill `jmeter-performance-testing` v1 đã soạn trong `HW05/skills/`, chưa áp dụng cho SUT và chưa commit. Mình dừng ở đây để bạn review skill.<br />
<br />
**Skill gồm**<br />
- `SKILL.md`: quy trình P1–P8. Có điểm dừng chờ bạn duyệt ở P1 (workflow) và P4 (plan, trước khi chạy). Có 10 quy tắc bắt buộc.<br />
- `templates/plan.jmx.template`: workflow AUTH login → READ list/search/detail → TXN add-cart/view-cart/checkout. Có thêm một Thread Group riêng thử đăng nhập sai trên tài khoản `lock*`, chỉ chấp nhận 401/403. Mọi tham số (threads, rampup, duration, think time...) truyền bằng `-J`. Có sẵn 3 listener, mỗi plan bật đúng một cái.<br />
- `templates/`: mẫu CSV, `scenario-params.md` (tham số Load/Stress/Spike/Soak, tải bậc thang không cần plugin), `review-checklist.md`, `analysis-prompt.md`.<br />
- `scripts/`:<br />
- `jtl-summary.mjs`: tính p50–p99, lỗi %, RPS theo label/nhóm/khung thời gian, và điểm gãy từ `.jtl` thô. Đây là "giá trị đúng" cho Task 2.<br />
- `prepare-data.mjs`: tạo tài khoản test qua API, không tạo trùng, xuất CSV.<br />
- `db-snapshot.mjs`: lưu/khôi phục DB sạch, từ chối khi backend còn chạy.<br />
- `reset-lockout.mjs`: chỉ mở khóa `perf*`/`lock*`.<br />
- `monitor-node.ps1`: ghi CPU/RAM của backend mỗi giây.<br />
- `run-scenario.mjs`: kiểm tên plan và SUT → bật giám sát → JMeter non-GUI → HTML → tóm tắt. Không cho ghi đè kết quả cũ.<br />
<br />
**Đã kiểm tra:** 10/10 bài test pass, dùng dữ liệu giả ghi rõ là FAKE, không phải bằng chứng. Bài test reset chạy trên bản sao DB của SUT cũng pass, DB thật không bị sửa. Trong lúc test mình bắt được một lỗi của chính mình: `reset-lockout.mjs` bản đầu chấp nhận mẫu `%@test.local` và mở khóa luôn cả tài khoản không thuộc bộ test. Đã sửa và thêm bài test chặn trường hợp này. Chi tiết ở `audit/A-skill-v1-notes.md`.<br />
<br />
**Chưa kiểm chứng, cần bạn thử trên Windows**<br />
1. Mở `templates/plan.jmx.template` bằng JMeter GUI xem có báo lỗi không.<br />
2. Chạy `node -v`. Bản 22.13 trở lên thì script dùng SQLite có sẵn của Node; thấp hơn thì dùng gói `sqlite3` của backend (nhánh này mình chưa chạy được).<br />
3. `monitor-node.ps1` chưa chạy lần nào vì máy ảo của mình không có Windows.<br />
<br />
Mình có đổi vài tên so với kế hoạch (đã cập nhật PLAN.md): `seed-users.mjs` thành `prepare-data.mjs`, `run-scenario.bat` thành `run-scenario.mjs`, và thêm `db-snapshot.mjs`.<br />
<br />
**Cần bạn chốt:** đặt gốc repo HW05 ở đâu?<br />
- (a) Cả thư mục `HW05` (đề xuất): commit skill, plan, kết quả, docs, audit đều nằm trong lịch sử git, git log nộp bài đầy đủ hơn.<br />
- (b) Chỉ `HW05/perf` như kế hoạch cũ: commit skill sẽ không nằm trong repo.<br />
<br />
Dù chọn cách nào, mình cũng sẽ xin quyền xóa file trong thư mục (git cần quyền này, giống HW04).<br />
<br />
Bạn review skill xong (hoặc ghi nhận xét để mình sửa) thì mình commit skill v1 rồi sang Giai đoạn B, bước P1.<br />
đã ghi audit</td>
<td>INCOMPLETE</td>
<td>AI chưa chạy thử trên Windows với tải lớn nên bỏ sót lỗi thật: đường dẫn có dấu cách, BOM của PowerShell, tràn stack khi tóm tắt khoảng 430 000 mẫu. ISTQB FL v4.0 §1.3 (nguyên tắc: kiểm thử phụ thuộc ngữ cảnh) và §5.2 (rủi ro).</td>
<td>Skill v1.1–v1.6 (commit 3beafb5 … 25b0e77); thêm `run-scenario --verify-db` và `--resume`.</td>
</tr>
<tr class="even">
<td>Artifact #2: Workflow P1 (auth, read, transactional)<br />
Tool: Claude (Opus 5.5)<br />
Thời gian: 10:59 18/11/2026<br />
Prompt:<br />
ok nội dung skill tốt rồi, tiếp theo làm gì</td>
<td>Skill v1 đã được duyệt, giờ sang Giai đoạn B: áp dụng skill. Mình đã làm luôn bước đầu tiên (P1, chỉ là tài liệu) để bạn duyệt: `audit/P1-workflow.md`.<br />
<br />
**P1: workflow mỗi người dùng ảo (dùng chung cho Load/Stress/Spike/Soak)**<br />
<br />
| # | Nhãn | Request | Nhóm |<br />
|---|---|---|---|<br />
| 1 | AUTH login | `POST /api/login` (tài khoản từ CSV, lấy token) | auth-heavy |<br />
| 2 | READ list | `GET /api/products` | read-heavy |<br />
| 3 | READ search | `GET /api/products?search=&lt;từ khóa&gt;` | read-heavy |<br />
| 4 | READ detail | `GET /api/products/&lt;id&gt;` | read-heavy |<br />
| 5 | TXN add-cart | `POST /api/cart` | transactional |<br />
| 6 | TXN view-cart | `GET /api/cart` | transactional |<br />
| 7 | TXN checkout | `POST /api/checkout` | transactional |<br />
<br />
- Think time 1–3 giây trước mỗi request. Mỗi vòng đăng nhập lại (một vòng = một phiên mua hàng).<br />
- Nhánh phụ: 1 người dùng ảo cứ 5 giây đăng nhập sai một lần bằng tài khoản `lock*`, chỉ chấp nhận 401/403. Tài khoản chạy workflow không bao giờ nhập sai, nên lỗi ở workflow không thể do bị khóa.<br />
- Không đưa vào: đăng ký (sẽ tạo tài khoản rác khi chạy tải), coupon (thuộc FR-09, giới hạn lượt dùng gây lỗi giả), admin.<br />
<br />
**Thứ tự tiếp theo**<br />
1. Commit skill v1. Cần bạn chốt gốc repo: (a) cả thư mục `HW05` (mình đề xuất) hay (b) chỉ `HW05/perf`. Sau đó mình xin quyền xóa file để git chạy được.<br />
2. Bạn duyệt P1 (3 câu hỏi cuối file).<br />
3. P2 khảo sát API chi tiết và P3 dữ liệu: mình soạn, bạn chạy `prepare-data.mjs` khi backend đang chạy.<br />
4. P4: sinh 3 plan Load/Stress/Spike, rồi dừng để bạn review trước khi chạy.<br />
5. Trong lúc đó bạn làm được ngay: chụp dxdiag và bảng cấu hình máy (hostname phải khớp các bài trước), chạy `node -v`, mở thử `templates/plan.jmx.template` bằng JMeter GUI.<br />
<br />
Bạn trả lời gốc repo và duyệt P1 là mình làm tiếp.<br />
đã ghi audit</td>
<td>VALID</td>
<td>Workflow phủ đủ ba nhóm endpoint theo đề (auth, read, transactional), không đổi sau khi duyệt. ISTQB FL v4.0 §4.1 (phân tích kiểm thử dựa trên cơ sở kiểm thử).</td>
<td>Không sửa.</td>
</tr>
<tr class="odd">
<td>Artifact #3: Plan Load do AI sinh<br />
Tool: Claude (Opus 5.5)<br />
Thời gian: 11:48 18/11/2026<br />
Prompt:<br />
P4: sinh plan Load</td>
<td>Plan Load đã sinh từ template (6 dòng thay đổi so với template). Giờ mình ghi phần giải thích tham số và commit bản nháp.<br />
<br />
Plan Load đã có: `perf\plans\23120399_Load_20261118.jmx` (commit "chưa review, chưa chạy"). Giải thích đầy đủ ở `audit\P4-load.md`. **Mình dừng ở đây để bạn review trước khi chạy.**<br />
<br />
**Tham số (dự đoán, sẽ chỉnh sau smoke)**<br />
| Tham số | Giá trị | Lý do |<br />
|---|---|---|<br />
| Số người dùng ảo | 50 | Mức "bình thường" giả định cho cửa hàng nhỏ; chưa có số đo thật |<br />
| Ramp-up | 60 s | Thêm khoảng 1 người dùng mỗi 1,2 s, tránh thành spike |<br />
| Thời gian | 420 s | 60 s tăng tải + 6 phút giữ tải (đề yêu cầu ≥ 5 phút) |<br />
| Think time | 1–3 s trước mỗi request | Mô phỏng người đọc trang |<br />
| Nhánh khóa tài khoản | 1 người dùng, 5 s/lần | Đo hành vi khóa mà không làm lệch số liệu chính |<br />
| Report view | Summary Report | Stress sẽ dùng Aggregate Report, Spike dùng View Results Tree |<br />
<br />
Ước lượng: một vòng 7 request mất khoảng 14,5 s, nên 50 người dùng tạo khoảng **24 req/s**, khoảng 8.700 mẫu và 1.240 đơn hàng trong 6 phút giữ tải. Con số này để đối chiếu với kết quả thật.<br />
<br />
**Điểm mình tự nêu để bạn soi khi review:**<br />
1. Mỗi vòng đăng nhập lại, nên tỉ lệ đăng nhập có thể cao hơn người dùng thật.<br />
2. Hai người dùng ảo có thể dùng chung một tài khoản cùng lúc (100 tài khoản xoay vòng cho 50 người dùng).<br />
3. Think time cũng chờ trước request đăng nhập đầu vòng.<br />
4. Con số 50 chưa có căn cứ đo.<br />
5. Assertion checkout chỉ kiểm có `orderId`, không kiểm đơn có thật trong DB.<br />
<br />
Bạn có thể mở plan bằng JMeter GUI để xem (nhớ đừng Save). Duyệt xong, chạy smoke 1 phút để hiệu chỉnh:<br />
1. Đóng cửa sổ backend, chạy `tools\start-backend.bat`, chờ `http://localhost:3000/api/products` mở được.<br />
2. `node skills\jmeter-performance-testing\scripts\prepare-data.mjs --accounts-only`<br />
3. `node skills\jmeter-performance-testing\scripts\run-scenario.mjs --plan perf\plans\23120399_Load_20261118.jmx --out perf\results\smoke-load -J threads=2 -J rampup=10 -J duration=60`<br />
<br />
Chạy xong gửi mình phần cuối kết quả trong terminal (hoặc nội dung `perf\results\smoke-load\summary.md`).<br />
đã ghi audit</td>
<td>INCOMPLETE</td>
<td>6 lỗi theo review P5: đăng nhập lại mỗi vòng, CSV dùng chung, think time sai mức, số VU đoán, assertion checkout yếu, thiếu Ignore Status. Không mô phỏng hành vi người dùng thật. ISTQB CT-PT (Performance Testing): mô hình tải phải theo hồ sơ vận hành thực tế; FL v4.0 §4.1.</td>
<td>Sửa theo `audit/P5-review-findings.md` (commit 644ffb2): đăng nhập một lần/VU, mỗi VU một tài khoản, think time chỉ trước xem hàng và thanh toán, chốt VU sau smoke, bật Ignore Status, đối chiếu DB.</td>
</tr>
<tr class="even">
<td>Artifact #4: Plan Stress do AI sinh<br />
Tool: Claude (Sonnet 5.5)<br />
Thời gian: 10:44 23/11/2026<br />
Prompt:<br />
đồng ý làm Stress</td>
<td>Plan Stress đã sẵn sàng để bạn review (bước P4), chưa chạy.<br />
<br />
**Có một điểm bất thường cần nói thẳng:** file `perf/plans/23120399_Stress_20261123.jmx` đã nằm trong thư mục từ 10:40, trước khi bạn duyệt lúc 10:43, và mình không có bước tạo nó trong log các lượt trước. Mình không biết ai hay công cụ nào sinh ra nó. Vì vậy mình coi nó là bản nháp chưa kiểm chứng, đọc lại toàn bộ và chỉ sửa phần mô tả TestPlan (đang ghi nhầm là "LOAD"). Mình cũng đã ghi chuyện này vào `audit/P4-stress.md` để báo cáo trung thực. Nếu bạn biết nó từ đâu ra thì cho mình biết.<br />
<br />
**Nội dung plan (đã commit):**<br />
- 5 bậc cộng dồn: 25 → 50 → 100 → 200 → 400 VU, bắt đầu ở giây 0/180/360/540/720 và cùng kết thúc ở giây 900 (15 phút). Ramp-up mỗi bậc 30 s.<br />
- Mỗi VU một tài khoản riêng, đăng nhập một lần, think time 1–3 s, nhánh lockout-probe coi 401/403 là đúng. Cả 5 bậc đọc chung `users.csv` không recycle nên không trùng tài khoản.<br />
- Báo cáo dùng Aggregate Report (Summary tắt), khác với Load.<br />
- XML đã kiểm tra hợp lệ. Tên plan khớp mẫu `{StudentID}_{ScenarioType}_{YYYYMMDD}`.<br />
<br />
**Bạn cần review và quyết 4 việc (như ở P5):**<br />
1. Ngưỡng dừng phân tích: lỗi &gt; 5 % hoặc p95 &gt; bao nhiêu ms. Mình đề xuất 500 ms.<br />
2. Giữ think time 1–3 s hay giảm xuống để dễ gãy hơn. Nếu giảm thì phải ghi lý do.<br />
3. Bậc 5 chỉ kéo dài 3 phút có đủ thấy suy giảm không, hay muốn kéo dài thêm.<br />
4. Số tài khoản: Stress cần ≥ 400 tài khoản. Bạn đã chạy `prepare-data.mjs --users 500 --force` sau khi khởi động lại backend chưa?<br />
<br />
Khi bạn chốt xong 4 điểm này, mình chạy smoke Stress rồi hướng dẫn lệnh chạy thật.<br />
<br />
đã ghi audit</td>
<td>INCOMPLETE</td>
<td>Assertion 401/403 chưa đúng, mỗi Thread Group đọc CSV riêng nên có thể dùng trùng tài khoản, `users.csv` chỉ có 100 tài khoản cho 400 VU. ISTQB FL v4.0 §4.1 và CT-PT (dữ liệu kiểm thử đủ và độc lập).</td>
<td>Commit 898acd9 và 4e3ca3d: sửa assertion (Equals + OR), chia sẻ CSV giữa 5 bậc, tạo 500 tài khoản.</td>
</tr>
<tr class="odd">
<td>Artifact #5: Plan Spike do AI sinh<br />
Tool: Claude (Opus 5.5)<br />
Thời gian: 12:20 23/11/2026<br />
Prompt:<br />
làm Spike luôn</td>
<td>Plan Spike đã sinh xong (P4), chưa chạy, chờ bạn review: `perf/plans/23120399_Spike_20261123.jmx`. Mình đã ghi chi tiết vào `audit/P4-spike.md` và commit.<br />
<br />
**Cấu trúc:** sinh từ plan Load đã qua review (cùng workflow, tài khoản riêng, đăng nhập một lần, think time 1–3 s).<br />
- **Nhóm nền:** 50 VU (mức Load đã đo), chạy suốt 420 s.<br />
- **Nhóm đỉnh:** thêm 500 VU vào ở giây 120, tăng trong 5 s, giữ 60 s rồi dừng cùng lúc ở giây 180.<br />
- **Lockout-probe:** 1 VU, assertion Equals 401/403 như bản Stress đã sửa.<br />
- **Report view:** View Results Tree (chỉ lỗi). Load dùng Summary, Stress dùng Aggregate, nên đủ 3 view khác nhau theo đề.<br />
- Phân tích theo 3 giai đoạn: trước đỉnh, lúc đỉnh và sau đỉnh (thời gian hồi phục).<br />
<br />
**Bạn cần quyết 4 điểm:**<br />
1. **Đỉnh 500 VU có think time sẽ không làm quá tải.** Tổng khoảng 410 req/s, chỉ khoảng 30 % năng lực đã đo (~1 450 req/s). Kết quả chỉ cho thấy tác động của 500 lượt đăng nhập dồn trong 5 s, p95 nhiều khả năng vẫn vài ms. Muốn đỉnh vượt năng lực thì phải chọn một trong hai: tăng lên khoảng 2 000 VU (cần 2 000 tài khoản, và JMeter chạy cùng máy có thể nghẽn trước), hoặc cho nhóm đỉnh chạy không think time (khoảng 50 VU là đủ bão hòa).<br />
2. Định nghĩa "đã hồi phục". Mình đề xuất: 3 cửa sổ 10 s liên tiếp sau giây 180 có p95 không quá 1,5 lần mức trước đỉnh và lỗi 0 %.<br />
3. Cần 550 tài khoản, nên phải tạo 600 (`prepare-data.mjs --out perf\data --users 600 --force`).<br />
4. Có chạy smoke trước không (2 VU nền + 4 VU đỉnh, 40 s) để kiểm tra plan mới.<br />
<br />
đã ghi audit</td>
<td>INCOMPLETE</td>
<td>Đỉnh +500 VU trong 5 giây vượt sức máy, chưa định nghĩa hồi phục. ISTQB FL v4.0 §5.1 (kế hoạch kiểm thử, tiêu chí) và CT-PT (kịch bản spike).</td>
<td>Commit 2108edb: đỉnh 200 VU không think time, định nghĩa hồi phục theo p95 về mức nền, chạy smoke trước.</td>
</tr>
<tr class="even">
<td>Artifact #6: Plan Soak do AI sinh<br />
Tool: Claude (Opus 5.5)<br />
Thời gian: 12:45 23/11/2026<br />
Prompt:<br />
ok</td>
<td>Plan Soak đã tạo và commit: `perf/plans/23120399_Soak_20261123.jmx`. Workflow giữ nguyên như plan Load đã review, chạy 15 phút, assertion 401/403 cũng đã sửa giống Stress và Spike.<br />
<br />
**Mình đổi một điểm so với đề xuất bạn vừa đồng ý.** Lúc soạn plan, mình đối chiếu với hướng dẫn trong skill và thấy Soak nên chạy ở khoảng 70–80 % bậc ổn định cuối của Stress. Stress có think time ổn định tới 400 VU, nên mức hợp lý là **300 VU**. Con số 50 VU mình đề xuất trước đó chỉ bằng khoảng 12 % mức này, quá nhẹ để thấy xu hướng RAM trong 15 phút. Vì vậy plan để mặc định 300 VU. Mình đã ghi lý do vào `audit/P4-soak.md`. Nếu bạn vẫn muốn 50 VU thì thêm `-J threads=50` vào lệnh.<br />
<br />
**Chạy Soak (16 phút)**, ở thư mục `HW05`:<br />
1. Khởi động lại backend (`tools\start-backend.bat`).<br />
2. Chạy:<br />
```<br />
node skills\jmeter-performance-testing\scripts\prepare-data.mjs --users 500 --accounts-only<br />
cls<br />
node skills\jmeter-performance-testing\scripts\run-scenario.mjs --plan perf\plans\23120399_Soak_20261123.jmx --out perf\results\soak --verify-db "D:\vscode\Software testing\eshop-sut\backend\database.sqlite"<br />
```<br />
<br />
**Chụp 3 ảnh** (toàn màn hình, tab Details sắp theo CPU time) để thấy RAM thay đổi theo thời gian:<br />
- khoảng `00:02:00`<br />
- khoảng `00:08:00`<br />
- khoảng `00:14:00`<br />
<br />
đã ghi audit</td>
<td>VALID</td>
<td>Tham số theo 75% bậc ổn định của Stress; chạy đúng 15 phút, lỗi 0%, đối chiếu DB khớp 32 396 đơn. Không phải sửa sau smoke. ISTQB CT-PT (kiểm thử độ bền).</td>
<td>Không sửa.</td>
</tr>
<tr class="odd">
<td>Artifact #7: Phân tích .jtl của AI (Task 2)<br />
Tool: Claude (phiên phân tích riêng)<br />
Thời gian: 25/11/2026<br />
Prompt (`perf/analysis/analysis-prompt.md`):<br />
Bạn là kỹ sư kiểm thử hiệu năng. Bạn sẽ phân tích kết quả chạy JMeter của một ứng dụng web thương mại điện tử (EShop, backend Node.js/Express, cơ sở dữ liệu SQLite). Dữ liệu đính kèm gồm:<br />
<br />
- Các file `.md` tóm tắt, tạo bởi một script tính phân vị theo phương pháp nearest-rank từ file `.jtl`.<br />
- Dòng tiêu đề và khoảng 200 dòng đầu của file `.jtl` gốc (định dạng CSV của JMeter).<br />
- File `summary.md` và `run-meta.json` của từng kịch bản.<br />
<br />
Có ba kịch bản: Stress (tăng tải theo bậc, không có thời gian suy nghĩ giữa các thao tác), Spike (tăng đột ngột lên đỉnh rồi hạ xuống) và Soak (tải ổn định lâu).<br />
<br />
Hãy làm theo các bước sau và trả lời bằng tiếng Việt.<br />
<br />
1. **Đọc cấu trúc dữ liệu.** Liệt kê các cột trong `.jtl` mà bạn thấy và ý nghĩa của từng cột dùng cho phân tích (ví dụ `timeStamp`, `elapsed`, `label`, `responseCode`, `success`, `Latency`, `allThreads`). Nếu có cột nào bạn không chắc ý nghĩa, nói rõ.<br />
<br />
2. **Tính các chỉ số cho từng kịch bản** từ dữ liệu đính kèm: tổng số mẫu, tỉ lệ lỗi, p50, p90, p95, p99, thông lượng (req/s) trung bình và theo cửa sổ thời gian. Với mỗi số, ghi rõ bạn lấy từ dòng hoặc cột nào, hoặc tính theo công thức nào. Nếu một số không thể tính từ dữ liệu được cung cấp, ghi "không đủ dữ liệu" thay vì ước lượng.<br />
<br />
3. **Xác định điểm gãy** trong kịch bản Stress và Spike, nếu có. Nêu tiêu chí bạn dùng (ví dụ p95 vượt ngưỡng, tỉ lệ lỗi vượt ngưỡng, thông lượng không tăng theo tải). Nếu không có điểm gãy trong dữ liệu, nói rõ.<br />
<br />
4. **Đề xuất ngưỡng** cho từng kịch bản: ngưỡng p95 (ms), ngưỡng tỉ lệ lỗi (%), và ngưỡng thông lượng nếu có ý nghĩa. Với mỗi ngưỡng, nêu lý do dựa trên dữ liệu và nêu rủi ro nếu chọn quá chặt hoặc quá lỏng.<br />
<br />
5. **Đề xuất tối ưu hiệu năng** tối đa 5 mục, xếp theo mức ưu tiên. Với mỗi mục, nêu: vấn đề bạn thấy trong dữ liệu, giả thuyết nguyên nhân, cách kiểm chứng bằng chính dữ liệu này hoặc một lần chạy thêm, và mức độ chắc chắn của bạn.<br />
<br />
6. **Điều không chắc chắn.** Liệt kê những chỗ bạn không chắc, và những gì bạn cần thêm để kết luận chắc hơn.<br />
<br />
Quy tắc:<br />
- Chỉ dùng số liệu có trong dữ liệu đính kèm. Không bịa số, không suy đoán số liệu của các dòng không được cung cấp.<br />
- Nếu bạn phát hiện mâu thuẫn trong dữ liệu, nêu rõ mâu thuẫn thay vì chọn một bên.<br />
- Trình bày kết quả chính bằng bảng, phần lập luận bằng văn xuôi ngắn.</td>
<td>Kiểm tra dữ liệu đính kèm còn thiếu.<br />
<br />
Mình sẽ không ghi audit lượt này. Tin nhắn chưa kèm dữ liệu, nên mình xem thư mục của bạn có file kết quả JMeter chưa.<br />
<br />
Mình đã phân tích xong và không ghi audit lượt này, theo yêu cầu của bạn.<br />
<br />
Dữ liệu dùng: HW05/perf/results/{stress-nothink,spike,soak}/summary.md và run-meta.json, HW05/perf/analysis/*.md, và analysis/attach/*-head200.jtl. Tổng các cửa sổ 10s khớp đúng tổng mẫu của cả ba kịch bản (432.595 / 110.649 / 195.439).<br />
<br />
1. Cấu trúc .jtl (17 cột)<br />
Cột Ý nghĩa khi phân tích<br />
timeStamp Thời điểm bắt đầu request (epoch ms), dùng chia cửa sổ thời gian<br />
elapsed Thời gian phản hồi (ms), dùng tính p50/p90/p95/p99<br />
label Tên request (AUTH login, READ list, TXN checkout…), dùng gom theo nhóm<br />
responseCode / responseMessage Mã HTTP / thông điệp<br />
threadName Tên thread, cho biết bậc (stress) hoặc nhóm nền/đỉnh (spike)<br />
dataType Kiểu dữ liệu, trong dữ liệu là text; không dùng<br />
success Cờ JMeter, dùng tính tỉ lệ lỗi<br />
failureMessage Thông điệp lỗi (trống trong các dòng đã xem)<br />
bytes / sentBytes Kích thước nhận / gửi<br />
grpThreads / allThreads Số thread đang chạy của nhóm / toàn bộ, dùng xác định mức tải<br />
URL Endpoint<br />
Latency Thời gian tới byte đầu tiên; trong 200 dòng đầu gần bằng elapsed<br />
IdleTime Luôn bằng 0 trong dữ liệu đã xem<br />
Connect Thời gian kết nối TCP<br />
<br />
Các điểm mình không chắc:<br />
<br />
allThreads luôn bằng grpThreads + 1 (ví dụ 1→2). Mình không biết thread thứ hai là gì.<br />
IdleTime luôn 0, nên không rõ ý nghĩa trong plan này.<br />
Mình chỉ có 200 dòng đầu của .jtl, nên toàn bộ số liệu của cả lượt chạy lấy từ summary.md, không tự tính lại được.<br />
2. Chỉ số theo kịch bản<br />
Chỉ số Stress (no-think) Spike Soak Nguồn<br />
Tổng mẫu 432.595 110.649 195.439 summary.md, bảng Tổng, cột Mẫu<br />
Lỗi % 0 0 0 cột Lỗi %; xem mâu thuẫn bên dưới<br />
p50 (ms) 20 67 1 bảng Tổng<br />
p90 (ms) 85 340 3 bảng Tổng<br />
p95 (ms) 165 411 4 bảng Tổng<br />
p99 (ms) 367 486 6 bảng Tổng<br />
Max (ms) 565 594 39 bảng Tổng<br />
RPS trung bình 1442,5 263,6 217,2 mẫu / (lastEnd − firstStart)<br />
Mã 401 / 403 29 / 30 30 / 53 59 / 120 cột Mã trả về<br />
<br />
Với từng cửa sổ 10s, summary.md chỉ có số mẫu, RPS, lỗi %, p95, avg và threads. p50, p90, p99 theo cửa sổ: không đủ dữ liệu.<br />
<br />
Stress theo bậc. Mình tính trung bình RPS từ số mẫu của 6 cửa sổ mỗi bậc. p95 lấy từ bảng cửa sổ.<br />
<br />
Bậc (thread) RPS trung bình p95 cửa sổ (ms) Avg (ms)<br />
10 1512 13–18 4–7<br />
20 1410 28–37 11–15<br />
40 1388 55–83 22–30<br />
80 1488 160–173 (bỏ cửa sổ ramp) 53–54<br />
160 1413 296–400 83–121<br />
<br />
Spike. Nền 51 thread cho 37–39 RPS, p95 3–6 ms. Đỉnh 251 thread (cửa sổ 120–180s) cho 1452–1777 RPS, p95 từ 264 tăng đến 476 ms. Cửa sổ 180–190s đã về RPS 37,1 và p95 4 ms.<br />
<br />
Soak. Ramp đến 301 thread trong 60s. Sau đó RPS 219,7–229,8 và p95 3–6 ms trong 90 cửa sổ (900s).<br />
<br />
3. Điểm gãy<br />
<br />
Tiêu chí: lỗi &gt; 1%, p95 &gt; 1000 ms (hai ngưỡng của chính script), hoặc throughput không tăng theo<br />
[… cắt ở đây cho vừa bảng; toàn văn: audit/P8-ai-analysis.md]</td>
<td>INCOMPLETE</td>
<td>Sai: Connect, allThreads, Latency (khái quát từ 200 dòng đầu), "bảng orders 32 396 dòng", khoảng RPS. Đúng: tổng mẫu, phân vị, CPU, RAM. ISTQB FL v4.0 §5.3 (theo dõi và đo lường cần dữ liệu đầy đủ).</td>
<td>Bảng đối chiếu C3 (27 nhận định) trong `audit/P8-ai-analysis.md` và phán quyết ở `docs/AI_Analysis_Review.md`.</td>
</tr>
<tr class="even">
<td>Artifact #8: Đề xuất tối ưu của AI (Task 2)<br />
Tool: Claude (cùng phiên phân tích)<br />
Thời gian: 25/11/2026<br />
Prompt: bước 5 của prompt phân tích: "Đề xuất tối ưu hiệu năng tối đa 5 mục, xếp theo mức ưu tiên…"</td>
<td>5. Đề xuất tối ưu (xếp theo ưu tiên)<br />
# Vấn đề trong dữ liệu Giả thuyết Cách kiểm chứng Độ chắc<br />
1 RPS phẳng ~1400–1500 từ 10 đến 160 thread; CPU Node chỉ ~8–11% trên 12 lõi Node chạy trên một lõi và bị nghẽn event loop Chạy lại với 2–4 worker (cluster/PM2), so RPS; hoặc --cpu-prof Trung bình–cao<br />
2 TXN checkout chậm nhất: p95 373 ms (stress), 489 ms (spike); các request TXN khác ≤ 87 ms Ghi SQLite mỗi đơn (khóa ghi, fsync) Chạy riêng chỉ checkout; thử WAL, synchronous=NORMAL, gộp thao tác trong một transaction Trung bình–thấp<br />
3 READ list chậm hơn search và detail (p95 159 so với 64 và 67 ms ở stress; 373 so với 138 và 118 ms ở spike) Truy vấn danh sách nặng hơn, hoặc bị chờ khóa ghi từ checkout Chạy riêng chỉ list, đối chiếu lúc có và không có checkout song song; xem EXPLAIN Thấp<br />
4 RAM tăng 70 → 177 MB (soak), 53 → 199 MB, đỉnh 259 MB (stress) Heap tăng bình thường hoặc rò rỉ nhẹ Xem độ dốc RAM theo thời gian trong node-usage.csv; chạy soak dài hơn; heap snapshot Thấp<br />
5 Soak: avg tăng từ ~1,0 lên 2,1–2,3 ms và p95 từ 3 lên 6 ms, bắt đầu cửa sổ 840s và kéo dài đến hết lượt Bảng orders lớn dần (32.396 dòng), hoặc GC Đối chiếu thời điểm 840s với node-usage.csv; chạy soak dài hơn xem có tiếp tục tăng Thấp</td>
<td>INCOMPLETE</td>
<td>Chạy nhiều tiến trình Node không áp dụng được ngay (giỏ hàng trong bộ nhớ, `DROP TABLE` khi khởi động); gộp transaction/trừ kho không áp dụng được (checkout chỉ có một INSERT); phân trang không có lợi ích (5 sản phẩm); WAL áp dụng được. ISTQB FL v4.0 §1.3 (kiểm thử phụ thuộc ngữ cảnh).</td>
<td>Bảng phân loại C4 dựa trên `server.js`, `database.js` trong `audit/P8-ai-analysis.md`.</td>
</tr>
<tr class="odd">
<td>Artifact #9: Bug report (4 bug + 1 vấn đề hiệu năng)<br />
Tool: Claude (Opus 5.5)<br />
Thời gian: 13:11 23/11/2026<br />
Prompt:<br />
làm đi</td>
<td>Mình đã soạn xong các bug report, đối chiếu từng lỗi với đặc tả `eshop-sut/README.md` và bằng chứng gốc, rồi commit. Theo PLAN (mục B8), AI soạn còn **bạn đăng Issue**, nên mình chưa đăng gì lên GitHub.<br />
<br />
| Mã | Lỗi | Mức độ | Bằng chứng chính |<br />
|---|---|---|---|<br />
| BUG-01 | Checkout không xóa giỏ hàng (FR-08) | Cao | RAM không giảm sau Spike (186 MB lúc kết thúc), tăng đều trong Soak |<br />
| BUG-02 | Thêm cùng sản phẩm tạo dòng mới thay vì tăng số lượng (FR-07) | Trung bình | `server.js` dòng 290–295, làm BUG-01 nặng thêm |<br />
| BUG-03 | Khóa ngay sau lần sai thứ 2, khóa 180 s thay vì 30 s (FR-02) | Cao | Chuỗi 401 → 401 → **403** của lock01 trong .jtl; DB có `login_attempts = 12` sau 6 lần sai (mỗi lần +2) |<br />
| BUG-04 | Backend nhận `total_amount` từ client (FR-08) | Nghiêm trọng | Mã nguồn + 10 mức tổng trong DB khớp đúng các tích giá × số lượng do JMeter tự tính |<br />
| PERF-01 | Checkout là nút cổ chai khi bão hòa | Hiệu năng | p99 501 ms ở 160 VU (Stress), 540 ms lúc đỉnh Spike |<br />
<br />
Các lỗi SQL injection, `/api/products/:id` trả `{}` và lộ mật khẩu là lỗi bảo mật/chức năng, không do kiểm thử hiệu năng phát hiện, nên mình chỉ ghi là "ngoài phạm vi" trong `docs/Bug_Report.md`.<br />
<br />
**Bạn cần làm:**<br />
1. **BUG-04 cần bạn tái hiện bằng tay** để có ảnh, vì hiện mới xác nhận qua mã nguồn. Ở PowerShell, khi backend đang chạy:<br />
```<br />
$t = (Invoke-RestMethod -Method Post http://localhost:3000/api/login -ContentType 'application/json' -Body '{"email":"perf001@test.local","password":"Perf@12345"}').token<br />
Invoke-RestMethod -Method Post http://localhost:3000/api/checkout -Headers @{Authorization="Bearer $t"} -ContentType 'application/json' -Body '{"total_amount":1,"shipping_address":"HCM"}'<br />
```<br />
Nếu kết quả là `Checkout successful` thì chụp lại màn hình.<br />
2. **Đăng 5 Issue** lên `NguyenSonTung16/HW05`. Tiêu đề lấy từ dòng `#` đầu file, nội dung là phần còn lại của file `bug-reports\BUG-0x.md` / `PERF-01.md`. Nếu máy có `gh`, có thể dùng:<br />
```<br />
gh issue create --repo NguyenSonTung16/HW05 --title "&lt;tiêu đề&gt;" --body-file bug-reports\BUG-01.md<br />
```<br />
3. Gửi mình số Issue sau khi đăng, mình sẽ điền vào cột "Issue" trong `docs/Bug_Report.md`.<br />
<br />
Trong lúc bạn đăng, mình có thể làm tiếp **Task 2** (cho AI phân tích .jtl và bắt chỗ hiểu sai). Bạn muốn mình bắt đầu luôn không?<br />
<br />
đã ghi audit</td>
<td>VALID</td>
<td>Mỗi bug có bằng chứng từ `.jtl`, DB và mã nguồn; sinh viên đăng 5 Issue kèm ảnh. ISTQB FL v4.0 §5.5 (quản lý lỗi).</td>
<td>Không sửa nội dung; bổ sung ảnh tái hiện thủ công BUG-04 và liên kết Issue.</td>
</tr>
<tr class="even">
<td>Artifact #10: Đề xuất kiểm thử liên tục (Task 3)<br />
Tool: Claude (Sonnet 5.5)<br />
Thời gian: 14:13 25/11/2026<br />
Prompt:<br />
làm tiếp theo ưu tiên của bạn</td>
<td>Mình đang làm Task 3 (D), `docs/CPT_Proposal.md`. Máy của bạn đang khởi động lại nên mình đọc PLAN.md qua bản đã chép sang để lấy yêu cầu.<br />
<br />
Mình đã soạn xong Task 3 (D) và lưu vào `docs/CPT_Proposal.md`. File gồm:<br />
- lưu đồ Mermaid: webhook, lọc thay đổi, smoke perf, so p95 với baseline, lặp 2/3 lần, chạy đầy đủ, cảnh báo hoặc chặn merge;<br />
- bảng ngưỡng, lấy từ dữ liệu HW05 (p95 tối đa 400/476/6 ms, RPS cửa sổ 1302–1657);<br />
- bảng đánh đổi chi phí;<br />
- mục báo động giả và nhiễu môi trường.<br />
<br />
Các ngưỡng là đề xuất của mình, chưa đo trên CI thật, nên bạn đọc lại mục này.<br />
<br />
Lượt này chưa ghi được log: máy ảo Linux trên thiết bị của bạn không khởi động được nên `append-ai-log.mjs` không chạy. Mình sẽ ghi bù hàng này ở lượt kế tiếp, trước khi ghi hàng mới. Mình cũng chưa tick D trong `PLAN.md` và chưa commit, vì git cũng cần môi trường đó.<br />
<br />
Bước tiếp theo là Task E: skill v2 kèm changelog và kịch bản video.</td>
<td>INCOMPLETE</td>
<td>Ngưỡng và tham số là đề xuất lấy từ dữ liệu HW05, chưa đo trên CI thật. ISTQB FL v4.0 §5.1 (kế hoạch) và CT-PT.</td>
<td>Sinh viên đọc và chỉnh ngưỡng trước khi nộp.</td>
</tr>
<tr class="odd">
<td>Artifact #11: Tài liệu nộp (README, Main_Report, AI_Critique)<br />
Tool: Claude (Sonnet 5.5)<br />
Thời gian: 14:45 25/11/2026<br />
Prompt:<br />
làm đi</td>
<td>Mình đã soạn và chép vào HW05: `README.md` (bảng tự chấm để trống, test summary), `docs/Main_Report.md` và `.pdf`, `docs/AI_Critique.md` và `.pdf` (khoảng 295 từ), `docs/AI_Audit_Report.md` và `.pdf` (11 artifact theo mẫu AI-02, 3 VALID và 8 INCOMPLETE). Mình cũng tạo `Git_Commit_Log.txt` từ `git log`. Tác giả commit NguyenSonTung16, không có dòng Co-Authored-By, chưa push.<br />
<br />
Bạn cần làm hoặc kiểm tra:<br />
- **Điền** họ tên và lớp/khóa trong `AI_Audit_Report`, link video trong `README`, điểm tự chấm.<br />
- **Đọc và sửa** `AI_Critique` cho đúng giọng của bạn, và các verdict trong `AI_Audit_Report` (mình điền từ review P5, C3 và C4, bạn xác nhận).<br />
- Số liệu trong `Main_Report` mình lấy từ `summary.md` và `node-usage.csv`. Phần cứng chỉ ghi theo `run-meta.json` (MSI, Ryzen 5 5600H, 15,4 GB). Ảnh dxdiag hoặc screenfetch vẫn chưa có, bạn chụp và bỏ vào `evidence/hardware/`.<br />
- Báo cáo ghi mục Task 3 là đề xuất, chưa triển khai.<br />
<br />
Còn thiếu: báo cáo phần cứng, video, và zip nộp bài (kiểm tra dung lượng vì `.jtl` thô khoảng 176 MB).<br />
<br />
đã ghi audit</td>
<td>INCOMPLETE</td>
<td>Bản nháp do AI soạn từ số liệu trong repo; AI Critique cần giọng của sinh viên và số liệu cần đối chiếu lại. ISTQB FL v4.0 §5.3.</td>
<td>Sinh viên đọc và sửa trước khi nộp.</td>
</tr>
</tbody>
</table>

## 4. Tổng kết Độ chính xác AI

Tổng hợp verdict từ Mục 3 và điền vào bảng dưới.

| Chỉ số                             | Số lượng | Tỉ lệ |
|------------------------------------|----------|-------|
| Tổng artifact AI sinh đã audit     | 11       | 100%  |
| VALID (đúng, dùng nguyên)          | 3        | 27%   |
| INVALID (sai; loại bỏ)             | 0        | 0%    |
| INCOMPLETE (chấp nhận sau khi sửa) | 8        | 73%   |

## 5. Kết luận — Khi nào nên / không nên dùng AI?

Viết 80–150 chữ mô tả pattern quan sát được. AI mạnh ở đâu? AI sai ở đâu? Khuyến nghị của bạn cho việc dùng AI trong loại công việc này?

AI mạnh ở việc dựng khung (workflow, plan, script, báo cáo) và đọc nhanh số liệu tổng hợp. AI yếu ở chỗ cần hiểu hành vi thật của hệ thống và dữ liệu đầy đủ: chọn mô hình người dùng không thực tế (đăng nhập lại mỗi vòng, dùng chung CSV), khái quát từ 200 dòng \`.jtl\` đầu (Connect, allThreads, Latency) và đề xuất tối ưu không khớp kiến trúc (giỏ hàng trong bộ nhớ, SQLite một file). Khuyến nghị: dùng AI để sinh và diễn giải, nhưng số liệu phải do script tính từ dữ liệu thô, mọi plan và đề xuất phải qua review của người và đối chiếu mã nguồn trước khi dùng.

## 6. Mandatory Disclosure (dán nguyên văn)

> Các artifact (test plan JMeter, script của Agent Skill, báo cáo phân tích, đề xuất kiểm thử liên tục, bản nháp tài liệu nộp) trong HW05 được sinh phiên bản đầu bởi Claude (Anthropic); tôi đã rà soát và chỉnh sửa các plan Load, Stress, Spike theo review P5 (đăng nhập một lần/VU, CSV riêng cho từng VU, Ignore Status cho nhánh đăng nhập sai, số VU theo smoke), bổ sung kiểm tra DB và đối chiếu từng nhận định phân tích của AI với dữ liệu \`.jtl\` thô; việc chạy kịch bản, chụp ảnh bằng chứng, đăng GitHub Issues và duyệt từng bước do tôi tự thực hiện. AI Audit Report chi tiết đính kèm ở Phụ lục A. Tôi cam đoan không dùng AI để sinh bất kỳ artifact nào thuộc danh mục bị cấm (tên file plan, \`.jtl\` thô, ảnh bằng chứng, video, hostname).

## Chữ ký

| Họ tên sinh viên (in hoa): |                                                                                                              |
|----------------------------|--------------------------------------------------------------------------------------------------------------|
| MSSV:                      | \[ĐIỀN HỌ TÊN IN HOA\]                                                                                       |
| Lớp / Khoá:                | 23120399                                                                                                     |
| Môn học:                   | \[ĐIỀN LỚP / KHOÁ\]                                                                                          |
| Giảng viên:                |                                                                                                              |
| Ngày:                      | Dr. Lam Quang Vu / Dr. Tran Duy Hoang / MSc. Tran Thi Bich Hanh / MSc. Truong Phuoc Loc / MSc. Ho Tuan Thanh |
| Chữ ký:                    | 25/11/2026                                                                                                   |

## Tham khảo

- Kharbach, M. (2026). AI Use Policy Templates for Higher Education. CC BY-NC-SA 4.0.

- ISTQB Foundation Level Syllabus (latest version).

- Hardman, P. (2025). A Post-AI Learning Taxonomy.

- Fuster Rabella, M. (2025). OECD Education Working Paper No. 338.

- Perkins, M., Roe, J., & Furze, L. (2025). AI Assessment Scale.

- Anthropic (2025). Building reliable AI test agents — engineering blog.

- DeepEval & Promptfoo documentation — testing frameworks for LLM systems.
