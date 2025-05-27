@echo off
echo Starting Backend and Frontend...

:: Start backend from project root to ensure .env loads
start "Backend" cmd /k "cd /d K:\Development-2025\atd-webapp-v4 && node backend/server.js"

:: Start frontend
start "Frontend" cmd /k "cd /d K:\Development-2025\atd-webapp-v4\frontend && npm start"
