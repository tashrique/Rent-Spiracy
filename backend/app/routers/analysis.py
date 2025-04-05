from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Dict, Any
from app.models.rental import RentalAnalysisRequest, AnalysisResult
from app.services.analysis_service import AnalysisService
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/analyze-rental", response_model=AnalysisResult)
async def analyze_rental(
    request: RentalAnalysisRequest = Body(...)
) -> AnalysisResult:
    """
    Analyze a rental based on provided information.

    You can provide any combination of:
    - listing_url: URL to the rental listing
    - property_address: Physical address of the property
    - document_content: Lease document content as text

    Additional options:
    - language: Preferred language for results
    - voice_output: Whether voice output is requested
    """
    try:
        # Validate that at least one of the required fields is provided
        if not (request.listing_url or request.property_address or request.document_content):
            raise HTTPException(
                status_code=400,
                detail="At least one of listing_url, property_address, or document_content must be provided"
            )

        # Process the analysis
        result = await AnalysisService.analyze_rental(request)
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(analysis_id: str) -> AnalysisResult:
    """Retrieve a previously performed analysis by ID."""
    result = await AnalysisService.get_analysis_by_id(analysis_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
