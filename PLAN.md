# HW05 – Performance Testing: Kế hoạch & theo dõi tiến độ

- **Sinh viên:** 23120399
- **Đề:** `docs/HW05_Performance_Testing_En.pdf`
- **Công cụ đề xuất:** Apache JMeter 5.6.x (chạy non-GUI để lấy số liệu), Task Manager + PowerShell ghi CPU/RAM của tiến trình `node`, Claude (AI)
- **Lập ngày:** 2026-11-18. Sinh viên duyệt kế hoạch và chốt D1–D4 lúc 10:34 ngày 2026-11-18.

> Quy ước: `[ ]` chưa làm, `[x]` xong. **(BẠN)** = việc sinh viên tự làm để bằng chứng là thật (đề mục 11 cấm AI sinh hay làm giả: tên file plan, `.jtl` thô, video, hostname trong báo cáo phần cứng). Mọi số liệu AI đưa ra trước khi chạy đều là **dự đoán**.

---

## 0. Quyết định (đã chốt 2026-11-18)

| # | Nội dung | Đề xuất | Ghi chú |
|---|---|---|---|
| D1 | 3 nhóm endpoint | auth-heavy = `POST /api/login`; read-heavy = `GET /api/products`, `GET /api/products?search=`, `GET /api/products/:id`; transactional = `POST /api/cart`, `POST /api/checkout` (+ `GET /api/cart` kiểm tra) | Đã chốt: phù hợp, không trùng |
| D2 | Công cụ | JMeter (mặc định của đề); k6 chỉ là điểm cộng, không làm | Đã chốt: máy đã có Java và JMeter |
| D3 | SUT | backend `localhost:3000` (SQLite) như HW04; test gọi thẳng API, không qua web | |
| D4 | Repo | https://github.com/NguyenSonTung16/HW05.git | Gốc repo = cả thư mục `HW05` (chốt 11:05) |
| D5 | Vị trí skill | `HW05/skills/jmeter-performance-testing/` (nằm trong zip, như HW04) | |
| D6 | Tài khoản test | tạo `perf001…perf100@test.local` qua `POST /api/register`; tài khoản riêng `lock01…lock10` cho nhánh khóa tài khoản; không đụng admin hay dữ liệu cũ | |
| D7 | Ngày trong tên plan | ngày chạy thật, ví dụ `23120399_Load_20261119.jmx` | |

---

## 1. Thứ tự lớn (đúng yêu cầu: soạn skill trước, rồi áp dụng)

| Giai đoạn | Nội dung | Cổng duyệt |
|---|---|---|
| **A** | Soạn Agent Skill `jmeter-performance-testing` (SKILL.md + templates + scripts) | **DỪNG**: bạn review skill trước khi dùng |
| **B** | Áp dụng skill cho FR của bài: P1→P8 (Task 1) | DỪNG sau P1 (danh sách endpoint/kịch bản) và sau P4 (plan AI sinh, trước khi chạy) |
| **C** | Task 2 (AI phân tích `.jtl`, săn lỗi hiểu sai, phân loại tối ưu) | DỪNG để bạn ghi phán quyết |
| **D** | Task 3 (đề xuất kiểm thử hiệu năng liên tục) | |
| **E** | Cập nhật skill v2 từ bài học thực tế + quay video demo skill trên một nhóm endpoint trọn vẹn | |
| **F** | Báo cáo, AI Critique, AI Audit Report (template AI-02), README tự chấm, git log, đóng gói zip | **(BẠN)** kiểm tra lần cuối |

---

## 2. Cấu trúc thư mục dự kiến

```
HW05/
├─ PLAN.md, README.md (bảng tự chấm + test summary + link video)
├─ skills/jmeter-performance-testing/
│  ├─ SKILL.md
│  ├─ templates/  plan.template.jmx | users.csv.template | scenario-params.md | review-checklist.md | analysis-prompt.md
│  └─ scripts/    jtl-summary.mjs | prepare-data.mjs | db-snapshot.mjs | reset-lockout.mjs | sqlite-open.mjs | monitor-node.ps1 | run-scenario.mjs | test/
├─ perf/                         ← repo GitHub HW05
│  ├─ plans/  23120399_Load_YYYYMMDD.jmx | 23120399_Stress_YYYYMMDD.jmx | 23120399_Spike_YYYYMMDD.jmx | (soak)
│  ├─ data/   users.csv | products.csv | orders.csv | lock-users.csv
│  ├─ results/<scenario>/  <tên plan>.jtl (thô, đầy đủ) | html/ (dashboard JMeter) | node-usage.csv
│  └─ scripts/ (bản dùng thật của các script trong skill)
├─ evidence/  hardware/ (dxdiag, bảng cấu hình) | screenshots/<scenario>/ (JMeter + Task Manager cùng khung)
├─ docs/  Main_Report.md/.pdf | AI_Analysis_Review.md | AI_Critique.md/.pdf | AI_Audit_Report.md/.docx/.pdf | CPT_Proposal.md | Bug_Report.md | Git_Commit_Log.txt | Kich_ban_video_*.md
├─ bug-reports/
└─ audit/  AI_LOG.md | P*-*.md (ghi chép từng bước) | artifacts/
```

