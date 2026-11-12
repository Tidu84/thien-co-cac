@echo off
chcp 65001 >nul
title Thiên Cơ Các - Local Dev Server (Port 5173)
echo =====================================================================
echo    KHỞI ĐỘNG MÁY CHỦ CỤC BỘ: THIÊN CƠ CÁC
echo =====================================================================
echo.
echo [1/2] Đang tự động mở trình duyệt web http://localhost:5173/ ...
start "" "http://localhost:5173/"

echo [2/2] Đang khởi chạy Vite Dev Server trên cổng 5173...
echo (Nhấn tổ hợp phím Ctrl + C nếu muốn tắt máy chủ)
echo ---------------------------------------------------------------------
cd /d "%~dp0frontend"
call npm.cmd run dev -- --host 0.0.0.0 --port 5173
pause
