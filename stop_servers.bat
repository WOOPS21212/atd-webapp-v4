@echo off
echo Stopping all 'Backend' and 'Frontend' windows...

taskkill /FI "WINDOWTITLE eq Backend" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend" /T /F > nul 2>&1

echo All servers stopped.
