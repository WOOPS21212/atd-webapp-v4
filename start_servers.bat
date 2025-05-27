@echo off
echo Starting Backend and Frontend...

:: Get the directory where this batch file is located
SET SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

:: Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo Backend dependencies not found. Installing...
    cd backend
    call npm install
    cd ..
)

:: Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo Frontend dependencies not found. Installing...
    cd frontend
    call npm install
    cd ..
)

:: Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found in root directory!
    echo Please create a .env file with your OPENAI_API_KEY
    pause
)

:: Start backend from project root to ensure .env loads
echo Starting Backend server...
start "Backend" cmd /k "cd /d "%SCRIPT_DIR%" && node backend/server.js"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend
echo Starting Frontend server...
start "Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm start"

echo.
echo Servers starting...
echo Backend should be running on http://localhost:5000
echo Frontend should be running on http://localhost:3000
echo.
echo Press any key to exit this window (servers will continue running)...
pause >nul