@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d %~dp0
echo 正在启动维也纳法拍房看板...
echo 请在浏览器访问: http://localhost:3000
npm run dev
pause
