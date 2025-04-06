from pydantic import BaseModel, Field
from typing import Optional, List, Union, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import validator


class Language(str, Enum):
    ENGLISH = "english"
    CHINESE = "chinese"
    HINDI = "hindi"
    SPANISH = "spanish"
    KOREAN = "korean"
    BENGALI = "bengali"
    SWAHILI = "swahili"
    ARABIC = "arabic"


class RentalAnalysisRequest(BaseModel):
    """Request model for rental analysis."""
    listing_url: Optional[str] = None
    property_address: Optional[str] = None
    document_content: Optional[str] = None
    language: Language = Language.ENGLISH
    voice_output: bool = False

    class Config:
        schema_extra = {
            "example": {
                "listing_url": "https://example.com/rental/123",
                "property_address": "123 Main St, Anytown, NY 10001",
                "document_content": None,
                "language": "english",
                "voice_output": False
            }
        }

    def validate_input(self):
        """Validate that at least one input field is provided."""
        if not any([
            self.listing_url,
            self.property_address,
            self.document_content
        ]):
            raise ValueError(
                "At least one of listing_url, property_address, or document_content must be provided")
        return True


class ClauseAnalysis(BaseModel):
    """A single clause analysis result."""
    text: str
    simplified_text: str
    is_concerning: bool
    reason: Optional[str] = None
    legal_reference: Optional[str] = None  # Changed from california_law to be more generic


class ScamLikelihood(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class RiskLevel(str, Enum):
    """Risk level classification"""
    LOW_RISK = "Low Risk"
    MEDIUM_RISK = "Medium Risk"
    HIGH_RISK = "High Risk"
    VERY_HIGH_RISK = "Very High Risk"


class TrustworthinessGrade(str, Enum):
    """Letter grade for trustworthiness"""
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    F = "F"


class CaliforniaTenantRights(BaseModel):
    """Model for California-specific tenant rights information"""
    relevant_statutes: List[str] = []
    local_ordinances: List[str] = []
    case_law: List[str] = []


class AnalysisResult(BaseModel):
    """Result of a rental property analysis."""
    id: str
    scam_likelihood: Union[ScamLikelihood, str]
    trustworthiness_score: Optional[int] = None
    trustworthiness_grade: Optional[str] = None
    risk_level: Optional[str] = None
    explanation: str
    action_items: Optional[List[str]] = []
    simplified_clauses: List[ClauseAnalysis]
    suggested_questions: List[str]
    created_at: Optional[datetime] = None
    raw_response: Optional[str] = None
    tenant_rights: Optional[Dict[str, List[str]]] = None  # Changed from california_tenant_rights
    key_lease_terms: Optional[Dict[str, Any]] = None
    
    # Convert from non-Enum to Enum if needed
    @validator('scam_likelihood', pre=True)
    def convert_scam_likelihood(cls, v):
        if isinstance(v, str):
            try:
                return ScamLikelihood[v.upper()]
            except KeyError:
                # Handle string values that don't match enum names
                if v.lower() == 'low':
                    return ScamLikelihood.LOW
                elif v.lower() == 'medium':
                    return ScamLikelihood.MEDIUM
                elif v.lower() == 'high':
                    return ScamLikelihood.HIGH
                else:
                    return v
        return v

    class Config:
        schema_extra = {
            "example": {
                "id": "1680123456.789",
                "scam_likelihood": "Low",
                "trustworthiness_score": 85,
                "trustworthiness_grade": "B",
                "risk_level": "Low Risk",
                "explanation": "This rental listing appears legitimate based on our analysis.",
                "action_items": [
                    "Schedule an in-person viewing of the property",
                    "Ask for proof of ownership before signing"
                ],
                "simplified_clauses": [
                    {
                        "text": "Tenant shall pay a security deposit of $1000.",
                        "simplified_text": "You need to pay $1000 as a security deposit.",
                        "is_concerning": False,
                        "legal_reference": "California Civil Code § 1950.5 limits security deposits to twice the monthly rent for unfurnished units."
                    }
                ],
                "suggested_questions": [
                    "Can I see the property before signing?",
                    "Are utilities included in the rent?"
                ],
                "created_at": "2023-04-01T12:00:00",
                "tenant_rights": {
                    "relevant_statutes": [
                        "California Civil Code § 1950.5 - Security Deposits: Limits security deposits to 2x monthly rent for unfurnished properties."
                    ],
                    "local_ordinances": [
                        "San Francisco Rent Ordinance - May limit rent increases and provide additional eviction protections."
                    ],
                    "case_law": [
                        "Green v. Superior Court (1974) - Established implied warranty of habitability in California."
                    ]
                }
            }
        }
