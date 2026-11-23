# P6 – Smoke của plan Load (sau review P5)
Lượt chạy: sinh viên chạy trên máy MSI (AMD Ryzen 5 5600H, 12 luồng, 15,4 GB RAM, Windows 10.0.26300, Node v24.11.1, JMeter 5.6.3), `2026-11-23T03:04:14Z` → `03:05:24Z`. Lệnh: `run-scenario.mjs ... -J threads=2 -J rampup=2 -J duration=60 --verify-db`. Kết quả: `perf/results/smoke-load/` (jtl 93 mẫu, html, jmeter.log, node-usage.csv 68 mẫu, run-meta.json, summary.md/json).
AI (Claude Opus 5.5) đọc lại `.jtl` bằng `jtl-summary.mjs` trên máy ảo: số liệu khớp `summary.md` sinh viên gửi.

## Xác nhận các điểm sửa ở P5
| Điểm | Kỳ vọng | Kết quả thật (trích từ .jtl / summary) | Đạt? |
|---|---|---|---|
| Đăng nhập 1 lần/VU | 2 VU → 2 mẫu `AUTH login` | 2 mẫu, thread `1-1` và `1-2` | Đạt |
| Ignore Status nhánh đăng nhập sai | mẫu 401/403 có `success=true` | 11 mẫu 401, đều `true`; lỗi 0% | Đạt |
| Đối chiếu DB | số đơn = số checkout thành công | 13/13 checkout thành công, `orders` = 13 → KHỚP | Đạt |
| Giám sát tài nguyên | `monitor-node.ps1` chạy trên Windows | 68 mẫu, PID 3820; CPU tối đa 0,4% (/12 lõi), RAM 55,4 → 57,3 MB | Đạt (lần đầu script chạy thật) |
| Bọc ngoặc kép đường dẫn có dấu cách (v1.2) | JMeter chạy được | exit code 0 | Đạt |

## Số đo dùng để chốt số VU cho Load
- Thời gian đáp ứng rất nhỏ: trung bình 2,7 ms, p95 5 ms, max 40 ms (lần checkout đầu tiên).
- Mỗi VU chạy ~6,5 vòng/phút → **T_vòng ≈ 9,2 s** (≈ 8 s think time + đáp ứng), tức **≈ 0,65 req/s mỗi VU** (6 request/vòng).
- Ước lượng: 50 VU ≈ 33 req/s; 100 VU ≈ 65 req/s (cộng 0,2 req/s nhánh đăng nhập sai).

## Quan sát cần ghi nhớ cho Task 2
- `RPS` theo từng label tính trên khoảng thời gian riêng của label đó (cùng cách JMeter làm): `AUTH login` hiện 2,2 req/s chỉ vì 2 mẫu nằm gần nhau ở đầu lượt. Không được đọc con số này là "tải đăng nhập 2,2 req/s". Đây là kiểu đọc sai dễ gặp khi phân tích.
- 11 lần đăng nhập sai đều 401, chưa có 403: tài khoản `lock01` mới bị sai lần thứ 2 ở mẫu thứ 11 (đúng mã nguồn: lần sai thứ 2 đặt khóa nhưng vẫn trả 401; lần thứ 3 mới thấy 403). Smoke 60 s quá ngắn để thấy khóa.
