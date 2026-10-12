@echo off
echo ========================================================
echo  CampusIQ — AI-Powered Student Success Platform
echo  Predict Early. Intervene Smartly. Empower Every Student.
echo ========================================================
echo.
echo Starting CampusIQ Server on http://127.0.0.1:8000 ...
start http://127.0.0.1:8000
node server\index.js
pause
