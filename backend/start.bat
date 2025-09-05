@echo off
REM SIMGUI Backend Start Script for Windows
REM This script starts the FastAPI backend server

echo 🚀 Starting SIMGUI Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo ❌ Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM Check if main.py exists
if not exist "main.py" (
    echo ❌ main.py not found. Please ensure you're in the backend directory.
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import fastapi, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo ❌ Dependencies not installed. Please run setup.bat first.
    pause
    exit /b 1
)

echo ✅ Dependencies verified

REM Start the server
echo 🌐 Starting FastAPI server...
echo    API will be available at: http://localhost:8000
echo    Interactive docs at: http://localhost:8000/docs
echo    Press Ctrl+C to stop the server
echo.

python main.py