---

## 3. Giai đoạn A – Soạn Agent Skill trước (10 điểm)

**Mục tiêu:** một skill dùng lại được cho bất kỳ nhóm endpoint nào: từ tài liệu API → test plan JMeter data-driven → chạy có bằng chứng → phân tích `.jtl` có kiểm chứng → review AI.

### A1. `SKILL.md` – quy trình P1–P8, mỗi bước ghi `audit/` và commit riêng
- **P1 Phân tích:** endpoint → nhóm (auth/read/transactional), workflow end-to-end, lý do mỗi nhóm được phủ. **DỪNG chờ duyệt.**
- **P2 Khảo sát API:** đọc mã nguồn: body, mã trạng thái, token, trạng thái lưu ở đâu (DB hay bộ nhớ), cơ chế khóa tài khoản, dữ liệu bị tích lũy theo tải.
- **P3 Dữ liệu:** CSV cho tài khoản/ID sản phẩm/payload; seed tài khoản riêng cho test; snapshot DB sạch.
- **P4 Sinh plan bằng AI theo từng bước:** thread group, ramp-up, think-time, CSV Data Set Config, extractor token, assertion (mã + nội dung), listener khác nhau cho mỗi kịch bản, tên file `{MSSV}_{Scenario}_{YYYYMMDD}`. **DỪNG: người review trước khi chạy.**
- **P5 Review:** checklist lỗi AI hay mắc (ramp-up phi thực tế, think-time 0, thread quá lớn/nhỏ so với máy, assertion chỉ kiểm 200, thiếu xử lý khóa tài khoản, CSV dùng chung làm khóa tài khoản, listener nặng khi tải cao, chạy GUI để lấy số liệu) → `audit/P5-review-findings.md` (AI sai gì, vì sao: prompt, giới hạn model hay đặc tính endpoint).
- **P6 Chạy:** smoke 1 VU → kịch bản thật, non-GUI `jmeter -n -t … -l … -e -o …`; reset DB/khóa tài khoản giữa các lượt; chụp JMeter + Task Manager cùng khung; ghi CPU/RAM `node` ra CSV.
- **P7 Ngưỡng bền (soak 10–15 phút):** tải ổn định ~70–80% điểm gãy tìm được ở Stress; báo cáo RPS ổn định tối đa, p95, tỉ lệ lỗi, RAM đỉnh của `node`.
- **P8 Phân tích có kiểm chứng:** script tính số liệu thật từ `.jtl` thô (không phải AI) → cho AI phân tích → so từng con số AI nói với số script tính và dòng `.jtl` gốc → phân loại đề xuất tối ưu khả thi/ảo tưởng.

### A2. Quy tắc bắt buộc của skill (rút từ HW04 và mục 11 của đề)
1. Không chạy kịch bản trước khi plan được người duyệt.
2. Không bịa số liệu, ảnh, `.jtl`; số chưa chạy ghi rõ "dự đoán".
3. Số liệu đối chiếu luôn lấy từ `.jtl` thô qua script tất định; AI chỉ diễn giải.
4. Assertion kiểm cả mã trạng thái và nội dung (ví dụ có `token`, có `orderId`); 401/403/5xx không được tính là thành công.
5. Nhánh khóa tài khoản dùng tài khoản riêng; reset theo đúng email test, không reset rộng.
6. Không chạy hai kịch bản song song; mỗi lượt một thư mục kết quả; DB nạp lại bản sạch trước mỗi lượt.
7. Listener nặng (View Results Tree) chỉ ghi lỗi hoặc chỉ dùng khi mở lại `.jtl`; số liệu chính chạy non-GUI.
8. Nêu rõ cái gì chưa kiểm chứng (giới hạn máy, khác biệt môi trường).

