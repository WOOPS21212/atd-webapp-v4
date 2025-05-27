@echo off
echo Stopping all Backend and Frontend servers...

:: Kill by window title
taskkill /FI "WINDOWTITLE eq Backend" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend" /T /F >nul 2>&1

:: Also kill any node processes on the specific ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Killing process on port 5000: PID %%a
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process on port 3000: PID %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo All servers stopped.
timeout /t 2 /nobreak >nul