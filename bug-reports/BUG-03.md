# BUG-03: [FR-02] Khóa tài khoản ngay sau lần đăng nhập sai thứ 2 và khóa 180 s thay vì 30 s

**Mức độ:** Cao (khóa nhầm người dùng hợp lệ; tăng rủi ro từ chối dịch vụ theo tài khoản)  
**Yêu cầu vi phạm:** README FR-02 "Sau mỗi lần đăng nhập sai, hệ thống tăng bộ đếm lên đúng 1 đơn vị. Nếu đăng nhập sai từ 3 lần trở lên liên tiếp, tài khoản bị tạm khóa 30 giây."  
**Môi trường:** như BUG-01.

### Mô tả
`server.js` dòng 54–57: `const newAttempts = user.login_attempts + 2;` và khóa khi `newAttempts >= 3` trong `180000` ms. Kết quả: lần sai thứ 1 → bộ đếm 2; lần sai thứ 2 → bộ đếm 4 ⇒ khóa ngay; thời gian khóa 180 s.

### Bước tái hiện
1. Khởi động lại backend (DB tạo lại). Tạo tài khoản `lock01@test.local`.
2. `POST /api/login` với mật khẩu sai → 401.
3. Lặp lại ngay → 401 (nhưng tài khoản đã bị khóa ở bước này).
4. Lặp lại lần 3 → **403** "Tài khoản đã bị khóa". **Mong đợi:** lần 3 mới bắt đầu khóa, và mở khóa sau 30 s.

### Bằng chứng (nhánh lockout-probe của JMeter, 1 VU, mỗi tài khoản bị thử sai mỗi 50 s)
Từ `perf/results/load2/23120399_Load_20261118.jtl` (label `AUTH login-wrong`, tách theo tài khoản theo thứ tự vòng của `lock-users.csv`):
| Giây | 0 | 50 | 100 | 150 | 200 | 250 | 300 |
|---|---|---|---|---|---|---|---|
| lock01 | 401 | 401 | **403** | **403** | **403** | 401 | 403 |
Tài khoản vẫn bị khóa ở giây 200, tức ≥ 150 s sau lần sai thứ 2 (spec: 30 s). Sau Soak, DB có `lock01..03` với `login_attempts = 12` sau 6 lần sai (mỗi lần +2).

### Đề xuất sửa
`newAttempts = user.login_attempts + 1`, khóa khi `>= 3`, thời gian khóa `30000` ms (môi trường demo).
