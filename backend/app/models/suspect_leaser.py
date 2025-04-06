from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class SuspectLeaser(BaseModel):
    """Model for suspect leasers/landlords"""
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Full name of the suspect leaser")
    email: Optional[str] = Field(None, description="Email address of the suspect leaser")
    phone: Optional[str] = Field(None, description="Phone number of the suspect leaser")
    addresses: List[str] = Field(default_factory=list, description="List of addresses associated with the suspect leaser")
    flags: List[str] = Field(default_factory=list, description="List of flags/issues associated with the suspect leaser")
    reported_count: int = Field(default=0, description="Number of times this leaser has been reported")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")


class SuspectLeaserCreate(BaseModel):
    """Model for creating a new suspect leaser"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    addresses: List[str] = []
    flags: List[str] = []
    reported_count: int = 0


class SuspectLeaserUpdate(BaseModel):
    """Model for updating an existing suspect leaser"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    addresses: Optional[List[str]] = None
    flags: Optional[List[str]] = None
    reported_count: Optional[int] = None 