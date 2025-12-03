@echo off
echo Starting Sentinel Ledger System...

:: Add Node.js and Python Scripts to PATH
set "PATH=%PATH%;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%LOCALAPPDATA%\Programs\Python\Python312"

:: Start AI Backend
echo Starting AI Backend...
start "Sentinel AI Backend" cmd /k "cd backend && uvicorn main:app --reload"

:: Start Oracle Middleware
echo Starting Oracle Middleware...
start "Sentinel Oracle" cmd /k "cd oracle && node index.js"

:: Start Frontend Dashboard
echo Starting Frontend Dashboard...
start "Sentinel Dashboard" cmd /k "cd frontend && npm run dev"

echo.
echo All services are launching in separate windows.
echo Backend API: http://127.0.0.1:8000
echo Dashboard:   http://localhost:3000
echo.
pause

