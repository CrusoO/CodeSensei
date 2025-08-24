@echo off
REM Interactive Coding Engine - Development Startup Script (Windows)
REM This script starts both the frontend and backend development servers

echo 🚀 Starting Interactive Coding Engine Development Environment
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    echo    Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    echo    Please install Python 3.8+ from https://python.org/
    pause
    exit /b 1
)

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

REM Install backend dependencies if needed
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing backend dependencies...
    call pip install -r requirements.txt
)

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Start backend server
echo 🔧 Starting FastAPI backend server...
start "Backend Server" cmd /c "cd api && python -m uvicorn interactive-coding:router --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo ⚛️ Starting React frontend server...
start "Frontend Server" cmd /c "npm start"

echo.
echo 🎉 Development servers started successfully!
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend API: http://localhost:8000/docs
echo.
echo Press any key to continue...
pause >nul
