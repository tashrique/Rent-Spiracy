from pydantic import BaseModel, Field, HttpUrl, ConfigDict
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId
from pydantic_core import Url

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

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={
            ObjectId: str,
            Url: str
        }
    )

    def dict(self, *args, **kwargs):
        d = super().dict(*args, **kwargs)
        if isinstance(d.get('listing_url'), Url):
            d['listing_url'] = str(d['listing_url'])
        return d 