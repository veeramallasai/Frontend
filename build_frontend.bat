@echo off
cd /d "%~dp0"
echo Building Frontend Production Bundle...
call npm run build
