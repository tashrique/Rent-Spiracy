from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response
from typing import Optional
from app.models.rental import RentalAnalysisRequest, AnalysisResult, Language
from app.services.analysis_service import AnalysisService
from app.utils.pdf_parser import extract_text_from_pdf
import io
import os

router = APIRouter(prefix="/upload", tags=["upload"])


@router.options("/document")
async def options_document():
    """Handle preflight OPTIONS request for CORS."""
    return Response(status_code=200)


@router.post("/document", response_model=AnalysisResult)
async def upload_document(
    file: UploadFile = File(...),
    listing_url: Optional[str] = Form(None),
    property_address: Optional[str] = Form(None),
    language: Language = Form(Language.ENGLISH),
    voice_output: bool = Form(False)
) -> AnalysisResult:
    """
    Upload a lease document for analysis.

    - file: Lease document file
    - listing_url: Optional URL of the rental listing
    - property_address: Optional physical address
    - language: Preferred language for results
    - voice_output: Whether voice output is requested
    """
    try:
        # Read the file content
        content = await file.read()

        # Check file size (limiting to 10MB)
        if len(content) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(
                status_code=400,
                detail="File size exceeds the 10MB limit"
            )

        # Extract text based on file type
        document_content = ""
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension == '.pdf':
            # Parse PDF document
            document_content = extract_text_from_pdf(content)
        else:
            # For other file types, treat as text
            try:
                document_content = content.decode("utf-8", errors="ignore")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Unsupported file format. Please upload a PDF or text document."
                )

        # Check if we successfully extracted text
        if not document_content or document_content.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the document. The file might be corrupted or password-protected."
            )

        # Create analysis request
        request = RentalAnalysisRequest(
            listing_url=listing_url,
            property_address=property_address,
            document_content=document_content,
            language=language,
            voice_output=voice_output
        )

        # Process analysis
        try:
            result = await AnalysisService.analyze_rental(request)
            return result
        except Exception as e:
            # Handle any errors in processing
            raise HTTPException(
                status_code=500,
                detail=f"Error analyzing document: {str(e)}"
            )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Could not decode the document. Please ensure it's a valid text file."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred processing the file: {str(e)}"
        )
