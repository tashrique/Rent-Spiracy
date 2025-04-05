from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import scam_detection

app = FastAPI(
    title="Rent-Spiracy API",
    description="API for the Rent-Spiracy application",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
