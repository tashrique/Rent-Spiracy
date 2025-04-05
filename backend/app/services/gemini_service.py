import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

async def analyze_listing(listing_data: dict) -> dict:
    """
    Analyze rental listing data using Gemini API for potential scam indicators
    """
    try:
        # Create a detailed prompt for scam analysis
        prompt = f"""
        Please analyze this rental property listing for potential scam indicators. Consider common rental scam patterns.

        Listing Information:
        - URL: {listing_data.get('listing_url')}
        - Property Address: {listing_data.get('property_address')}
        - Landlord Contact:
          * Email: {listing_data.get('landlord_email')}
          * Phone: {listing_data.get('landlord_phone')}
        
        Please provide a comprehensive analysis including:

        1. Risk Assessment:
           - Overall risk level (low, medium, high)
           - Confidence score (0-100%)
           - Key risk factors identified

        2. Red Flags Analysis:
           - Check for common scam patterns
           - Analyze contact information legitimacy
           - Identify suspicious patterns in communication methods
           - Evaluate if the listing details match market norms

        3. Specific Concerns:
           - Email domain reputation
           - Phone number geography/format
           - Price vs. market rate discrepancies
           - Listing content suspicious patterns

        4. Recommendations:
           - Specific steps for the potential renter to verify legitimacy
           - Warning signs to watch for
           - Safety precautions for proceeding

        5. Additional Verification Steps:
           - Suggested background checks
           - Property ownership verification methods
           - Local market rate comparison

        Please format the response in a structured way that can be easily parsed.
        """
        
        # Get Gemini model
        model = genai.GenerativeModel('gemini-pro')
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Process and structure the response
        analysis_result = {
            "raw_analysis": response.text,
            "risk_level": _extract_risk_level(response.text),
            "red_flags": _extract_red_flags(response.text),
            "recommendations": _extract_recommendations(response.text),
            "verification_steps": _extract_verification_steps(response.text),
            "confidence_score": _extract_confidence_score(response.text)
        }
        
        return analysis_result
    
    except Exception as e:
        logger.error(f"Error in Gemini analysis: {str(e)}")
        raise

def _extract_risk_level(analysis_text: str) -> str:
    """Extract risk level from analysis text"""
    if "high risk" in analysis_text.lower():
        return "high"
    elif "medium risk" in analysis_text.lower():
        return "medium"
    return "low"

def _extract_red_flags(analysis_text: str) -> list:
    """Extract red flags from analysis text"""
    red_flags = []
    lines = analysis_text.split('\n')
    for line in lines:
        if any(term in line.lower() for term in ['red flag', 'warning', 'suspicious', 'concern']):
            # Clean up the line and remove any leading/trailing whitespace or bullets
            cleaned_line = line.strip().lstrip('•-*').strip()
            if cleaned_line:
                red_flags.append(cleaned_line)
    return red_flags

def _extract_recommendations(analysis_text: str) -> list:
    """Extract recommendations from analysis text"""
    recommendations = []
    in_recommendations_section = False
    lines = analysis_text.split('\n')
    
    for line in lines:
        if 'recommendation' in line.lower():
            in_recommendations_section = True
            continue
        if in_recommendations_section and line.strip():
            if any(section in line.lower() for section in ['verification', 'additional', 'analysis']):
                break
            cleaned_line = line.strip().lstrip('•-*').strip()
            if cleaned_line:
                recommendations.append(cleaned_line)
    return recommendations

def _extract_verification_steps(analysis_text: str) -> list:
    """Extract verification steps from analysis text"""
    steps = []
    in_verification_section = False
    lines = analysis_text.split('\n')
    
    for line in lines:
        if 'verification' in line.lower():
            in_verification_section = True
            continue
        if in_verification_section and line.strip():
            if 'conclusion' in line.lower():
                break
            cleaned_line = line.strip().lstrip('•-*').strip()
            if cleaned_line:
                steps.append(cleaned_line)
    return steps

def _extract_confidence_score(analysis_text: str) -> int:
    """Extract confidence score from analysis text"""
    try:
        for line in analysis_text.split('\n'):
            if 'confidence' in line.lower() and '%' in line:
                # Extract number before %
                score = int(''.join(filter(str.isdigit, line)))
                return min(100, max(0, score))  # Ensure score is between 0-100
    except:
        pass
    return 50  # Default confidence score 