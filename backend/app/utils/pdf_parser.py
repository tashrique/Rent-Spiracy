"""
PDF parser utility for extracting text from PDF documents.
"""

import PyPDF2
from io import BytesIO
from typing import BinaryIO, Union
import logging

logger = logging.getLogger("rent-spiracy")

class PDFParser:
    """Utility class for parsing PDF documents."""
    
    @staticmethod
    def extract_text_from_pdf(file_content: Union[bytes, BinaryIO]) -> str:
        """
        Extract text from a PDF file.
        
        Args:
            file_content: The PDF content as bytes or file-like object
            
        Returns:
            Extracted text from the PDF
            
        Raises:
            ValueError: If the PDF is encrypted or cannot be parsed
        """
        # If input is bytes, convert to BytesIO for PyPDF2
        if isinstance(file_content, bytes):
            file_content = BytesIO(file_content)
            
        try:
            # Open the PDF with PyPDF2
            pdf_reader = PyPDF2.PdfReader(file_content)
            
            # Check if the PDF is encrypted
            if pdf_reader.is_encrypted:
                logger.error("PDF is encrypted/password-protected")
                raise ValueError("The PDF is password-protected. Please upload an unprotected document.")
                
            # Extract text from all pages
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                try:
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
                except Exception as page_error:
                    logger.warning(f"Could not extract text from page {page_num}: {str(page_error)}")
                    # Continue with other pages
            
            # Check if we got any meaningful text
            if not text or len(text.strip()) < 50:
                logger.warning("Extracted text is too short or empty")
                raise ValueError("Could not extract meaningful text from the PDF. The document might be scanned images without text, corrupted, or have content restrictions.")
                            
            return text
            
        except PyPDF2.errors.PdfReadError as e:
            logger.error(f"PDF read error: {str(e)}")
            if "encrypted" in str(e).lower():
                raise ValueError("The PDF is password-protected or encrypted. Please upload an unprotected document.")
            else:
                raise ValueError(f"Could not read the PDF: {str(e)}. The file might be corrupted or in an unsupported format.")
        except Exception as e:
            # Log the error but don't return the technical details to the user
            logger.error(f"Error parsing PDF: {str(e)}")
            raise ValueError("Could not process the PDF. The file might be corrupted, password-protected, or in an unsupported format.")


def extract_text_from_pdf(file_content: Union[bytes, BinaryIO]) -> str:
    """
    Convenience function to extract text from PDF.
    
    Raises:
        ValueError: If the PDF cannot be parsed
    """
    try:
        return PDFParser.extract_text_from_pdf(file_content)
    except ValueError as e:
        # Re-raise the ValueError to maintain the message
        raise e
    except Exception as e:
        # Catch any other exceptions and provide a friendly message
        raise ValueError(f"Error processing PDF: {str(e)}") 