# HW05 – Performance Testing (MSSV 23120399)

SUT: EShop (Node.js/Express + SQLite). Công cụ: JMeter 5.6.3. Repo: https://github.com/NguyenSonTung16/HW05

## Bảng tự chấm

| No. | Tiêu chí | Điểm tối đa | Tự chấm |
|---|---|---|---|
| 1 | Task 1 – Load testing | 30 | 28 |
| 2 | Task 1 – Stress testing | 20 | 18 |
| 3 | Task 1 – Spike testing | 20 | 18 |
| 4 | Task 2 – Phân tích AI và săn lỗi diễn giải (số đúng lấy từ log thô) | 10 | 9 |
| 5 | Task 3 – Đề xuất kiểm thử hiệu năng liên tục | 10 | 9 |
| 6 | Agent Skills | 10 | 9 |
| | **Tổng** | **100** | **91** |

## Test summary

- **Kịch bản đã chạy:** Load (50 VU, 7 phút), Stress có think time (5 bậc đến 400 VU, 15 phút), Stress không think time (10→160 VU, 5 phút), Spike (nền 50 VU, đỉnh thêm 200 VU), Soak (300 VU, 15 phút). Lượt `load` đầu (`threads=500`) hỏng do thiếu tài khoản, giữ làm bằng chứng.
- **Nhóm endpoint:** auth-heavy (`POST /api/login`), read-heavy (`GET /api/products`, `?search=`, `/:id`), transactional (`POST/GET /api/cart`, `POST /api/checkout`). Một workflow 7 bước dùng chung cho mọi kịch bản.
- **Ngưỡng bền (Soak 15 phút, 300 VU có think time):** ổn định tối đa 229,8 req/s (cửa sổ 10 s; sau ramp dao động 219,7–229,8), p95 4 ms, p99 6 ms, lỗi 0%, RAM Node 70,2 → 176,8 MB (đỉnh 179,6 MB). Không think time, backend bão hòa khoảng 1 400–1 500 req/s.
- **Bug và vấn đề hiệu năng:** 5 mục (4 bug và 1 vấn đề hiệu năng): [#1](https://github.com/NguyenSonTung16/HW05/issues/1) giỏ không bị xóa sau checkout, [#2](https://github.com/NguyenSonTung16/HW05/issues/2) thêm trùng sản phẩm tạo dòng mới, [#3](https://github.com/NguyenSonTung16/HW05/issues/3) khóa tài khoản sai quy tắc, [#4](https://github.com/NguyenSonTung16/HW05/issues/4) `total_amount` do client gửi, [#5](https://github.com/NguyenSonTung16/HW05/issues/5) checkout là nút cổ chai.
- **Video demo (YouTube unlisted):**

  | Video | Nội dung | Link |
  |---|---|---|
  | Load test | Kịch bản Load | https://youtu.be/w_qHinh6TRc |
  | Stress test | Kịch bản Stress | https://youtu.be/e0WDSPOYQGo |
  | Spike test | Kịch bản Spike | https://youtu.be/TzEymSSx7Po |
  | Soak test | Ngưỡng bền (Soak) | https://youtu.be/Bg4aLzWKOrU |
  | Agent Skill | Demo skill `jmeter-performance-testing` (mục 7 của đề) | https://youtu.be/Ty9wn1Vc9yQ |

## Cấu trúc thư mục

| Đường dẫn | Nội dung |
|---|---|
| `docs/Main_Report.md`, `.pdf` | Báo cáo chính |
| `docs/AI_Critique.md`, `.pdf` | AI Critique (200–300 từ) |
| `docs/AI_Audit_Report.docx`, `.pdf`, `.md` | AI Audit Report (điền vào mẫu AI-02, PDF xuất từ file Word) |
| `docs/AI_Analysis_Review.md`, `docs/CPT_Proposal.md`, `docs/Bug_Report.md` | Task 2, Task 3, bug report |
| `perf/plans/` | Test plan `23120399_{Load,Stress,Spike,Soak}_{ngày}.jmx` |
| `perf/data/` | CSV đầu vào |
| `perf/results/` | `.jtl` thô, `html/`, `node-usage.csv`, `run-meta.json`, `summary.md` |
| `evidence/screenshots/` | Ảnh JMeter, Task Manager, GitHub Issues |
| `skills/jmeter-performance-testing/` | Agent Skill v2.0 |
| `audit/` | Nhật ký AI (`AI_LOG.md`) và các bước P1–P8 |
| `Git_Commit_Log.txt` | Lịch sử commit |
