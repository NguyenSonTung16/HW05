# AI Audit Report – HW05 Performance Testing

*Theo mẫu AI-02 (`docs/AI-02_Audit_Template.docx`). Dữ liệu lấy từ `audit/AI_LOG.md`, nơi lưu nguyên văn prompt và output của từng lượt.*

## 1. Thông tin sinh viên

| Mục | Giá trị |
|---|---|
| Họ tên sinh viên (in hoa) | *(điền)* |
| MSSV | 23120399 |
| Lớp / Khoá | *(điền)* |
| Mã bài tập | HW05 |
| Ngày làm bài | 18/11/2026 – 25/11/2026 |
| Công cụ AI đã dùng | Claude (Opus 5.5, Sonnet 5.5, Haiku 5.5), claude.ai Project “software testing” |
| Có dùng AI | [x] Có  [ ] Không |

Tuyên bố: *I use AI tools for the following tasks* (các artifact dưới đây). Công cụ khác: JMeter 5.6.3 và Task Manager (không phải AI).

## 2. Bảng audit (1 hàng cho mỗi artifact)

Prompt và output nguyên văn của từng lượt nằm trong `audit/AI_LOG.md` (cột Prompt và Output, theo số hàng ghi bên dưới). Cột (1) trích lệnh chính và số hàng.

### Artifact #1: Agent Skill v1 `jmeter-performance-testing`

