# Bảng cấu hình máy chạy kiểm thử hiệu năng

Sinh viên: 23120399 · Bài: HW05 Performance Testing · Hostname: **MSI** (khớp `hostname` trong `perf/results/*/run-meta.json`)

Nguồn: `DxDiag.txt` (Save All Information), ảnh `hostname.png` (Command Prompt), ảnh `task-manager.png` và ảnh CPU từ Task Manager.

| Mục | Giá trị | Nguồn |
|---|---|---|
| Tên máy (hostname) | MSI | DxDiag, hostname.png |
| Tài khoản Windows | msi\tung1 | hostname.png (whoami) |
| Máy | MSI Alpha 15 B5EEK (Micro-Star International) | DxDiag |
| BIOS | E158LAMS.107 (UEFI) | DxDiag |
| Hệ điều hành | Windows 11 Home Single Language 64-bit, build 26300 (10.0.26300.9974) | DxDiag, hostname.png |
| CPU | AMD Ryzen 5 5600H with Radeon Graphics, base 3.30 GHz | DxDiag, ảnh CPU |
| Số nhân / luồng | 6 nhân / 12 luồng logic; ảo hoá: bật | ảnh CPU |
| Cache | L1 384 KB, L2 3.0 MB, L3 16.0 MB | ảnh CPU |
| RAM | 16 GB DDR4, 3200 MT/s, 2 thanh SODIMM (2 of 2) | DxDiag, ảnh Task Manager |
| RAM khả dụng cho HĐH | 15754 MB (DxDiag); 15.4 GB (run-meta) | DxDiag, run-meta.json |
| GPU 0 (tích hợp) | AMD Radeon Graphics, bộ nhớ chia sẻ 7877 MB | DxDiag |
| GPU 1 (rời) | AMD Radeon RX 6600M, VRAM 8146 MB, WDDM 3.2 | DxDiag, ảnh Task Manager |
| DirectX | 12 | DxDiag |
| Node.js | v24.11.1 | perf/results/*/run-meta.json |
| JMeter | 5.6.3 (non-GUI) | PLAN.md, README.md |

Ghi chú: ổ đĩa theo Task Manager gồm Disk 0 (D:) và Disk 1 (C:), đều là SSD NVMe.
