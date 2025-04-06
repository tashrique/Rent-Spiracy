from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health_check():
    """
    Simple health check endpoint
    """
    return {
        "status": "healthy",
        "message": "API is operational"
    } 