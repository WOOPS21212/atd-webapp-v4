@echo off
echo Restarting servers...
echo.
echo This will first attempt to stop any running Node.js servers
echo by calling stop_servers.bat (which affects ALL node.exe processes),
echo then it will start them again using start_servers.bat.
echo.

REM Call stop_servers.bat
call stop_servers.bat
echo.

REM Check if user cancelled the stop operation in stop_servers.bat
REM This is a bit tricky as stop_servers.bat uses goto :eof.
REM A simple way is to assume if node processes are still running, stop might have been cancelled or failed.
REM For simplicity, we'll just proceed, but a more robust check could be added if needed.

echo Waiting for a few seconds before starting servers...
TIMEOUT /T 5 /NOBREAK > NUL
echo.

REM Call start_servers.bat
call start_servers.bat

echo Restart sequence initiated.
