from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response
from typing import Optional
from app.models.rental import RentalAnalysisRequest, AnalysisResult, Language
from app.services.analysis_service import AnalysisService
from app.utils.pdf_parser import extract_text_from_pdf
import io
import os
import pytesseract
from PIL import Image
import pillow_heif
import platform
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Register HEIF/HEIC file format with Pillow
pillow_heif.register_heif_opener()

# Set the Tesseract executable path based on operating system
if platform.system() == 'Darwin':  # macOS
    pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'
elif platform.system() == 'Windows':
    # Default Windows path, adjust if necessary
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
# Linux will use the default path which is usually correct if installed via package manager

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

    - file: Lease document file (PDF, text, or image)
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
        content_type = file.content_type or ""
        
        logger.info(f"Processing file: {file.filename}, type: {content_type}, extension: {file_extension}")
        
        if file_extension == '.pdf':
            # Parse PDF document
            try:
                document_content = extract_text_from_pdf(content)
            except ValueError as pdf_error:
                # Use the specific error message from the PDF parser
                raise HTTPException(
                    status_code=400,
                    detail=str(pdf_error)
                )
            except Exception as e:
                logger.error(f"Unexpected error parsing PDF: {str(e)}")
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from the PDF. The file might be corrupted, password-protected, or in an unsupported format."
                )
        elif content_type.startswith('image/') or file_extension in ['.heic', '.heif']:
            # Process image using OCR
            try:
                # Check if it's a HEIC/HEIF file that needs special handling
                is_heic = file_extension in ['.heic', '.heif'] or content_type in ['image/heic', 'image/heif']
                
                # Open the image using PIL with HEIC support
                image = Image.open(io.BytesIO(content))
                
                # Convert HEIC to JPEG format for better compatibility
                if is_heic:
                    logger.info(f"Converting HEIC/HEIF image to JPEG: {file.filename}")
                    try:
                        # Convert to RGB mode if not already
                        if image.mode != 'RGB':
                            image = image.convert('RGB')
                        
                        # Create a BytesIO object to hold the converted JPEG
                        jpeg_buffer = io.BytesIO()
                        
                        # Save as PNG instead of JPEG for better reliability
                        image.save(jpeg_buffer, format='PNG')
                        
                        # Reset buffer position
                        jpeg_buffer.seek(0)
                        
                        # Reopen as PNG for OCR processing
                        image = Image.open(jpeg_buffer)
                        logger.info(f"Successfully converted HEIC image to PNG format")
                    except Exception as convert_error:
                        logger.error(f"Error during HEIC conversion: {str(convert_error)}")
                        raise HTTPException(
                            status_code=400,
                            detail=f"Error converting HEIC image: {str(convert_error)}"
                        )
                
                # Perform OCR to extract text
                logger.info(f"Performing OCR on image: {file.filename}")
                document_content = pytesseract.image_to_string(image)
                logger.info(f"OCR completed, extracted {len(document_content)} characters")
                
                # Check if we got meaningful text
                if not document_content or len(document_content.strip()) < 50:
                    # If we got very little text, the OCR might have failed
                    raise HTTPException(
                        status_code=400,
                        detail="Could not extract enough text from the image. Please upload a clearer image or try a different document format."
                    )
            except Exception as e:
                logger.error(f"Error processing image {file.filename}: {str(e)}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Error processing image: {str(e)}"
                )
        else:
            # For other file types, treat as text
            try:
                document_content = content.decode("utf-8", errors="ignore")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Unsupported file format. Please upload a PDF, image, or text document."
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
            
            # Create a response with explicit CORS headers
            return Response(
                content=result.json(),
                media_type="application/json",
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept"
                }
            )
            
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error analyzing document: {str(e)}"
            )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Could not decode the document. Please ensure it's a valid text file."
        )
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        logger.error(f"An error occurred processing the file: {str(e)}")
        # Provide a more user-friendly error message
        error_message = str(e)
        if "password" in error_message.lower() or "encrypt" in error_message.lower():
            detail = "The document appears to be password-protected. Please upload an unprotected document."
        elif "corrupt" in error_message.lower():
            detail = "The document appears to be corrupted. Please try a different file."
        else:
            detail = f"An error occurred processing the file: {str(e)}"
            
        raise HTTPException(
            status_code=500,
            detail=detail
        )


@router.options("/documents")
async def options_documents():
    """Handle preflight OPTIONS request for multiple document upload CORS."""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept"
        }
    )


