import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def format_analysis_response(analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format the analysis response from the LLM into a standardized format.
    
    Args:
        analysis_data (Dict[str, Any]): Raw analysis data from the LLM
        
    Returns:
        Dict[str, Any]: Formatted analysis response
    """
    try:
        # Extract or default the scam likelihood
        scam_likelihood = analysis_data.get("scam_likelihood", "Medium")
        if isinstance(scam_likelihood, str):
            scam_likelihood = scam_likelihood.title()  # Convert to title case
        
        # Calculate base trustworthiness score based on scam likelihood
        base_score = {
            "Low": 85,
            "Medium": 60,
            "High": 30
        }.get(scam_likelihood, 50)
        
        # Count concerning clauses
        concerning_clauses = analysis_data.get("concerning_clauses", [])
        concerning_count = len(concerning_clauses)
        
        # Adjust score based on concerning clauses
        if concerning_count == 0:
            adjustment = 10  # Bonus for no concerning clauses
        elif concerning_count <= 2:
            adjustment = -5  # Minor concerns
        elif concerning_count <= 5:
            adjustment = -15  # Moderate concerns
        else:
            adjustment = -25  # Serious concerns
            
        # Calculate final score (keeping within 0-100 range)
        trustworthiness_score = max(0, min(100, base_score + adjustment))
        
        # Determine grade based on score
        if trustworthiness_score >= 90:
            trustworthiness_grade = "A"
        elif trustworthiness_score >= 80:
            trustworthiness_grade = "B"
        elif trustworthiness_score >= 60:
            trustworthiness_grade = "C"
        elif trustworthiness_score >= 40:
            trustworthiness_grade = "D"
        else:
            trustworthiness_grade = "F"
            
        # Determine risk level
        if trustworthiness_score >= 80:
            risk_level = "Low Risk"
        elif trustworthiness_score >= 60:
            risk_level = "Medium Risk"
        elif trustworthiness_score >= 30:
            risk_level = "High Risk"
        else:
            risk_level = "Very High Risk"
        
        # Format the response
        formatted_response = {
            "scam_likelihood": scam_likelihood,
            "trustworthiness_score": trustworthiness_score,
            "trustworthiness_grade": trustworthiness_grade,
            "risk_level": risk_level,
            "explanation": analysis_data.get("explanation", "Analysis completed"),
            "simplified_clauses": concerning_clauses,
            "suggested_questions": analysis_data.get("questions", []),
            "action_items": analysis_data.get("action_items", [])
        }
        
        return formatted_response
        
    except Exception as e:
        logger.error(f"Error formatting analysis response: {str(e)}")
        return {
            "scam_likelihood": "Medium",
            "trustworthiness_score": 50,
            "trustworthiness_grade": "C",
            "risk_level": "Medium Risk",
            "explanation": "Error formatting analysis response",
            "simplified_clauses": [],
            "suggested_questions": [],
            "action_items": []
        } 