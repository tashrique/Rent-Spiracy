from pydantic import BaseModel, EmailStr, HttpUrl, Field
from enum import Enum
from typing import List, Optional


class ScamLikelihood(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class Language(str, Enum):
    ENGLISH = "english"
    SPANISH = "spanish"
    CHINESE = "chinese"
    HINDI = "hindi"


class LeaseClause(BaseModel):
    text: str
    simplified_text: str
    is_concerning: bool = False
    reason: Optional[str] = None


class ScamDetectionRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    listing_url: Optional[str] = None
    address: Optional[str] = None
    language: Language = Language.ENGLISH


class ScamDetectionResponse(BaseModel):
    scam_likelihood: ScamLikelihood
    explanation: str
    simplified_clauses: List[LeaseClause] = []
    suggested_questions: List[str] = []