- **(1) Prompt và công cụ:** Claude (Opus 5.5). Prompt: “hãy lên kế hoạch chi tiết để thực hiện bài tập này, đảm bảo phần Agent Skill (10 điểm) được soạn ra trước…” (AI_LOG hàng #2–#5 (18/11, 10:24–10:59))
- **(2) Output AI:** Skill gồm quy trình P1–P8, script và template (`skills/`, commit 763cc26).
- **(3) Verdict:** INCOMPLETE
- **(4) Lý do:** AI chưa chạy thử trên Windows với tải lớn. Sai sót thật lộ ra khi chạy: đường dẫn có dấu cách, BOM của PowerShell, tràn stack khi tóm tắt ~430 000 mẫu. Dẫn chiếu: ISTQB FL §5 (rủi ro, kiểm thử bằng dữ liệu thật).
- **(5) Bản sinh viên sửa:** Skill v1.1–v1.6 (commit 3beafb5 … 25b0e77), `run-scenario --verify-db`, `--resume`.

### Artifact #2: Workflow P1 (auth, read, transactional)

- **(1) Prompt và công cụ:** Claude (Opus 5.5). Sinh viên duyệt: “đồng ý cho cả 3 câu hỏi”. (AI_LOG hàng #6 (18/11, 11:11))
- **(2) Output AI:** Workflow 7 bước, nhánh đăng nhập sai (`audit/P1-workflow.md`).
- **(3) Verdict:** VALID
- **(4) Lý do:** Workflow phủ đủ ba nhóm endpoint theo đề, không đổi sau duyệt.
- **(5) Bản sinh viên sửa:** Không sửa.

### Artifact #3: Plan Load (AI sinh)

- **(1) Prompt và công cụ:** Claude (Opus 5.5). Prompt: “P4: sinh plan Load”. (AI_LOG hàng #14–#16 (18/11, 11:48–12:04))
- **(2) Output AI:** `23120399_Load_20261118.jmx` (commit cc0cd4a).
- **(3) Verdict:** INCOMPLETE
- **(4) Lý do:** 6 lỗi theo review P5: đăng nhập lại mỗi vòng, CSV dùng chung, think time sai mức, VU đoán, assertion checkout yếu, thiếu Ignore Status. Không mô phỏng hành vi người dùng thật (ISTQB: test model phải có cơ sở thực tế).
- **(5) Bản sinh viên sửa:** Sửa theo `audit/P5-review-findings.md` (commit 644ffb2).

### Artifact #4: Plan Stress (AI sinh)

- **(1) Prompt và công cụ:** Claude (Opus 5.5). “đồng ý làm Stress”. (AI_LOG hàng #25–#27 (23/11))
- **(2) Output AI:** `23120399_Stress_20261123.jmx`, 5 bậc đến 400 VU (commit 24732b8).
- **(3) Verdict:** INCOMPLETE
- **(4) Lý do:** Assertion 401/403, mỗi Thread Group đọc CSV riêng, `users.csv` chỉ 100 tài khoản cho 400 VU.
- **(5) Bản sinh viên sửa:** Commit 898acd9 và 4e3ca3d: sửa assertion, chia sẻ CSV, 500 tài khoản.

### Artifact #5: Plan Spike (AI sinh)

- **(1) Prompt và công cụ:** Claude (Opus 5.5). “làm Spike luôn”; “4 điểm cần quyết làm theo hướng bạn đề xuất”. (AI_LOG hàng #44–#45 (23/11))
- **(2) Output AI:** `23120399_Spike_20261123.jmx` (commit 14e09d6).
- **(3) Verdict:** INCOMPLETE
- **(4) Lý do:** Đỉnh +500 VU trong 5 s vượt sức máy, định nghĩa hồi phục chưa rõ.
- **(5) Bản sinh viên sửa:** Commit 2108edb: đỉnh 200 VU không think time, định nghĩa hồi phục, smoke trước.

### Artifact #6: Plan Soak (AI sinh)

- **(1) Prompt và công cụ:** Claude (Opus 5.5). “ok”. (AI_LOG hàng #50 (23/11, 12:45))
- **(2) Output AI:** `23120399_Soak_20261123.jmx`, 300 VU, 15 phút (commit 10e3394).
- **(3) Verdict:** VALID
- **(4) Lý do:** Tham số theo 75% bậc ổn định của Stress; chạy đúng, 0 lỗi, đối chiếu DB khớp 32 396 đơn. Không sửa sau smoke.
- **(5) Bản sinh viên sửa:** Không sửa.

### Artifact #7: Phân tích `.jtl` của AI (Task 2)

- **(1) Prompt và công cụ:** Claude, phiên phân tích riêng. Prompt: `perf/analysis/analysis-prompt.md`. (AI_LOG hàng #66–#76 (25/11))
- **(2) Output AI:** Phản hồi nguyên văn trong `audit/P8-ai-analysis.md`.
- **(3) Verdict:** INCOMPLETE
- **(4) Lý do:** Sai: Connect, allThreads, Latency (khái quát từ 200 dòng đầu), “bảng orders 32 396 dòng”, khoảng RPS. Đúng: tổng mẫu, phân vị, CPU, RAM. Dẫn chiếu: ISTQB FL §4 (đo lường cần dữ liệu đầy đủ).
- **(5) Bản sinh viên sửa:** Bảng đối chiếu C3 (27 nhận định) và phán quyết ở `docs/AI_Analysis_Review.md`.

### Artifact #8: Đề xuất tối ưu của AI (Task 2)

- **(1) Prompt và công cụ:** Claude, cùng phiên phân tích. (AI_LOG hàng #70–#76 (25/11))
- **(2) Output AI:** 5 đề xuất tối ưu trong `audit/P8-ai-analysis.md`.
- **(3) Verdict:** INCOMPLETE
- **(4) Lý do:** Chạy nhiều tiến trình không áp dụng được ngay; gộp transaction/trừ kho không áp dụng được; phân trang không có lợi ích; WAL áp dụng được.
- **(5) Bản sinh viên sửa:** Bảng phân loại C4 dựa trên `server.js`, `database.js`.

### Artifact #9: Bug report (4 bug, 1 vấn đề hiệu năng)

- **(1) Prompt và công cụ:** Claude. Prompt: “đề yêu cầu bắt buộc tôi là người đăng issue ở chỗ nào”, “cho tôi prompt để yêu cầu thực hiện đăng issue…”. (AI_LOG hàng #56–#62 (23/11))
- **(2) Output AI:** `bug-reports/*.md`, `docs/Bug_Report.md`.
- **(3) Verdict:** VALID
- **(4) Lý do:** Mỗi bug có bằng chứng từ `.jtl`, DB, mã nguồn; sinh viên đăng 5 Issue kèm ảnh.
- **(5) Bản sinh viên sửa:** Không sửa nội dung; thêm ảnh tái hiện thủ công BUG-04.

### Artifact #10: Đề xuất kiểm thử liên tục (Task 3)

- **(1) Prompt và công cụ:** Claude. “làm tiếp theo ưu tiên của bạn”. (AI_LOG hàng #86–#87 (25/11))
- **(2) Output AI:** `docs/CPT_Proposal.md` (commit 5063be9).
- **(3) Verdict:** INCOMPLETE
- **(4) Lý do:** Ngưỡng là đề xuất lấy từ dữ liệu HW05, chưa đo trên CI thật; cần sinh viên đọc lại.
- **(5) Bản sinh viên sửa:** Sinh viên đọc và chỉnh ngưỡng.

### Artifact #11: Tài liệu nộp (README, Main_Report, AI_Critique, Git log)

- **(1) Prompt và công cụ:** Claude. “làm đi”. (AI_LOG hàng #91–#92 (25/11))
- **(2) Output AI:** `README.md`, `docs/Main_Report.md`, `docs/AI_Critique.md`.
- **(3) Verdict:** INCOMPLETE
- **(4) Lý do:** Bản nháp do AI soạn từ số liệu trong repo; phần AI Critique cần giọng của sinh viên.
- **(5) Bản sinh viên sửa:** Sinh viên đọc và sửa trước khi nộp.

## 3. Tổng kết độ chính xác AI

| Chỉ số | Số lượng | Tỉ lệ |
|---|---|---|
| Tổng artifact AI sinh đã audit | 11 | 100% |
| VALID (đúng, dùng nguyên) | 3 | 27% |
| INVALID (sai; loại bỏ) | 0 | 0% |
| INCOMPLETE (chấp nhận sau khi sửa) | 8 | 73% |

## 4. Kết luận – Khi nào nên và không nên dùng AI

AI mạnh ở việc dựng khung (workflow, plan, script, báo cáo) và đọc số liệu tổng hợp nhanh. AI yếu ở những chỗ cần hiểu hành vi thật của hệ thống và dữ liệu đầy đủ: nó chọn mô hình người dùng không thực tế, khái quát từ 200 dòng `.jtl` đầu và đề xuất tối ưu không khớp kiến trúc (giỏ hàng trong bộ nhớ, SQLite một file). Khuyến nghị: giao AI phần sinh và diễn giải, nhưng số liệu phải do script tính từ dữ liệu thô, mọi plan và đề xuất phải qua review của người và đối chiếu mã nguồn trước khi dùng.
