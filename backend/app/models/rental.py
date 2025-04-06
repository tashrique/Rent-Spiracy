from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Language(str, Enum):
    ENGLISH = "english"
    CHINESE = "chinese"
    HINDI = "hindi"
    SPANISH = "spanish"
    KOREAN = "korean"
    BENGALI = "bengali"


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
    """Model for clause analysis results."""
    text: str
    simplified_text: str
    is_concerning: bool
    reason: Optional[str] = None
    california_law: Optional[str] = None  # California legal code references


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
    """Model for analysis results."""
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    scam_likelihood: ScamLikelihood
    trustworthiness_score: int = Field(default=75, ge=0, le=100)  # 0-100 score
    trustworthiness_grade: TrustworthinessGrade = TrustworthinessGrade.C  # A-F grade
    risk_level: RiskLevel = RiskLevel.MEDIUM_RISK
    explanation: str
    action_items: Optional[List[str]] = []  # Recommendations for what to do
    simplified_clauses: List[ClauseAnalysis] = []
    suggested_questions: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    raw_response: Optional[str] = None  # Raw response from LLM for frontend processing
    california_tenant_rights: Optional[CaliforniaTenantRights] = None  # California tenant rights info

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
                        "california_law": "California Civil Code § 1950.5 limits security deposits to twice the monthly rent for unfurnished units."
                    }
                ],
                "suggested_questions": [
                    "Can I see the property before signing?",
                    "Are utilities included in the rent?"
                ],
                "created_at": "2023-04-01T12:00:00",
                "california_tenant_rights": {
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
