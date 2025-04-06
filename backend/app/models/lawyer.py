from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
from .rental import Language

class Region(str, Enum):
    NORTHEAST = "Northeast"
    MIDWEST = "Midwest"
    SOUTH = "South"
    WEST = "West"
    PACIFIC = "Pacific"

class Lawyer(BaseModel):
    id: Optional[str] = Field(None, description="MongoDB ObjectId")
    name: str = Field(..., description="Full name of the lawyer")
    languages: List[Language] = Field(..., description="Languages spoken by the lawyer")
    specialization: str = Field(..., description="Area of specialization")
    location: str = Field(..., description="City and state")
    region: Region = Field(..., description="US region")
    phone: str = Field(..., description="Contact phone number")
    email: str = Field(..., description="Contact email address")
    website: Optional[str] = Field(None, description="Lawyer's website URL")
    pictureUrl: Optional[str] = Field(None, description="URL to lawyer's profile picture")
    freeDuration: Optional[str] = Field(None, description="Duration of free consultation if offered")
    rating: Optional[float] = Field(None, description="Rating out of 5")
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

class LawyerCreate(BaseModel):
    name: str
    languages: List[Language]
    specialization: str
    location: str
    region: Region
    phone: str
    email: str
    website: Optional[str] = None
    pictureUrl: Optional[str] = None
    freeDuration: Optional[str] = None
    rating: Optional[float] = None

class LawyerUpdate(BaseModel):
    name: Optional[str] = None
    languages: Optional[List[Language]] = None
    specialization: Optional[str] = None
    location: Optional[str] = None
    region: Optional[Region] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    pictureUrl: Optional[str] = None
    freeDuration: Optional[str] = None
    rating: Optional[float] = None
    updated_at: datetime = Field(default_factory=datetime.now)

class LawyerFilter(BaseModel):
    language: Optional[Language] = None
    region: Optional[Region] = None
    specialization: Optional[str] = None 