from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/scam-detection",
    tags=["Scam Detection"],
    responses={404: {"description": "Not found"}},
)


class ScamDetectionResponse(BaseModel):
    scam_likelihood: str
    explanation: str
    simplified_clauses: List[str] = []
    suggested_questions: List[str] = []


@router.post("/analyze", response_model=ScamDetectionResponse)
async def analyze_rental(
    file: Optional[UploadFile] = File(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    listing_url: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    language: str = Form("english")
):
    """
    Analyze rental listing or lease agreement for potential scams.
    At least one of file, email, phone, listing_url, or address must be provided.
    """
    if not any([file, email, phone, listing_url, address]):
        raise HTTPException(
            status_code=400,
            detail="At least one of file, email, phone, listing_url, or address must be provided"
        )

    # Mock response for now
    return ScamDetectionResponse(
        scam_likelihood="Low",
        explanation="This is a mock response. In a real implementation, we would analyze the provided information.",
        simplified_clauses=["Mock clause 1", "Mock clause 2"],
        suggested_questions=["Is the deposit refundable?",
                             "What's included in the rent?"]
    )
