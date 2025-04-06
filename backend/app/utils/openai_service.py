from openai import AsyncOpenAI
import os
import json
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger("rent-spiracy.openai")

class OpenAIService:
    """Service for handling OpenAI API calls as a fallback when Gemini quota is exceeded."""
    
    _client = None
    
    @classmethod
    def get_client(cls) -> AsyncOpenAI:
        if cls._client is None:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY environment variable is not set")
            cls._client = AsyncOpenAI(api_key=api_key)
        return cls._client
    
    @classmethod
    async def analyze_rental_document(
        cls,
        document_content: str,
        listing_url: Optional[str] = None,
        property_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze a rental document using OpenAI's GPT model."""
        try:
            client = cls.get_client()
            
            # Construct the prompt
            prompt = f"""Analyze this rental listing or lease document for potential scams or concerning issues.
            
Document Content:
{document_content}

{f'Listing URL: {listing_url}' if listing_url else ''}
{f'Property Address: {property_address}' if property_address else ''}

Provide a detailed analysis in the following JSON format:
{{
    "scam_likelihood": "Low|Medium|High",
    "explanation": "Detailed explanation of the analysis...",
    "concerning_clauses": [
        {{
            "original_text": "The concerning text",
            "simplified_text": "Simplified explanation",
            "is_concerning": true,
            "reason": "Why this is concerning"
        }}
    ],
    "questions": [
        "Important questions to ask..."
    ],
    "action_items": [
        "Recommended actions to take..."
    ]
}}"""

            # Call OpenAI API
            response = await client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert in real estate and rental scam detection."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={ "type": "json_object" }
            )
            
            # Extract and parse the response
            response_text = response.choices[0].message.content
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse OpenAI response as JSON: {response_text}")
                # Return a basic response if JSON parsing fails
                return {
                    "scam_likelihood": "Medium",
                    "explanation": response_text[:500],
                    "concerning_clauses": [],
                    "questions": ["Please verify all details with the landlord"],
                    "action_items": ["Review the listing carefully"]
                }
                
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise 