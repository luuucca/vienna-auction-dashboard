@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d %~dp0

echo ============================================
echo  维也纳法拍房看板 — 启动中
echo ============================================
echo.
echo  [1] API 服务器  http://localhost:3099
echo  [2] 前端看板    http://localhost:3000
echo.
echo  关闭此窗口即停止所有服务。
echo ============================================
echo.

:: 在新窗口启动 API 服务器
start "法拍看板 API" cmd /k "set PATH=C:\Program Files\nodejs;%PATH% && cd /d %~dp0 && node server.mjs"

:: 等 1 秒让 API 先起来
timeout /t 1 /nobreak >nul

:: 在当前窗口启动 Vite（会自动打开浏览器）
npm run dev
