# Import routers here for easier importing in the main app
from app.routers.analysis import router as analysis_router
from app.routers.file_upload import router as file_upload_router
from app.routers.documents import router as documents_router

__all__ = ["analysis_router", "file_upload_router", "documents_router"]
