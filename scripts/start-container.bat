@echo off
REM Interactive Coding Engine - Container Startup Script (Windows)
REM Easy way to test the engine with zero setup

echo Interactive Coding Engine - Container Setup
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is required but not installed.
    echo    Please install Docker Desktop from https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose is required but not installed.
    echo    Please install Docker Compose or use newer Docker Desktop
    pause
    exit /b 1
)

echo Docker is available!
echo.

REM Show available options
echo Available Services:
echo    1. api     - Just the API backend (recommended for testing)
echo    2. demo    - Full demo with frontend (for exploration)
echo    3. docs    - Documentation server
echo    4. all     - Everything (API + Demo + Docs)
echo.

set /p choice="What would you like to start? (1-4, or 'api' for quick test): "

if "%choice%"=="1" goto api
if "%choice%"=="api" goto api
if "%choice%"=="2" goto demo
if "%choice%"=="demo" goto demo
if "%choice%"=="3" goto docs
if "%choice%"=="docs" goto docs
if "%choice%"=="4" goto all
if "%choice%"=="all" goto all
goto api

:api
echo Starting API backend only...
docker-compose up api
goto end

:demo
echo Starting full demo with frontend...
docker-compose --profile demo up
goto end

:docs
echo Starting documentation server...
docker-compose --profile docs up docs
goto end

:all
echo Starting everything...
docker-compose --profile demo --profile docs up
goto end

:end
echo.
echo Services started!
echo.
echo Available URLs:
echo    • API Backend: http://localhost:8000
echo    • API Documentation: http://localhost:8000/docs
echo    • Health Check: http://localhost:8000/api/coding/health
if "%choice%"=="2" echo    • Demo Frontend: http://localhost:3000
if "%choice%"=="demo" echo    • Demo Frontend: http://localhost:3000
if "%choice%"=="4" echo    • Demo Frontend: http://localhost:3000
if "%choice%"=="all" echo    • Demo Frontend: http://localhost:3000
if "%choice%"=="3" echo    • Documentation: http://localhost:8080
if "%choice%"=="docs" echo    • Documentation: http://localhost:8080
if "%choice%"=="4" echo    • Documentation: http://localhost:8080
if "%choice%"=="all" echo    • Documentation: http://localhost:8080
echo.
echo Quick Test:
echo curl -X POST http://localhost:8000/api/coding/analyze ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"code\": \"const [count, setCount] = useState(0);\", \"language\": \"javascript\"}"
echo.
echo Press Ctrl+C to stop all services
pause