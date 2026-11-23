# P4 – Plan Stress (AI sinh, chưa review, chưa chạy)

File: `perf/plans/23120399_Stress_20261123.jmx` (đúng mẫu `{StudentID}_{ScenarioType}_{YYYYMMDD}`).

Ghi chú nguồn gốc: file này có mặt trong thư mục lúc 10:40 ICT 2026-11-23, trước khi sinh viên duyệt làm Stress (10:43) và không có bước tạo nó trong log của lượt nào trước đó. Chưa rõ ai/công cụ nào tạo. Vì vậy nó được xem là bản nháp AI chưa kiểm chứng và phải qua review của sinh viên (P5) trước khi chạy; ở P4 chỉ sửa phần mô tả TestPlan (ban đầu còn ghi "LOAD") cho đúng loại kịch bản.

## Cấu trúc
| Bậc | threads | delay (s) | ramp (s) | duration (s) | VU cộng dồn |
|---|---|---|---|---|---|
| 1 | 25 | 0 | 30 | 900 | 25 |
| 2 | 25 | 180 | 30 | 720 | 50 |
| 3 | 50 | 360 | 30 | 540 | 100 |
| 4 | 100 | 540 | 30 | 360 | 200 |
| 5 | 200 | 720 | 30 | 180 | 400 |

Cộng thêm nhóm lockout-probe (1 VU, 5 s/lần, chạy 900 s). Aggregate Report bật, Summary tắt. 5 nhóm cùng đọc `users.csv` (shareMode.all, không recycle) nên 400 VU dùng 400 tài khoản khác nhau; cần `prepare-data.mjs --users 500`.

## Điểm AI tự thấy cần sinh viên quyết
1. Ngưỡng dừng: lỗi > 5 % hoặc p95 > ? ms (đề xuất 500 ms; sinh viên chốt).
2. Think time 1–3 s giữ nguyên hay giảm ở Stress (nếu giảm phải ghi lý do).
3. Mỗi bậc chỉ kéo dài 3–9 phút, bậc 5 chỉ 3 phút: có đủ thời gian để thấy suy giảm hay không.
4. Tải tăng tới ~300 req/s trong khi backend dùng một kết nối sqlite: cần theo dõi CPU/RAM backend và đối chiếu số đơn trong DB (`--verify-db`) như ở Load.
5. Sau lượt chạy: reset lockout (nhánh probe làm khóa lock01–10) và khởi động lại backend trước lượt kế.
