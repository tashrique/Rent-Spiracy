from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.utils.db import Database
from app.routers import analysis, file_upload, documents, health, lawyers
import uvicorn
import os
import logging
from dotenv import load_dotenv
from typing import List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("rent-spiracy")

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Rent-Spiracy API",
    description="Rental scam detection and lease analysis",
    version="1.0.0"
)

# Get allowed origins from environment variable
def get_allowed_origins() -> List[str]:
    origins_env = os.getenv("CORS_ORIGINS", "")
    
    # If not set or empty, default to allow all in development but be strict in production
    if not origins_env:
        if os.getenv("ENVIRONMENT", "development") == "production":
            # Production default to vercel deployment and localhost for testing
            return [
                "https://rent-spiracy.vercel.app",
                "https://rent-spiracy.onrender.com",
                "https://rentspiracy.tech",
                "https://www.rentspiracy.tech"
            ]
        else:
            # Development - allow all localhost variants for testing
            return [
                "http://localhost:3000",
                "http://127.0.0.1:3000", 
                "http://localhost:8000",
                "http://127.0.0.1:8000",
                "http://localhost",
                "http://127.0.0.1",
                "*"
            ]
    
    # Parse comma-separated origins
    return [origin.strip() for origin in origins_env.split(",") if origin.strip()]

# CORS configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Add a custom middleware to log requests and add security headers 
@app.middleware("http")
async def log_and_add_security_headers(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    
    # Process the request
    response = await call_next(request)
    
    # Add security headers for production
    if os.getenv("ENVIRONMENT", "development") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
    
    return response

# Register routers - use the routers from the imports
app.include_router(file_upload.router)
app.include_router(analysis.router)
app.include_router(health.router)
app.include_router(documents.router)
app.include_router(lawyers.router)


@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting Rent-Spiracy API")
    try:
        await Database.connect_db()
        logger.info("Connected to database")
        
        
            
    except Exception as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        # Continue anyway, as we can still function with mock data


@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down Rent-Spiracy API")
    try:
        await Database.close_db()
        logger.info("Disconnected from database")
    except Exception as e:
        logger.error(f"Error during database disconnect: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Rent-Spiracy API",
        "endpoints": [
            "/upload/document",
            "/analysis/analyze-rental",
            "/health",
            "/documents",
            "/lawyers"
        ]
    }

# This allows the file to be run directly or through uvicorn
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
