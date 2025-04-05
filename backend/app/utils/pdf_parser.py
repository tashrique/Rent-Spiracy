"""
PDF parser utility for extracting text from PDF documents.
"""

import PyPDF2
from io import BytesIO
from typing import BinaryIO, Union


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
        """
        try:
            # If input is bytes, convert to BytesIO for PyPDF2
            if isinstance(file_content, bytes):
                file_content = BytesIO(file_content)
                
            # Open the PDF with PyPDF2
            pdf_reader = PyPDF2.PdfReader(file_content)
            
            # Extract text from all pages
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n\n"

            
                            
            return text
        except Exception as e:
            # Log the error but don't crash
            print(f"Error parsing PDF: {str(e)}")
            return f"Error parsing PDF: {str(e)}"


def extract_text_from_pdf(file_content: Union[bytes, BinaryIO]) -> str:
    """Convenience function to extract text from PDF."""
    return PDFParser.extract_text_from_pdf(file_content) 