@router.post("/documents", response_model=AnalysisResult)
async def upload_multiple_documents(
    files: list[UploadFile] = File(...),
    listing_url: Optional[str] = Form(None),
    property_address: Optional[str] = Form(None),
    language: Language = Form(Language.ENGLISH),
    voice_output: bool = Form(False)
) -> AnalysisResult:
    """
    Upload multiple lease documents (like multiple photos of a lease) for combined analysis.

    - files: Multiple files (PDF, text, or images including HEIC/HEIF)
    - listing_url: Optional URL of the rental listing
    - property_address: Optional physical address
    - language: Preferred language for results
    - voice_output: Whether voice output is requested
    """
    if not files or len(files) == 0:
        raise HTTPException(
            status_code=400,
            detail="No files provided for analysis"
        )
    
    try:
        # Process each file and combine the extracted text
        combined_text = []
        
        for file in files:
            # Read the file content
            content = await file.read()

            # Check individual file size (limiting to 10MB)
            if len(content) > 10 * 1024 * 1024:  # 10MB
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} exceeds the 10MB limit"
                )

            # Extract text based on file type
            document_content = ""
            file_extension = os.path.splitext(file.filename)[1].lower()
            content_type = file.content_type or ""
            
            logger.info(f"Processing file: {file.filename}, type: {content_type}, extension: {file_extension}")
            
            if file_extension == '.pdf':
                # Parse PDF document
                try:
                    document_content = extract_text_from_pdf(content)
                except ValueError as pdf_error:
                    # Use the specific error message from the PDF parser
                    raise HTTPException(
                        status_code=400,
                        detail=f"Error in file {file.filename}: {str(pdf_error)}"
                    )
                except Exception as e:
                    logger.error(f"Unexpected error parsing PDF {file.filename}: {str(e)}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"Could not extract text from the PDF {file.filename}. The file might be corrupted, password-protected, or in an unsupported format."
                    )
            elif content_type.startswith('image/') or file_extension in ['.heic', '.heif']:
                # Process image using OCR
                try:
                    # Check if it's a HEIC/HEIF file that needs special handling
                    is_heic = file_extension in ['.heic', '.heif'] or content_type in ['image/heic', 'image/heif']
                    
                    # Open the image using PIL with HEIC support
                    image = Image.open(io.BytesIO(content))
                    
                    # Convert HEIC to JPEG format for better compatibility
                    if is_heic:
                        logger.info(f"Converting HEIC/HEIF image to JPEG: {file.filename}")
                        try:
                            # Convert to RGB mode if not already
                            if image.mode != 'RGB':
                                image = image.convert('RGB')
                            
                            # Create a BytesIO object to hold the converted JPEG
                            jpeg_buffer = io.BytesIO()
                            
                            # Save as PNG instead of JPEG for better reliability
                            image.save(jpeg_buffer, format='PNG')
                            
                            # Reset buffer position
                            jpeg_buffer.seek(0)
                            
                            # Reopen as PNG for OCR processing
                            image = Image.open(jpeg_buffer)
                            logger.info(f"Successfully converted HEIC image to PNG format")
                        except Exception as convert_error:
                            logger.error(f"Error during HEIC conversion: {str(convert_error)}")
                            raise HTTPException(
                                status_code=400,
                                detail=f"Error converting HEIC image: {str(convert_error)}"
                            )
                    
                    # Perform OCR to extract text
                    logger.info(f"Performing OCR on image: {file.filename}")
                    document_content = pytesseract.image_to_string(image)
                    logger.info(f"OCR completed, extracted {len(document_content)} characters")
                    
                    # No need to check for minimum text length per image - we'll combine all
                except Exception as e:
                    logger.error(f"Error processing image {file.filename}: {str(e)}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"Error processing image {file.filename}: {str(e)}"
                    )
            else:
                # For other file types, treat as text
                try:
                    document_content = content.decode("utf-8", errors="ignore")
                except UnicodeDecodeError:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Unsupported file format for {file.filename}. Please upload PDF, image, or text documents."
                    )

            # Add the extracted text to our collection
            if document_content and document_content.strip():
                combined_text.append(document_content.strip())

        # Ensure we got text from at least one file
        if not combined_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from any of the uploaded files. The files might be corrupted, unclear, or in an unsupported format."
            )

        # Join all the text with separators
        final_document_content = "\n\n--- Next Document ---\n\n".join(combined_text)

        # Create analysis request
        request = RentalAnalysisRequest(
            listing_url=listing_url,
            property_address=property_address,
            document_content=final_document_content,
            language=language,
            voice_output=voice_output
        )

        # Process analysis
        try:
            result = await AnalysisService.analyze_rental(request)
            
            # Create a response with explicit CORS headers
            return Response(
                content=result.json(),
                media_type="application/json",
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept"
                }
            )
            
        except Exception as e:
            logger.error(f"Error analyzing documents: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error analyzing documents: {str(e)}"
            )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Could not decode one or more documents. Please ensure they are valid files."
        )
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        logger.error(f"An error occurred processing the files: {str(e)}")
        # Provide a more user-friendly error message
        error_message = str(e)
        if "password" in error_message.lower() or "encrypt" in error_message.lower():
            detail = "One or more documents appear to be password-protected. Please upload unprotected documents."
        elif "corrupt" in error_message.lower():
            detail = "One or more documents appear to be corrupted. Please try different files."
        else:
            detail = f"An error occurred processing the files: {str(e)}"
            
        raise HTTPException(
            status_code=500,
            detail=detail
        )
