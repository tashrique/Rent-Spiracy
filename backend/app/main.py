from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import scam_detection
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get configuration from environment
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

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

# Include routers
app.include_router(scam_detection.router)


@app.get("/")
async def root():
    return {"message": "Welcome to the Rent-Spiracy API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
