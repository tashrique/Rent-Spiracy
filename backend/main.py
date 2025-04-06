from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.db import Database
from app.routers import analysis, file_upload, documents
import uvicorn
import os
import logging
from dotenv import load_dotenv

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
    description="Backend API for the Rent-Spiracy application, analyzing rental listings for potential scams",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",  # Frontend origin
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://rent-spiracy.vercel.app",
    "https://rentspiracy.tech"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel app deployments
    allow_credentials=False,  # Set to False since we're using 'omit' in frontend
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Include routers
app.include_router(analysis.router, prefix="/api")
app.include_router(file_upload.router, prefix="/api")
app.include_router(documents.router, prefix="/api")


@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting Rent-Spiracy API")
    try:
        db_instance = await Database.get_instance()
        await db_instance.connect_db()
        logger.info("Connected to database")
    except Exception as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        # Continue anyway, as we can still function with mock data


@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down Rent-Spiracy API")
    try:
        db_instance = await Database.get_instance()
        await db_instance.close_db()
        logger.info("Disconnected from database")
    except Exception as e:
        logger.error(f"Error during database disconnect: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Rent-Spiracy API",
        "docs": "/docs",
        "status": "online"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# This allows the file to be run directly or through uvicorn
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
