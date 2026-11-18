@echo off
rem Khoi dong RIENG backend EShop (:3000) cho kiem thu hieu nang. Moi lan khoi dong, backend tu xoa va tao lai DB (database.js).
rem Dong cua so de tat backend. Sau khi khoi dong, chay prepare-data --accounts-only de tao lai tai khoan test.
set SUT=D:\vscode\Software testing\eshop-sut
start "EShop backend :3000 (HW05)" cmd /k "cd /d "%SUT%\backend" && node server.js"
