"""
Google Gemini API integration for analyzing rental listings and documents.
"""

import os
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import json
import re
import logging
from app.models.rental import ScamLikelihood, TrustworthinessGrade, RiskLevel

# Configure logging
logger = logging.getLogger("rent-spiracy.gemini")

# Load environment variables
load_dotenv()

# Configure the Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)


class GeminiService:
    """Service for interacting with Google's Gemini API."""
    
    model_name = "gemini-1.5-pro"  # Using the most capable model
    
    @classmethod
    def get_model(cls):
        """Get the Gemini model instance."""
        return genai.GenerativeModel(cls.model_name)
    
    @classmethod
    async def analyze_rental_document(
        cls, 
        document_content: str,
        listing_url: Optional[str] = None,
        property_address: Optional[str] = None,
        language: Optional[str] = "english"
    ) -> Dict[str, Any]:
        """
        Analyze a rental listing or document using Gemini.
        
        Args:
            document_content: The text content of the lease document
            listing_url: Optional URL of the listing
            property_address: Optional property address
            
        Returns:
            Dictionary with analysis results
        """
        # Generate prompt for Gemini
        prompt = cls._generate_rental_analysis_prompt(
            document_content=document_content,
            listing_url=listing_url,
            property_address=property_address,
            language=language
        )
        
        # Get the model
        model = cls.get_model()
        
        try:
            # Print length of document for debugging
            logger.info(f"Document length: {len(document_content)} characters")
            logger.info(f"First 200 chars of document: {document_content[:200]}...")
            
            # Call Gemini API with structured output
            response = model.generate_content(
                prompt,
                generation_config=cls._get_generation_config(),
                safety_settings=cls._get_safety_settings()
            )
            
            raw_response = ""
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'content') and candidate.content:
                    parts = candidate.content.parts
                    if parts and len(parts) > 0:
                        raw_response = str(parts[0])
            else:
                raw_response = str(response)
                        
            # Debug: print raw response
            logger.info(f"Received response from Gemini (length: {len(raw_response)} characters)")
            logger.info(f"Response preview: {raw_response[:300]}...")
            
            # Process the response
            return cls._process_gemini_response(raw_response)
            
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            return {
                "error": str(e),
                "raw_response": f"Error: {str(e)}",
                "scam_likelihood": "Medium",  # Default fallback
                "explanation": f"Error analyzing document: {str(e)}",
                "clauses": [],
                "questions": []
            }
    
    @classmethod
    def _process_gemini_response(cls, raw_response: str) -> Dict[str, Any]:
        """Process the raw response from Gemini and extract structured data."""
        # Always store the raw response for debugging
        result = {
            "raw_response": raw_response
        }

        print(f"Raw response: {raw_response}")
        
        try:
            # Extract JSON from the response
            parsed_data = cls._extract_json_from_response(raw_response)
            if parsed_data:
                # Successfully extracted JSON
                logger.info(f"Successfully extracted JSON with {len(parsed_data.get('concerning_clauses', []))} clauses and {len(parsed_data.get('suggested_questions', []))} questions")
                
                # Format clauses for display
                concerning_clauses = []
                for clause in parsed_data.get('concerning_clauses', []):
                    # Standardize format
                    if isinstance(clause, dict):
                        standardized_clause = {
                            "original_text": clause.get('original_text', ''),
                            "simplified_text": clause.get('simplified_text', ''),
                            "is_concerning": clause.get('is_concerning', True),
                            "reason": clause.get('reason', '')
                        }
                        
                        # Skip if missing key info
                        if not standardized_clause["original_text"] or not standardized_clause["simplified_text"]:
                            continue
                            
                        concerning_clauses.append(standardized_clause)
                
                # Calculate trustworthiness metrics based on scam likelihood and number of concerning clauses
                scam_likelihood = parsed_data.get('scam_likelihood', 'Medium')
                trustworthiness_score, trustworthiness_grade, risk_level = cls._calculate_trustworthiness(
                    scam_likelihood, 
                    len(concerning_clauses)
                )
                
                # Ensure we have complete data with all fields
                return {
                    "raw_response": raw_response,
                    "scam_likelihood": scam_likelihood,
                    "explanation": parsed_data.get('explanation', 'Analysis completed'),
                    "concerning_clauses": concerning_clauses,  # Use concerning_clauses to match the JSON structure
                    "questions": parsed_data.get('suggested_questions', []),
                    "action_items": parsed_data.get('action_items', []),
                    "trustworthiness_score": trustworthiness_score,
                    "trustworthiness_grade": trustworthiness_grade.value,
                    "risk_level": risk_level.value
                }
                
            # If JSON extraction failed, try to parse using regex/NLP techniques
            logger.warning("Failed to extract structured JSON, using fallback parsing")
            
            # Extract potential scam likelihood
            scam_likelihood = cls._extract_scam_likelihood(raw_response)
            explanation = cls._extract_explanation(raw_response)
            concerning_clauses = cls._extract_concerning_clauses(raw_response)
            suggested_questions = cls._extract_suggested_questions(raw_response)
            action_items = cls._extract_action_items(raw_response)
            
            # Calculate trustworthiness metrics
            trustworthiness_score, trustworthiness_grade, risk_level = cls._calculate_trustworthiness(
                scam_likelihood, 
                len(concerning_clauses)
            )
            
            # Return extracted data
            logger.info(f"Fallback parsing extracted: likelihood={scam_likelihood}, {len(concerning_clauses)} clauses, {len(suggested_questions)} questions")
            
            # Format the result properly
            return {
                "raw_response": raw_response,
                "scam_likelihood": scam_likelihood,
                "explanation": explanation,
                "clauses": concerning_clauses,
                "questions": suggested_questions,
                "action_items": action_items,
                "trustworthiness_score": trustworthiness_score, 
                "trustworthiness_grade": trustworthiness_grade.value,
                "risk_level": risk_level.value
            }
        
        except Exception as e:
            logger.error(f"Error processing Gemini response: {str(e)}")
            return {
                "raw_response": raw_response,
                "error": str(e),
                "scam_likelihood": "Medium",
                "explanation": "Error analyzing document. Please try again.",
                "clauses": [],
                "questions": [],
                "action_items": [],
                "trustworthiness_score": 50,
                "trustworthiness_grade": TrustworthinessGrade.C.value,
                "risk_level": RiskLevel.MEDIUM_RISK.value
            }
    
    @staticmethod
    def _extract_json_from_response(response_text: str) -> Optional[Dict[str, Any]]:
        """Extract and parse JSON from the response."""
        try:
            # SIMPLIFIED JSON EXTRACTION
            # First, handle text: prefix if present
            if response_text.startswith('text: "'):
                # Remove the text: prefix and the outer quotes
                response_text = response_text[7:-1]
                # Unescape special characters
                response_text = response_text.replace('\\n', '\n').replace('\\"', '"')
            
            # Extract JSON content between ```json and ``` markers
            json_match = re.search(r'```(?:json)?\s*({\s*".*?})\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                logger.info(f"Found JSON between backticks ({len(json_str)} chars)")
                try:
                    # Handle problematic escape sequences that cause parse errors
                    # Replace escaped backslashes with a temporary marker
                    json_str = json_str.replace('\\\\', '__DOUBLE_BACKSLASH__')
                    # Replace escaped quotes
                    json_str = json_str.replace('\\"', '"')
                    # Fix invalid escape sequences
                    json_str = re.sub(r'\\(?!["\\/bfnrt])', r'\\\\', json_str)
                    # Restore properly escaped backslashes
                    json_str = json_str.replace('__DOUBLE_BACKSLASH__', '\\\\')
                    
                    data = json.loads(json_str)
                    return data
                except json.JSONDecodeError as e:
                    logger.warning(f"Found JSON block but failed to parse: {e}")
                    # Try a more aggressive approach
                    try:
                        # Sanitize string by building a valid JSON object manually
                        # Extract key fields we care about with regex
                        scam_likelihood = "Medium"
                        likelihood_match = re.search(r'"scam_likelihood":\s*"([^"]+)"', json_str)
                        if likelihood_match:
                            scam_likelihood = likelihood_match.group(1)
                            
                        explanation = "Analysis completed"
                        explanation_match = re.search(r'"explanation":\s*"([^"]+(?:\\.[^"]+)*)"', json_str)
                        if explanation_match:
                            explanation = explanation_match.group(1).replace('\\', '')
                            
                        # Construct a minimal valid JSON response
                        return {
                            "scam_likelihood": scam_likelihood,
                            "explanation": explanation,
                            "concerning_clauses": [],
                            "suggested_questions": [],
                            "action_items": []
                        }
                    except Exception as inner_e:
                        logger.warning(f"Failed to extract with manual approach: {inner_e}")
            
            # No valid JSON found
            logger.warning("No valid JSON found in response")
            return None
            
        except Exception as e:
            logger.error(f"Error in JSON extraction: {str(e)}")
            return None
    
    @staticmethod
    def _extract_scam_likelihood(response_text: str) -> str:
        """Extract scam likelihood from text."""
        # Look for explicit mentions
        patterns = [
            r'(?:scam|fraud)\s+likelihood\s*:?\s*(low|medium|high)',
            r'(?:scam|fraud)\s+risk\s*:?\s*(low|medium|high)', 
            r'(?:scam|fraud)\s+potential\s*:?\s*(low|medium|high)',
            r'likelihood\s*:?\s*(low|medium|high)',
            r'risk\s+(?:level|rating)\s*:?\s*(low|medium|high)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, response_text, re.IGNORECASE)
            if match:
                return match.group(1).capitalize()
        
        # Fallback: Check for key terms to infer likelihood
        lower_text = response_text.lower()
        high_risk_terms = ['suspicious', 'fraudulent', 'scam', 'illegal', 'very concerning', 'major red flags']
        medium_risk_terms = ['concerning', 'problematic', 'questionable', 'unusual', 'some red flags']
        
        # Count indicators
        high_count = sum(1 for term in high_risk_terms if term in lower_text)
        medium_count = sum(1 for term in medium_risk_terms if term in lower_text)
        
        if high_count > 2:
            return "High"
        elif medium_count > 2 or high_count > 0:
            return "Medium"
        else:
            return "Low"
    
    @staticmethod
    def _extract_explanation(response_text: str) -> str:
        """Extract explanation from text."""
        # Look for an explanation section
        explanation_patterns = [
            r'(?:explanation|analysis|assessment)\s*:?\s*(.{100,}?)(?=\n\n|\n#|\n\*\*|$)',
            r'(?<=\n\n)([^#\n].{100,}?)(?=\n\n)',
        ]
        
        for pattern in explanation_patterns:
            match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        
        # Fallback: Take the first substantial paragraph
        paragraphs = re.findall(r'\n\n([^#\n].{50,}?)(?=\n\n)', response_text, re.DOTALL)
        if paragraphs:
            return paragraphs[0].strip()
        
        # Ultra fallback: Just take the beginning of the response
        clean_text = re.sub(r'```.*?```', '', response_text, flags=re.DOTALL)  # Remove code blocks
        clean_text = re.sub(r'#.*?\n', '', clean_text)  # Remove headings
        
        if len(clean_text) > 100:
            return clean_text[:500] + "..."
        
        return "Analysis completed."
    
    @staticmethod
    def _extract_concerning_clauses(response_text: str) -> List[Dict[str, Any]]:
        """Extract concerning clauses from text."""
        concerning_clauses = []
        
        # Try to find a section about concerning clauses
        section_patterns = [
            r'(?:concerning|problematic)\s+clauses\s*:?\s*(.+?)(?=\n\n\s*[A-Z]|\n#|\n\*\*|$)',
            r'clause\s+analysis\s*:?\s*(.+?)(?=\n\n\s*[A-Z]|\n#|\n\*\*|$)'
        ]
        
        section_text = ""
        for pattern in section_patterns:
            match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
            if match:
                section_text = match.group(1).strip()
                break
        
        if section_text:
            # Try to extract individual clauses
            # Pattern 1: Look for numbered or bulleted items
            clause_matches = re.findall(r'(?:\d+\.|\*|\-|\•)\s+(.+?)(?=\n\s*(?:\d+\.|\*|\-|\•)|\n\n|\n#|\n\*\*|$)', 
                                       section_text, re.DOTALL)
            
            if clause_matches:
                for i, clause_text in enumerate(clause_matches):
                    # Process each clause
                    parts = clause_text.split('\n', 1)
                    
                    if len(parts) == 2:
                        # Clause has multiple parts - try to separate original and explanation
                        original = parts[0].strip()
                        simplified = parts[1].strip()
                    else:
                        # Single line - treat as original text
                        original = clause_text.strip()
                        simplified = f"Concerning clause {i+1}"
                    
                    concerning_clauses.append({
                        "original_text": original,
                        "simplified_text": simplified,
                        "is_concerning": True,
                        "reason": "Identified as concerning in analysis"
                    })
            
            # If still no clauses, try another approach with quotes
            if not concerning_clauses:
                # Look for quoted text which might be original clauses
                quoted_text = re.findall(r'"([^"]{10,})"[\s\n]*(.{10,}?)(?=\n\n|\n"|\n#|\n\*\*|$)', 
                                       section_text, re.DOTALL)
                
                if quoted_text:
                    for i, (original, explanation) in enumerate(quoted_text):
                        concerning_clauses.append({
                            "original_text": original.strip(),
                            "simplified_text": explanation.strip(),
                            "is_concerning": True,
                            "reason": "Identified as concerning in analysis"
                        })
        
        # If we couldn't find any clauses, check for generic red flags in the text
        if not concerning_clauses:
            # Look for indicators of red flags
            red_flags = []
            flag_patterns = [
                r'red\s+flag(?:\s+\d+)?:?\s*(.+?)(?=\n\n|\n#|\n\*\*|$)',
                r'warning(?:\s+\d+)?:?\s*(.+?)(?=\n\n|\n#|\n\*\*|$)',
                r'concern(?:\s+\d+)?:?\s*(.+?)(?=\n\n|\n#|\n\*\*|$)'
            ]
            
            for pattern in flag_patterns:
                flags = re.findall(pattern, response_text, re.IGNORECASE | re.DOTALL)
                red_flags.extend([flag.strip() for flag in flags if len(flag.strip()) > 20])
            
            if red_flags:
                for i, flag in enumerate(red_flags):
                    concerning_clauses.append({
                        "original_text": f"Red Flag {i+1}",
                        "simplified_text": flag,
                        "is_concerning": True,
                        "reason": "Identified as a red flag in analysis"
                    })
        
        return concerning_clauses
    
    @staticmethod
    def _extract_suggested_questions(response_text: str) -> List[str]:
        """Extract suggested questions from text."""
        questions = []
        
        # Try to find a section about suggested questions
        section_patterns = [
            r'(?:suggested|recommended)\s+questions\s*:?\s*(.+?)(?=\n\n\s*[A-Z]|\n#|\n\*\*|$)',
            r'questions\s+to\s+ask\s*:?\s*(.+?)(?=\n\n\s*[A-Z]|\n#|\n\*\*|$)'
        ]
        
        section_text = ""
        for pattern in section_patterns:
            match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
            if match:
                section_text = match.group(1).strip()
                break
        
        if section_text:
            # Extract questions from the section
            # Pattern 1: Look for numbered or bulleted items
            question_matches = re.findall(r'(?:\d+\.|\*|\-|\•)\s+(.+?)(?=\n\s*(?:\d+\.|\*|\-|\•)|\n\n|\n#|\n\*\*|$)', 
                                         section_text, re.DOTALL)
            
            if question_matches:
                for q in question_matches:
                    clean_q = q.strip()
                    if not clean_q.endswith('?'):
                        clean_q += '?'
                    if len(clean_q) > 10 and clean_q not in questions:
                        questions.append(clean_q)
        
        # If we couldn't find a questions section, look for questions throughout the text
        if not questions:
            # Find all substantial questions in the text
            question_candidates = re.findall(r'(?:\d+\.|\*|\-|\•)\s+([^"\n]{15,}\?)', response_text)
            
            for q in question_candidates:
                if q.strip() not in questions and len(questions) < 8:  # Limit to 8 questions
                    questions.append(q.strip())
        
        return questions
    
    @staticmethod
    def _extract_action_items(response_text: str) -> List[str]:
        """Extract action items from text."""
        action_items = []
        
        # Try to find a section about action items
        section_patterns = [
            r'(?:action\s+items|recommendations|steps\s+to\s+take)\s*:?\s*(.+?)(?=\n\n\s*[A-Z]|\n#|\n\*\*|$)',
        ]
        
        section_text = ""
        for pattern in section_patterns:
            match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
            if match:
                section_text = match.group(1).strip()
                break
        
        if section_text:
            # Extract action items from the section
            # Pattern 1: Look for numbered or bulleted items
            action_matches = re.findall(r'(?:\d+\.|\*|\-|\•)\s+(.+?)(?=\n\s*(?:\d+\.|\*|\-|\•)|\n\n|\n#|\n\*\*|$)', 
                                       section_text, re.DOTALL)
            
            if action_matches:
                for item in action_matches:
                    clean_item = item.strip()
                    if len(clean_item) > 10 and clean_item not in action_items:
                        action_items.append(clean_item)
        
        # Default recommendations based on lease assessment
        if not action_items:
            # Look for keywords to determine appropriate actions
            lower_text = response_text.lower()
            
            if any(term in lower_text for term in ['scam', 'fraud', 'suspicious', 'very concerning']):
                action_items = [
                    "Exercise extreme caution with this rental",
                    "Verify the landlord's identity and property ownership",
                    "Never send money before viewing the property in person",
                    "Consider reporting this listing if it shows signs of fraud"
                ]
            elif any(term in lower_text for term in ['concerning', 'problematic', 'questionable']):
                action_items = [
                    "Proceed with caution",
                    "Request clarification on concerning clauses",
                    "Consider having the lease reviewed by a tenant rights organization",
                    "Negotiate modifications to questionable terms before signing"
                ]
            else:
                action_items = [
                    "Review the lease thoroughly before signing",
                    "Ask questions about any unclear terms",
                    "Request a walkthrough inspection before moving in",
                    "Keep a signed copy of the lease for your records"
                ]
        
        return action_items
    
    @staticmethod
    def _generate_rental_analysis_prompt(
        document_content: str,
        listing_url: Optional[str] = None,
        property_address: Optional[str] = None,
        language: Optional[str] = "english"
    ) -> str:
        """Generate the prompt for Gemini API."""
        prompt_parts = [
            "You are an experienced legal expert specializing in rental agreements and lease documents. Your task is to analyze the provided lease document in EXTREME DETAIL to identify potential scams, concerning clauses, tenant rights issues, and any other problematic elements.",
            
            "First, determine if this is actually a lease agreement. Be VERY CAREFUL with this determination - only classify as 'not a lease' if the document is clearly something else like a tax form, bank statement, or random text. A basic or template lease should still be identified as a lease agreement, even if it's incomplete. If it has sections about rent, security deposit, tenant obligations, etc., it is likely a lease. If it's not a lease agreement, explicitly state this is NOT a lease agreement, explain what it appears to be, and why this indicates a potential scam.",
            
            "\n\nYour detailed analysis should include:"
            "\n1. A determination of scam likelihood (Low, Medium, or High) with thorough explanation"
            "\n2. A comprehensive assessment of the lease as a whole - provide DETAILED analysis of at least 300 words"
            "\n3. A detailed breakdown of EACH concerning clause with:"
            "\n   - The exact text from the lease"
            "\n   - A simplified explanation in plain language"
            "\n   - Why this clause is concerning or problematic"
            "\n   - Whether it might be illegal or unenforceable in most jurisdictions"
            "\n   - Specific recommendations for the tenant regarding this clause"
            "\n4. At least 6-8 specific questions the tenant should ask before signing, with explanations of why each question is important"
            "\n5. Actionable recommendations - specific actions the tenant should take based on your analysis"


            "All of the analysis should be in {language}. If the language is not English, translate the analysis into English before returning the response."
        ]
        
        # Add context information if available
        if listing_url:
            prompt_parts.append(f"\n\nListing URL: {listing_url}")
        if property_address:
            prompt_parts.append(f"\nProperty Address: {property_address}")
        
        # Add the document content
        if document_content:
            # Limit document size if it's very large
            doc_to_analyze = document_content
            if len(document_content) > 15000:
                doc_to_analyze = document_content[:15000] + "\n...[document truncated due to length]..."
                
            prompt_parts.append(f"\n\nLease Document:\n{doc_to_analyze}")
        else:
            prompt_parts.append("\n\nNote: No lease document was provided.")
        
        # Request structured JSON output
        prompt_parts.append(
            "\n\nPlease return your analysis in the following JSON format, wrapped in triple backticks:"
            "\n```json"
            "\n{"
            '\n  "scam_likelihood": "Low|Medium|High",'
            '\n  "explanation": "Your detailed 300+ word explanation here with thorough assessment of the entire lease...",'
            '\n  "concerning_clauses": ['
            '\n    {'
            '\n      "original_text": "Exact clause text from document...",'
            '\n      "simplified_text": "Simplified explanation in plain language...",'
            '\n      "is_concerning": true,'
            '\n      "reason": "Detailed explanation of why this clause is concerning, potentially illegal, or unfair..."'
            '\n    },'
            '\n    {'
            '\n      "original_text": "Another concerning clause...",'
            '\n      "simplified_text": "Plain language explanation...",'
            '\n      "is_concerning": true,'
            '\n      "reason": "Explanation of the issue with this clause..."'
            '\n    }'
            '\n  ],'
            '\n  "suggested_questions": ['
            '\n    "Specific question about a concerning term?",'
            '\n    "Another important question to ask?",'
            '\n    "A question about rights or responsibilities?",'
            '\n    "A question about a potentially unfair term?",'
            '\n    "A question about missing information?",'
            '\n    "A question about unclear language or terms?",'
            '\n    "A question about legal rights and protections?",'
            '\n    "A question about responsibilities not mentioned in the lease?"'
            '\n  ],'
            '\n  "action_items": ['
            '\n    "Specific action the tenant should take, like \'Request written clarification about clause X\'",'
            '\n    "Another action recommendation, like \'Verify the landlord is the actual property owner\'",'
            '\n    "A third action recommendation, like \'Consult with a tenant rights attorney about clause Y\'"'
            '\n  ]'
            '\n}'
            "\n```"
            "\n\nBe extremely thorough in your analysis. Identify ALL concerning clauses, not just the most obvious ones."
            "\nIf you find potentially illegal or highly unfair terms, be sure to highlight them prominently."
            "\nInclude at least 6-8 detailed, specific questions tailored to the exact issues in this lease document."
            "\nIf you can't find any concerning clauses, explain thoroughly why the lease appears to be fair and standard."
            "\nVERY IMPORTANT: Your response MUST be valid JSON that can be parsed programmatically - check that all quotes and braces match."
            "\nDO NOT include explanatory text outside the JSON block."
            "\nDO NOT nest multiple levels of quotes that would break JSON parsing."
            "\nEnsure your response is correctly formatted JSON and can be parsed directly. All text should be in {language}."
        )
        
        return "\n".join(prompt_parts)
    
    @staticmethod
    def _get_generation_config():
        """Get generation configuration for Gemini."""
        return {
            "temperature": 0.1,  # Lower temperature for more focused, predictable responses
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 4096,  # Increased output length for more detailed analysis
        }
    
    @staticmethod
    def _get_safety_settings():
        """Get safety settings for Gemini."""
        return [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    
    @staticmethod
    def _calculate_trustworthiness(scam_likelihood: str, concerning_clauses_count: int) -> tuple:
        """Calculate trustworthiness score, grade, and risk level based on analysis."""
        # Base score based on scam likelihood
        base_score = {
            "Low": 85,
            "Medium": 60,
            "High": 30
        }.get(scam_likelihood, 50)
        
        # Adjust score based on concerning clauses
        if concerning_clauses_count == 0:
            adjustment = 10  # Bonus for no concerning clauses
        elif concerning_clauses_count <= 2:
            adjustment = -5  # Minor concerns
        elif concerning_clauses_count <= 5:
            adjustment = -15  # Moderate concerns
        else:
            adjustment = -25  # Serious concerns
            
        # Calculate final score (keeping within 0-100 range)
        score = max(0, min(100, base_score + adjustment))
        
        # Determine grade based on score
        if score >= 90:
            grade = TrustworthinessGrade.A
        elif score >= 80:
            grade = TrustworthinessGrade.B
        elif score >= 60:
            grade = TrustworthinessGrade.C
        elif score >= 40:
            grade = TrustworthinessGrade.D
        else:
            grade = TrustworthinessGrade.F
            
        # Determine risk level
        if score >= 80:
            risk_level = RiskLevel.LOW_RISK
        elif score >= 60:
            risk_level = RiskLevel.MEDIUM_RISK
        elif score >= 30:
            risk_level = RiskLevel.HIGH_RISK
        else:
            risk_level = RiskLevel.VERY_HIGH_RISK
            
        return score, grade, risk_level 