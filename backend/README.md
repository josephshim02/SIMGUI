# SIMGUI Backend API

A FastAPI-based backend service for the SIMGUI application.

## Features

- FastAPI framework with automatic API documentation
- CORS middleware for cross-origin requests
- Health check endpoints
- Pydantic models for request/response validation
- Virtual environment support
- Easy setup and start scripts for both macOS/Linux and Windows

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Quick Setup (Recommended)

**On macOS/Linux:**
```bash
cd backend
./setup.sh
```

**On Windows:**
```cmd
cd backend
setup.bat
```

### Manual Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   
   **On macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```
   
   **On Windows:**
   ```bash
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

**Quick Start:**
```bash
# On macOS/Linux
./start.sh

# On Windows
start.bat
```

**Manual Start:**
1. **Make sure your virtual environment is activated** (you should see `(venv)` in your terminal prompt)

2. **Start the development server:**
   ```bash
   python main.py
   ```
   
   Or alternatively:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Access the application:**
   - API: http://localhost:8000
   - Interactive API docs (Swagger UI): http://localhost:8000/docs
   - Alternative API docs (ReDoc): http://localhost:8000/redoc

### API Endpoints

- `GET /` - Root endpoint with welcome message
- `GET /health` - Health check endpoint
- `GET /api/v1/status` - API status and available endpoints
- `GET /docs` - Interactive API documentation

### Development

- The server runs with auto-reload enabled in development mode
- Any changes to the code will automatically restart the server
- Use the interactive docs at `/docs` to test API endpoints

### Virtual Environment Management

**To deactivate the virtual environment:**
```bash
deactivate
```

**To reactivate the virtual environment:**
```bash
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows
```

**To add new dependencies:**
1. Activate the virtual environment
2. Install the new package: `pip install package_name`
3. Update requirements.txt: `pip freeze > requirements.txt`

### Production Deployment

For production deployment, consider:
- Setting up proper CORS origins instead of allowing all origins
- Using environment variables for configuration
- Setting up proper logging
- Using a production ASGI server like Gunicorn with Uvicorn workers

### Scripts

The backend includes convenient setup and start scripts:

#### Setup Scripts
- **`setup.sh`** (macOS/Linux): Creates virtual environment and installs dependencies
- **`setup.bat`** (Windows): Same functionality for Windows users

#### Start Scripts
- **`start.sh`** (macOS/Linux): Starts the FastAPI server with proper environment setup
- **`start.bat`** (Windows): Same functionality for Windows users

#### Script Features
- Automatic Python version checking
- Virtual environment creation and activation
- Dependency verification
- Clear error messages and status updates
- Cross-platform compatibility

### Troubleshooting

- **Port already in use**: Change the port in `main.py` or kill the process using port 8000
- **Module not found**: Ensure the virtual environment is activated and dependencies are installed
- **Permission errors**: Make sure you have proper permissions to create the virtual environment directory
- **Script not executable** (macOS/Linux): Run `chmod +x setup.sh start.sh` to make scripts executable
