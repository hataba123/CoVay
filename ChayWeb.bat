@echo off
setlocal

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
    echo Khong tim thay npm. Hay cai dat Node.js truoc khi chay ung dung.
    pause
    exit /b 1
)

if not defined KATAGO_EXECUTABLE (
    if not exist "tools\katago\katago-paths.cmd" (
        echo Dang tai KataGo va model lan dau tien. Viec nay co the mat vai phut...
        call npm run setup:katago
        if errorlevel 1 (
            echo Khong the cai dat KataGo.
            pause
            exit /b 1
        )
    )
    call "tools\katago\katago-paths.cmd"
)

netstat -ano | findstr /r /c:":3001 .*LISTENING" >nul
if errorlevel 1 start "Co Vay - KataGo" /min npm.cmd run katago

call npm run dev -- --host 0.0.0.0 --port 5174 --open

endlocal
