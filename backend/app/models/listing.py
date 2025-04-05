from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class RentalListing(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    listing_url: HttpUrl
    landlord_email: str
    landlord_phone: str
    property_address: str
    lease_document_url: Optional[str] = None
    
    # Analysis Results
    gemini_analysis: Optional[dict] = None
    zillow_price_data: Optional[dict] = None
    risk_score: Optional[float] = None
    red_flags: Optional[List[str]] = []
    voice_feedback_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str} 