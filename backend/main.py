from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("rent-spiracy-api")

# Load environment variables
load_dotenv()

# Get configuration from environment
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

logger.info(f"Starting server with CORS origins: {CORS_ORIGINS}")

app = FastAPI(
    title="Rent-Spiracy API",
    description="API for the Rent-Spiracy application",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers if they exist
try:
    from app.routers import scam_detection
    app.include_router(scam_detection.router)
    logger.info("Loaded scam_detection router successfully")
except ImportError as e:
    logger.error(f"Failed to import routers: {str(e)}")
    # If router modules don't exist yet, create basic endpoints
    pass


@app.get("/")
async def root():
    return {"message": "Welcome to the Rent-Spiracy API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting uvicorn server on port {PORT}")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
