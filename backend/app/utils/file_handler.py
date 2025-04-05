import os
from fastapi import UploadFile
from typing import Optional
import tempfile


async def save_upload_file_temp(upload_file: UploadFile) -> Optional[str]:
    """
    Save an uploaded file to a temporary file and return the path.
    Returns None if no file was provided.
    """
    if not upload_file:
        return None

    try:
        suffix = os.path.splitext(upload_file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            content = await upload_file.read()
            temp.write(content)
            return temp.name
    except Exception as e:
        print(f"Error saving file: {e}")
        return None


async def parse_pdf_text(file_path: str) -> str:
    """
    Mock function to parse text from a PDF.
    In a real implementation, this would use a PDF parsing library.
    """
    # In a real implementation, we would use PyPDF2, PDFMiner, or similar
    return "This is mock text extracted from a PDF file."