### A3. Templates và scripts
- `plan.template.jmx`: HTTP Request Defaults, Cookie/Header Manager, CSV Data Set Config, JSON Extractor (token), Response Assertion + JSON Assertion, Uniform Random Timer, biến `${__P(threads)}`, `${__P(rampup)}`, `${__P(duration)}` để cùng một plan đổi tham số qua dòng lệnh.
- `jtl-summary.mjs`: đọc `.jtl` CSV → theo từng label: số mẫu, lỗi %, avg, p50/p90/p95/p99, max, throughput (RPS) theo cửa sổ thời gian; xuất Markdown + JSON (là "giá trị đúng" để bắt lỗi AI ở Task 2).
- `prepare-data.mjs` (tạo tài khoản qua API, không trùng; xuất CSV), `db-snapshot.mjs` (lưu/khôi phục DB, từ chối khi backend còn chạy), `reset-lockout.mjs` (chỉ `perf%`, `lock%`), `monitor-node.ps1` (CPU/RAM tiến trình `node` mỗi giây ra CSV), `run-scenario.mjs` (kiểm tra tên plan + SUT → giám sát → JMeter non-GUI → HTML → tóm tắt). Đổi so với bản đề xuất: `seed-users.mjs` → `prepare-data.mjs`, `run-scenario.bat` → `run-scenario.mjs` (cùng một script chạy được trên Windows), thêm `db-snapshot.mjs`, `sqlite-open.mjs`.
- `review-checklist.md`, `analysis-prompt.md` (prompt chuẩn cho bước P8), `scenario-params.md` (bảng tham số gợi ý và cách hiệu chỉnh theo máy).

### A4. Kiểm tra skill
- Kiểm tra cú pháp/logic script bằng dữ liệu `.jtl` mẫu nhỏ **tự tạo và ghi rõ là dữ liệu giả để test script** (không dùng làm bằng chứng nộp bài).
- [x] A1–A4 soạn xong 2026-11-18; ghi chú `audit/A-skill-v1-notes.md` (10/10 test + test reset trên bản sao DB; một lỗi tự phát hiện và đã sửa).
- [x] Sinh viên review skill (10:58), commit skill v1; v1.1 sau P2 (SUT tự tạo lại DB khi khởi động).

---

## 4. Giai đoạn B – Áp dụng skill cho Task 1 (70 điểm)

Điều đã thấy từ mã nguồn (`eshop-sut/backend/server.js`, cần xác nhận khi chạy):
- `POST /api/login`: sai mật khẩu cộng `login_attempts += 2`, khóa khi ≥ 3 (tức khóa ngay lần sai thứ 2, lệch quy tắc 3 lần), khóa 180 giây, trả 403.
- Giỏ hàng lưu trong bộ nhớ (`userCarts`), `checkout` không xóa giỏ → giỏ tăng mãi theo tải: ứng viên vấn đề RAM khi soak.
- `checkout` nhận `total_amount` từ client, ghi đơn vào SQLite → mỗi lượt sinh dữ liệu, cần nạp lại DB sạch.

| Bước | Việc | Ai | Đầu ra |
|---|---|---|---|
| B0 | Báo cáo phần cứng: dxdiag + bảng cấu hình, hostname phải khớp bài trước | **(BẠN)** chụp | `evidence/hardware/` |
| B1 (P1) ✅ đã duyệt 11:05 | Workflow: login (CSV) → list → search → detail → add cart → get cart → checkout; nhánh phụ đăng nhập sai trên `lock*`. **DỪNG duyệt** | AI đề xuất | `audit/P1-workflow.md` |
| B2 (P2) ✅ | Khảo sát API chi tiết; reset = khởi động lại backend + `prepare-data --accounts-only` | AI | `audit/P2-api-survey.md` |
| B3 (P3) ✅ 11:17 (110 tài khoản, 5 sản phẩm) | CSV + seed tài khoản (không cần snapshot DB: backend tự tạo lại DB) | AI soạn, **(BẠN)** chạy seed | `perf/data/*.csv` |
| B4 (P4) Load ✅ 11:47 | AI sinh 3 plan theo từng prompt riêng. Tham số dự đoán ban đầu (hiệu chỉnh sau smoke): Load ~50 VU, ramp 60 s, giữ 5 phút, think 1–3 s; Stress bậc 25→50→100→200→400 VU đến khi lỗi > 5% hoặc p95 vượt ngưỡng; Spike 10 VU nền → ~300 VU trong 5 s giữ 60 s → về 10 VU. Listener: Load = Summary Report, Stress = Aggregate Report, Spike = View Results Tree (chỉ lỗi). **DỪNG duyệt** | AI | `perf/plans/*.jmx` |
| B5 (P5) Load ✅ 12:01 (6 phát hiện của SV) | Review và sửa plan, ghi AI sai gì và vì sao | **(BẠN)** review, AI sửa | `audit/P5-review-findings.md` |
| B6 (P6) | Smoke → Load → reset → Stress → reset → Spike; mỗi lượt `.jtl` + HTML + ảnh cùng khung + `node-usage.csv` | **(BẠN)** chạy & chụp | `perf/results/`, `evidence/screenshots/` |
| B7 (P7) | Soak 10–15 phút, kết luận ngưỡng bằng số | **(BẠN)** chạy, AI tính từ `.jtl` | mục ngưỡng trong Main_Report |
| B8 | Bug/vấn đề hiệu năng thật lên GitHub Issues kèm ảnh | AI soạn, **(BẠN)** đăng | `docs/Bug_Report.md` |
| B9 | Video Task 1 ≥ 6 phút, JMeter + Task Manager cùng khung, tự thuyết minh tiếng Việt | **(BẠN)** quay; AI soạn kịch bản | `docs/Kich_ban_video_Task1.md` |

