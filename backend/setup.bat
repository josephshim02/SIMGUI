@echo off
REM SIMGUI Backend Setup Script for Windows
REM This script sets up the FastAPI backend with virtual environment and dependencies

echo 🚀 Setting up SIMGUI Backend...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo ✅ Python detected

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

echo.
echo 🎉 Setup completed successfully!
echo.
echo To start the backend server, run:
echo   start.bat
echo.
echo Or manually:
echo   venv\Scripts\activate.bat
echo   python main.py
echo.
echo The API will be available at:
echo   - API: http://localhost:8000
echo   - Docs: http://localhost:8000/docs
pause
