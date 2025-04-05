import os
from fastapi import UploadFile
import aiofiles
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

async def save_upload_file(file: UploadFile, user_id: str) -> str:
    """
    Save an uploaded file and return its path
    """
    try:
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{user_id}_{timestamp}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
            
        return file_path
        
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        raise

async def delete_file(file_path: str):
    """
    Delete a file
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        raise 