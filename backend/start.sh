#!/bin/bash

# SIMGUI Backend Start Script
# This script starts the FastAPI backend server

set -e  # Exit on any error

echo "🚀 Starting SIMGUI Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup.sh first."
    exit 1
fi

# Check if main.py exists
if [ ! -f "main.py" ]; then
    echo "❌ main.py not found. Please ensure you're in the backend directory."
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import fastapi, uvicorn" 2>/dev/null; then
    echo "❌ Dependencies not installed. Please run ./setup.sh first."
    exit 1
fi

echo "✅ Dependencies verified"

# Start the server
echo "🌐 Starting FastAPI server..."
echo "   API will be available at: http://localhost:8000"
echo "   Interactive docs at: http://localhost:8000/docs"
echo "   Press Ctrl+C to stop the server"
echo ""

python main.py