---

## 5. Giai đoạn C – Task 2 (10 điểm)
- [x] C1 Chạy `jtl-summary.mjs` trên 3 `.jtl` → bảng "giá trị đúng".
- [x] C2 Cho AI (phiên riêng, prompt ghi nguyên văn) phân tích `.jtl` và đề xuất ngưỡng.
- [x] C3 Bảng săn lỗi: nhận định AI ↔ giá trị đúng (trích dòng/cột `.jtl` thô) ↔ giải thích (ví dụ nhầm avg với p95, tính RPS cả thời gian ramp-up, gộp mẫu lỗi vào thời gian đáp ứng, nhầm `elapsed` với `Latency`).
- [x] C4 AI đề xuất tối ưu → phân loại khả thi/ảo tưởng có lập luận dựa trên mã nguồn (ví dụ: "connection pool" cho SQLite một file; index cho `LIKE '%x%'`; bật WAL; xóa giỏ sau checkout).
- [ ] C5 **(BẠN)** ghi phán quyết cuối → `docs/AI_Analysis_Review.md`.

## 6. Giai đoạn D – Task 3 (10 điểm)
- [ ] Mô hình CI: webhook commit SUT → lọc thay đổi (backend/DB/route) → smoke perf ngắn → so p95 với baseline (ngưỡng % + số lần lặp) → chạy đầy đủ khi nghi ngờ → cảnh báo/chặn merge. Flow chart Mermaid, bàn đánh đổi chi phí, báo động giả, nhiễu môi trường. → `docs/CPT_Proposal.md`.

## 7. Giai đoạn E – Skill v2 và video demo skill
- [ ] Cập nhật skill theo bài học thật (changelog v1→v2), commit riêng.
- [ ] Video demo skill trên một nhóm endpoint trọn vẹn (đề xuất read-heavy), **(BẠN)** quay; AI soạn kịch bản `docs/Kich_ban_video_Skill.md`.

## 8. Giai đoạn F – Tài liệu và nộp bài
- [ ] Main_Report (MD + PDF): phạm vi, workflow, tham số, kết quả 3 kịch bản, ngưỡng bền, bug, Task 2, Task 3.
- [ ] AI_Critique 200–300 từ (MD + PDF).
- [ ] AI_Audit_Report từ `docs/AI-02_Audit_Template.docx` → PDF, lấy dữ liệu từ `audit/AI_LOG.md`.
- [ ] `Git_Commit_Log.txt`, README (bảng tự chấm + test summary + link video).
- [ ] **(BẠN)** điền điểm tự chấm, đóng gói `23120399_HW05_AI_Performance_<điểm>.zip`.

## 9. Git: mỗi bước một commit
skill v1 → P1 → P2 → P3 data → plan Load / Stress / Spike (mỗi plan một commit) → P5 review fix → kết quả từng kịch bản → soak → Task 2 → Task 3 → skill v2 → docs.

## 10. Rủi ro
- Máy yếu làm JMeter và SUT tranh CPU (cùng máy): ghi rõ trong báo cáo, giới hạn VU theo smoke.
- Khóa tài khoản lệch quy tắc (+2) làm Stress/Spike khóa sớm: đã tách tài khoản `lock*` và reset có ghi bước.
- Giỏ hàng trong bộ nhớ không được reset bằng DB: cần khởi động lại backend giữa các lượt.
- Không trùng workflow trong nhóm: chờ bạn xác nhận D1.
