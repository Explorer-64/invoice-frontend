@echo off
set "BD=%~dp0..\backend Invoice"
set "FD=%~dp0"
set "FD=%FD:~0,-1%"
echo Starting Invoice App...
echo.
start "Backend" cmd /k "cd /d ""%BD%"" && ""%BD%\.venv\Scripts\python.exe"" -m uvicorn main:app --host 127.0.0.1 --port 8000"
timeout /t 4 /nobreak >nul
start "Frontend" cmd /k "cd /d ""%FD%"" && yarn dev"
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
echo Two windows opened. Close them to stop.
pause
