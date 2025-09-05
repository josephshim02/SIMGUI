from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import uvicorn

app = FastAPI(
    title="SIMGUI Backend API",
    description="A FastAPI backend for SIMGUI application",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class HealthResponse(BaseModel):
    status: str
    message: str


class APIResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str


# Routes
@app.get("/", response_model=APIResponse)
async def root():
    """Root endpoint"""
    return APIResponse(
        success=True,
        data={"service": "SIMGUI Backend API"},
        message="Welcome to SIMGUI Backend API",
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(status="healthy", message="Service is running")


@app.get("/api/v1/status")
async def get_status():
    """Get API status"""
    return {
        "status": "running",
        "version": "1.0.0",
        "endpoints": ["/", "/health", "/api/v1/status", "/docs"],
    }


if __name__ == "__main__":
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
