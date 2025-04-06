from app.models.rental import RentalAnalysisRequest, AnalysisResult, ClauseAnalysis, ScamLikelihood, RiskLevel, TrustworthinessGrade
from app.utils.db import get_analyses_collection, Database
from app.utils.pdf_parser import extract_text_from_pdf
from app.utils.gemini_service import GeminiService
from datetime import datetime
import uuid
import re
import json
import random
import requests
from typing import Optional, Dict, Any


class AnalysisService:
    """Service for handling rental analysis."""

    @staticmethod
    async def analyze_rental(request: RentalAnalysisRequest) -> AnalysisResult:
        """
        Analyze a rental based on the provided information.
        Flow:
        1. If document_content provided: Analyze the document directly
        2. If listing_url provided: Scrape webpage and get random lease from DB
        3. If property_address provided: Google search for address, find listing, get random lease
        """
        # Validate input
        request.validate_input()

        # Generate a unique ID for this analysis
        analysis_id = str(uuid.uuid4())
        
        document_content = ""
        property_info = {}
        
        try:
            # FLOW PATH 1: User uploaded a lease document
            if request.document_content:
                document_content = request.document_content
                print(f"User uploaded a lease document: {len(document_content)} chars")
                
            # FLOW PATH 2: User provided listing URL
            elif request.listing_url:
                print(f"User provided listing URL: {request.listing_url}")
                # Scrape webpage for information (simplified)
                try:
                    response = requests.get(request.listing_url, timeout=10)
                    property_info = {"source": "listing_url", "url": request.listing_url}
                    if response.status_code == 200:
                        property_info["page_content"] = response.text[:5000]  # Just first 5000 chars for demo << jina ai stuff here
                except Exception as e:
                    print(f"Error scraping listing URL: {str(e)}")
                    property_info["error"] = str(e)
                
                # Get random lease from database
                document_content = await AnalysisService._get_random_lease_document()
                
            # FLOW PATH 3: User provided property address
            elif request.property_address:
                print(f"User provided property address: {request.property_address}")
                property_info = {"source": "property_address", "address": request.property_address}
                
                # Google search for the address to find listings
                listing_url = await AnalysisService._search_property_listings(request.property_address)
                
                if listing_url:
                    property_info["found_listing"] = listing_url
                    try:
                        response = requests.get(listing_url, timeout=10)
                        if response.status_code == 200:
                            property_info["page_content"] = response.text[:500]  # Just first 500 chars for demo
                    except Exception as e:
                        print(f"Error scraping found listing: {str(e)}")
                        property_info["error"] = str(e)
                
                # Get random lease from database
                document_content = await AnalysisService._get_random_lease_document()
            
            # Make sure we have some document content for analysis
            if not document_content:
                document_content = "No document content could be retrieved."
            
            # Log analysis request
            print(f"Analyzing rental - URL: {request.listing_url}, Address: {request.property_address}, Document length: {len(document_content)} chars")
            
            # Call Gemini for analysis
            gemini_response = await GeminiService.analyze_rental_document(
                document_content=document_content,
                listing_url=request.listing_url or property_info.get("found_listing"),
                property_address=request.property_address,
                language=request.language
            )
            
            # Ensure we get a valid response, not None
            if not gemini_response:
                gemini_response = {
                    "raw_response": "Failed to get response from Gemini API",
                    "scam_likelihood": "Medium",
                    "explanation": "The system was unable to analyze this document properly. Please try again.",
                    "concerning_clauses": [],
                    "questions": [],
                    "action_items": []
                }
            
            raw_response = gemini_response.get("raw_response", "")
            print(f"Received response from Gemini: {len(raw_response)} chars")
            # print(f"Raw response: {raw_response}")
            
            # Initialize default values for variables to ensure they're always defined
            scam_likelihood = ScamLikelihood.MEDIUM
            explanation = "Analysis completed"
            clauses = []
            questions = []
            action_items = []
            
            # If we have pre-parsed data from Gemini service, use it
            if "concerning_clauses" in gemini_response and isinstance(gemini_response["concerning_clauses"], list):
                print("Using pre-parsed data from Gemini service")
                
                # Just use the pre-parsed data directly without excessive text cleaning
                parsed_clauses = []
                for clause_data in gemini_response["concerning_clauses"]:
                    # Skip if missing required fields
                    if not clause_data.get("original_text") or not clause_data.get("simplified_text"):
                        continue
                    
                    parsed_clauses.append(ClauseAnalysis(
                        text=clause_data.get("original_text", ""),
                        simplified_text=clause_data.get("simplified_text", ""),
                        is_concerning=clause_data.get("is_concerning", True),
                        reason=clause_data.get("reason", "")
                    ))
                
                scam_likelihood_str = gemini_response.get("scam_likelihood", "Medium")
                if scam_likelihood_str.capitalize() in ["Low", "Medium", "High"]:
                    scam_likelihood = getattr(ScamLikelihood, scam_likelihood_str.upper())
                else:
                    scam_likelihood = ScamLikelihood.MEDIUM
                
                explanation = gemini_response.get("explanation", "Analysis completed.")
                questions = gemini_response.get("questions", [])
                action_items = gemini_response.get("action_items", [])
                clauses = parsed_clauses
                
                # Print what we parsed
                print(f"Parsed likelihood: {scam_likelihood}")
                print(f"Found {len(clauses)} concerning clauses")
                print(f"Found {len(questions)} suggested questions")
                
                # If no concerning clauses were found but we have a likelihood and explanation
                if not clauses:
                    print("No concerning clauses found, checking for content")
                    
                    # Add a placeholder clause
                    clauses.append(ClauseAnalysis(
                        text="General Lease Review",
                        simplified_text="While no specific concerning clauses were identified, always review your lease thoroughly before signing.",
                        is_concerning=False,
                        reason="No specific concerning clauses were identified in the analysis."
                    ))
                
                # Calculate trustworthiness metrics based on analysis
                trustworthiness_score, trustworthiness_grade, risk_level = AnalysisService._calculate_trustworthiness(
                    scam_likelihood.name, 
                    len(clauses)
                )
                
                # Store analysis result in database
                analysis_result = AnalysisResult(
                    id=analysis_id,
                    scam_likelihood=scam_likelihood,
                    trustworthiness_score=trustworthiness_score,
                    trustworthiness_grade=trustworthiness_grade,
                    risk_level=risk_level,
                    explanation=explanation,
                    simplified_clauses=clauses,
                    suggested_questions=questions,
                    action_items=action_items or [],
                    created_at=datetime.now(),
                    raw_response=raw_response  # Include the raw response for the frontend to use directly
                )
                
                # Store in database (will implement this properly)
                try:
                    analyses = await get_analyses_collection()
                    result_dict = analysis_result.dict()
                    
                    # Convert enum values to strings for MongoDB
                    result_dict["scam_likelihood"] = scam_likelihood.value
                    result_dict["risk_level"] = risk_level
                    result_dict["trustworthiness_grade"] = trustworthiness_grade
                    
                    # Convert datetime to ISO format
                    result_dict["created_at"] = result_dict["created_at"].isoformat()
                    
                    # Insert into database
                    print(f"Storing analysis result with ID: {analysis_id}")
                    await analyses.insert_one(result_dict)
                except Exception as e:
                    print(f"Error storing analysis in database: {str(e)}")
                    
                return analysis_result
            
        except Exception as e:
            print(f"Error during analysis: {str(e)}")
            # Return a basic error response
            return AnalysisResult(
                id=str(uuid.uuid4()),
                scam_likelihood=ScamLikelihood.MEDIUM,
                explanation=f"An error occurred during analysis: {str(e)}",
                simplified_clauses=[],
                suggested_questions=[],
                created_at=datetime.now(),
                raw_response=f"Error: {str(e)}"
            )

    @staticmethod
    def _calculate_trustworthiness(scam_likelihood: str, concerning_clauses_count: int) -> tuple:
        """Calculate trustworthiness score, grade, and risk level based on analysis."""
        # Base score based on scam likelihood - MORE GENEROUS STARTING POINTS
        base_score = {
            "LOW": 90,    # Increased from 85
            "MEDIUM": 70, # Increased from 60
            "HIGH": 40    # Increased from 30
        }.get(scam_likelihood, 60)  # Default is more generous too (was 50)
        
        # Adjust score based on concerning clauses - LESS SEVERE PENALTIES
        if concerning_clauses_count == 0:
            adjustment = 10  # Bonus for no concerning clauses
        elif concerning_clauses_count == 1:
            adjustment = 0   # Single concern is normal, no penalty
        elif concerning_clauses_count <= 3:
            adjustment = -5  # Minor concerns
        elif concerning_clauses_count <= 6:
            adjustment = -10 # Moderate concerns (was -15)
        else:
            adjustment = -20 # Serious concerns (was -25)
            
        # Calculate final score (keeping within 0-100 range)
        score = max(0, min(100, base_score + adjustment))
        
        # Determine grade based on score - MORE RELAXED GRADING
        if score >= 85:      # Was 90
            grade = TrustworthinessGrade.A
        elif score >= 75:    # Was 80
            grade = TrustworthinessGrade.B
        elif score >= 55:    # Was 60
            grade = TrustworthinessGrade.C
        elif score >= 35:    # Was 40
            grade = TrustworthinessGrade.D
        else:
            grade = TrustworthinessGrade.F
            
        # Determine risk level - MORE RELAXED RISK ASSESSMENT
        if score >= 75:      # Was 80
            risk_level = RiskLevel.LOW_RISK
        elif score >= 55:    # Was 60
            risk_level = RiskLevel.MEDIUM_RISK
        elif score >= 25:    # Was 30
            risk_level = RiskLevel.HIGH_RISK
        else:
            risk_level = RiskLevel.VERY_HIGH_RISK
            
        return score, grade, risk_level

    @staticmethod
    def _clean_explanation(explanation: str, raw_response: str) -> str:
        """Clean up explanation text that might contain JSON formatting"""
        # First, check if the explanation is a raw JSON string
        if explanation.startswith('{') or '": "' in explanation:
            try:
                # Try to parse as JSON if it looks like JSON
                json_data = json.loads(explanation)
                if isinstance(json_data, dict) and 'explanation' in json_data:
                    # Replace escaped newlines with actual newlines
                    cleaned_explanation = json_data['explanation'].replace('\\n', '\n').replace('\\"', '"')
                    return cleaned_explanation
            except (json.JSONDecodeError, KeyError):
                pass
                
        # If explanation starts with ```json, try to extract the actual explanation
        if explanation.startswith('```json') or '```json' in explanation:
            try:
                # Try to extract from JSON if it's in a code block
                json_match = re.search(r'```json\s*({.*?})\s*```', explanation, re.DOTALL)
                if json_match:
                    json_data = json.loads(json_match.group(1))
                    if 'explanation' in json_data and len(json_data['explanation']) > 20:
                        # Replace escaped newlines with actual newlines
                        cleaned_explanation = json_data['explanation'].replace('\\n', '\n').replace('\\"', '"')
                        return cleaned_explanation
            except (json.JSONDecodeError, KeyError):
                pass
                
            # If that fails, strip out the JSON formatting
            explanation = re.sub(r'```json\s*', '', explanation)
            explanation = re.sub(r'```\s*', '', explanation)
            
            # Try to extract explanation field from JSON string
            try:
                json_data = json.loads(explanation)
                if 'explanation' in json_data and len(json_data['explanation']) > 20:
                    # Replace escaped newlines with actual newlines
                    cleaned_explanation = json_data['explanation'].replace('\\n', '\n').replace('\\"', '"')
                    return cleaned_explanation
            except (json.JSONDecodeError, KeyError):
                pass
        
        # Check if explanation is a JSON string (not in code blocks)
        if explanation.strip().startswith('{') and explanation.strip().endswith('}'):
            try:
                json_data = json.loads(explanation)
                if 'explanation' in json_data and len(json_data['explanation']) > 20:
                    # Replace escaped newlines with actual newlines
                    cleaned_explanation = json_data['explanation'].replace('\\n', '\n').replace('\\"', '"')
                    return cleaned_explanation
            except (json.JSONDecodeError, KeyError):
                pass
        
        # Look for explanation field in a more lenient way
        expl_match = re.search(r'"explanation":\s*"([^"]+)"', explanation)
        if expl_match:
            extracted = expl_match.group(1)
            if len(extracted) > 20:
                # Replace escaped newlines with actual newlines
                cleaned_explanation = extracted.replace('\\n', '\n').replace('\\"', '"')
                return cleaned_explanation
        
        # As a last resort, search the raw response for the explanation
        if len(explanation) < 100 and raw_response:
            try:
                json_match = re.search(r'```json\s*({.*?})\s*```', raw_response, re.DOTALL)
                if json_match:
                    json_data = json.loads(json_match.group(1))
                    if 'explanation' in json_data and len(json_data['explanation']) > 20:
                        # Replace escaped newlines with actual newlines
                        cleaned_explanation = json_data['explanation'].replace('\\n', '\n').replace('\\"', '"')
                        return cleaned_explanation
            except (json.JSONDecodeError, KeyError):
                pass
            
            # Try to extract from regular JSON
            json_objects = re.findall(r'{[^{}]*"explanation":[^{}]*}', raw_response)
            for json_obj in json_objects:
                try:
                    # Add outer braces if they're missing
                    if not json_obj.startswith('{'):
                        json_obj = '{' + json_obj
                    if not json_obj.endswith('}'):
                        json_obj = json_obj + '}'
                    
                    json_data = json.loads(json_obj)
                    if 'explanation' in json_data and len(json_data['explanation']) > 20:
                        # Replace escaped newlines with actual newlines
                        cleaned_explanation = json_data['explanation'].replace('\\n', '\n').replace('\\"', '"')
                        return cleaned_explanation
                except (json.JSONDecodeError, KeyError):
                    continue
        
        # Replace any escaped newlines with actual newlines and escaped quotes with actual quotes
        explanation = explanation.replace('\\n', '\n').replace('\\"', '"')
        return explanation

    @staticmethod
    def _extract_json_from_response(response_text: str) -> Optional[Dict[str, Any]]:
        """Extract and parse JSON from the response."""
        try:
            # First try to find JSON in code blocks with language specifier
            json_match = re.search(r'```(?:json)?\s*({\s*".*?})\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                try:
                    data = json.loads(json_str)
                    print(f"Successfully parsed JSON code block with {len(json_str)} chars")
                    
                    # Validate that at least one key field is present
                    if any(k in data for k in ['scam_likelihood', 'explanation', 'concerning_clauses', 'clauses']):
                        result = {
                            "scam_likelihood": data.get('scam_likelihood', 'Medium'),
                            "explanation": data.get('explanation', 'Analysis completed.'),
                            "clauses": data.get('concerning_clauses', data.get('clauses', [])),
                            "questions": data.get('suggested_questions', data.get('questions', [])),
                            "action_items": data.get('action_items', [])
                        }
                        print(f"Extracted data with {len(result.get('clauses', []))} clauses and {len(result.get('questions', []))} questions")
                        return result
                except json.JSONDecodeError as e:
                    print(f"Found JSON block but failed to parse it: {e}")
            
            # Try to find JSON blocks without language specifier
            json_match = re.search(r'```\s*({\s*".*?})\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                try:
                    data = json.loads(json_str)
                    print(f"Successfully parsed unmarked JSON code block with {len(json_str)} chars")
                    
                    # Validate that at least one key field is present
                    if any(k in data for k in ['scam_likelihood', 'explanation', 'concerning_clauses', 'clauses']):
                        result = {
                            "scam_likelihood": data.get('scam_likelihood', 'Medium'),
                            "explanation": data.get('explanation', 'Analysis completed.'),
                            "clauses": data.get('concerning_clauses', data.get('clauses', [])),
                            "questions": data.get('suggested_questions', data.get('questions', [])),
                            "action_items": data.get('action_items', [])
                        }
                        print(f"Extracted data with {len(result.get('clauses', []))} clauses and {len(result.get('questions', []))} questions")
                        return result
                except json.JSONDecodeError:
                    print("Found unmarked JSON block but failed to parse it")
            
            # Look for JSON objects with more flexible pattern
            potential_json_blocks = re.findall(r'({[\s\S]*?})', response_text)
            for json_str in potential_json_blocks:
                try:
                    if len(json_str) > 50:  # Only try to parse substantial JSON blocks
                        data = json.loads(json_str)
                        print(f"Found embedded JSON, attempting to extract from {len(json_str)} chars")
                        
                        # Check for required fields using various common naming patterns
                        fields_found = []
                        if any(k in data for k in ['scam_likelihood', 'scamLikelihood', 'likelihood', 'risk']):
                            fields_found.append('scam_likelihood')
                        if any(k in data for k in ['explanation', 'analysis', 'summary', 'details']):
                            fields_found.append('explanation')
                        if any(k in data for k in ['concerning_clauses', 'clauses', 'clauseAnalysis', 'problematicClauses']):
                            fields_found.append('clauses')
                            
                        if len(fields_found) >= 2:  # At least 2 required fields found
                            # Map fields using multiple possible keys
                            scam_likelihood = 'Medium'
                            for key in ['scam_likelihood', 'scamLikelihood', 'likelihood', 'risk']:
                                if key in data:
                                    scam_likelihood = data[key]
                                    break
                                    
                            explanation = 'Analysis completed.'
                            for key in ['explanation', 'analysis', 'summary', 'details']:
                                if key in data and isinstance(data[key], str) and len(data[key]) > 20:
                                    explanation = data[key]
                                    break
                                    
                            clauses = []
                            for key in ['concerning_clauses', 'clauses', 'clauseAnalysis', 'problematicClauses']:
                                if key in data and isinstance(data[key], list):
                                    clauses = data[key]
                                    break
                                    
                            questions = []
                            for key in ['suggested_questions', 'questions', 'questionsToAsk']:
                                if key in data and isinstance(data[key], list):
                                    questions = data[key]
                                    break
                                    
                            action_items = []
                            for key in ['action_items', 'actionItems', 'recommendations', 'actions']:
                                if key in data and isinstance(data[key], list):
                                    action_items = data[key]
                                    break
                                    
                            result = {
                                "scam_likelihood": scam_likelihood,
                                "explanation": explanation,
                                "clauses": clauses,
                                "questions": questions,
                                "action_items": action_items
                            }
                            print(f"Extracted embedded JSON with {len(clauses)} clauses and {len(questions)} questions")
                            return result
                except (json.JSONDecodeError, AttributeError, KeyError) as e:
                    continue  # Try the next potential JSON block
                
            # If all JSON extraction attempts failed, look for structured markup
            # Example: Scam Likelihood: Medium, Explanation: This appears...
            structured_data = {}
            
            # Look for scam likelihood
            likelihood_match = re.search(r'[Ss]cam [Ll]ikelihood:?\s*(Low|Medium|High)', response_text)
            if likelihood_match:
                structured_data["scam_likelihood"] = likelihood_match.group(1)
            
            # Look for explanation section
            explanation_match = re.search(r'[Ee]xplanation:?\s*(.+?)(?=\n\n|\n#|\n\*\*)', response_text, re.DOTALL)
            if explanation_match:
                structured_data["explanation"] = explanation_match.group(1).strip()
                
            # Look for clause sections
            clauses_section_match = re.search(r'[Cc]oncerning [Cc]lauses:?\s*(.+?)(?=\n\n\s*[A-Z]|\n#|\n\*\*|$)', response_text, re.DOTALL)
            if clauses_section_match:
                clause_section = clauses_section_match.group(1)
                clause_items = re.findall(r'\n\s*[-*•]\s*(.+?)(?=\n\s*[-*•]|\n\n|\n#|\n\*\*|$)', clause_section, re.DOTALL)
                if clause_items:
                    structured_data["clauses"] = clause_items
                
            # Look for questions section
            questions_section_match = re.search(r'[Ss]uggested [Qq]uestions:?\s*(.+?)(?=\n\n\s*[A-Z]|\n#|\n\*\*|$)', response_text, re.DOTALL)
            if questions_section_match:
                question_section = questions_section_match.group(1)
                question_items = re.findall(r'\n\s*[-*•]\s*(.+?)(?=\n\s*[-*•]|\n\n|\n#|\n\*\*|$)', question_section, re.DOTALL)
                if question_items:
                    structured_data["questions"] = question_items
            
            # If we found at least some structured data, return it
            if structured_data.get("scam_likelihood") or structured_data.get("explanation"):
                print(f"Extracted data using structured markup")
                return structured_data
                
        except Exception as e:
            print(f"Error extracting JSON from response: {e}")
            
        return None

    @staticmethod
    def _parse_gemini_response(response_text: str) -> tuple:
        """
        Parse the Gemini API response into structured data.
        Returns a tuple of (scam_likelihood, explanation, clauses, questions, action_items)
        """
        # Default values in case parsing fails
        scam_likelihood = ScamLikelihood.MEDIUM
        explanation = "Analysis completed."
        clauses = []
        questions = []
        action_items = []
        
        try:
            print("Starting regex parsing of Gemini response")
            
            # Look for a clear scam likelihood indicator - try multiple formats
            likelihood_patterns = [
                r"[Ss]cam [Ll]ikelihood[:\s]*(Low|Medium|High)",
                r"[Ss]cam [Pp]otential[:\s]*(Low|Medium|High)",
                r"[Ll]ikelihood[:\s]*(Low|Medium|High)",
                r"[Rr]isk [Ll]evel[:\s]*(Low|Medium|High)",
                r"(Low|Medium|High) [Rr]isk",
                r"[Rr]ating[:\s]*(Low|Medium|High)"
            ]
            
            for pattern in likelihood_patterns:
                likelihood_match = re.search(pattern, response_text)
                if likelihood_match:
                    likelihood_text = likelihood_match.group(1).capitalize()
                    if likelihood_text == "Low":
                        scam_likelihood = ScamLikelihood.LOW
                    elif likelihood_text == "Medium":
                        scam_likelihood = ScamLikelihood.MEDIUM
                    elif likelihood_text == "High":
                        scam_likelihood = ScamLikelihood.HIGH
                    print(f"Extracted scam likelihood: {likelihood_text}")
                    break
            
            # Try to extract explanation section
            explanation_patterns = [
                # Search for specific section headers
                r"(?:Explanation|Analysis|Summary|Assessment)[:\s]*(.+?)(?=(?:\n\n.*?:|#|Concerning|Clause|Suggested|$))",
                # Look for first paragraph that's substantial
                r"(?<=\n\n)([^#\n].{100,}?)(?=\n\n)",
                # First substantial text block
                r"^([^#\n].{100,}?)(?=\n\n)"
            ]
            
            for pattern in explanation_patterns:
                explanation_match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
                if explanation_match:
                    explanation_text = explanation_match.group(1).strip()
                    if len(explanation_text) > 50:
                        explanation = explanation_text
                        print(f"Extracted explanation ({len(explanation)} chars)")
                        break
            
            # Extract sections based on common headers
            sections = {}
            section_patterns = [
                (r"(?:Concerning|Problematic) [Cc]lauses[:\s]*(.+?)(?=(?:\n\n.*?:|#|Suggested|Recommended|Action|$))", "clauses"),
                (r"[Cc]lause [Aa]nalysis[:\s]*(.+?)(?=(?:\n\n.*?:|#|Suggested|Recommended|Action|$))", "clauses"),
                (r"[Ss]uggested [Qq]uestions[:\s]*(.+?)(?=(?:\n\n.*?:|#|Action|Recommend|$))", "questions"),
                (r"[Rr]ecommended [Qq]uestions[:\s]*(.+?)(?=(?:\n\n.*?:|#|Action|$))", "questions"),
                (r"[Qq]uestions [Tt]o [Aa]sk[:\s]*(.+?)(?=(?:\n\n.*?:|#|Action|$))", "questions"),
                (r"[Aa]ction [Ii]tems[:\s]*(.+?)(?=(?:\n\n.*?:|#|$))", "actions"),
                (r"[Rr]ecommendations[:\s]*(.+?)(?=(?:\n\n.*?:|#|$))", "actions")
            ]
            
            for pattern, section_name in section_patterns:
                section_match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
                if section_match:
                    section_content = section_match.group(1).strip()
                    if section_content:
                        sections[section_name] = section_content
                        print(f"Found {section_name} section ({len(section_content)} chars)")
            
            # Parse clauses from extracted section
            if "clauses" in sections:
                clauses_section = sections["clauses"]
                
                # Try multiple patterns to extract clauses
                # Pattern 1: Numbered or bulleted list items with substantial content
                clause_items = re.findall(r"(?:^|\n)(?:\d+\.|\*|\-|\•)\s*([^\n]{20,})", clauses_section)
                
                # If that didn't work, look for indented paragraphs or blocks
                if not clause_items:
                    clause_items = re.findall(r"(?:^|\n)([^\n]{20,})(?:\n\s{2,}[^\n]+)*", clauses_section)
                
                # If still nothing, split by double newlines
                if not clause_items:
                    clause_items = [c.strip() for c in clauses_section.split("\n\n") if len(c.strip()) > 20]
                
                # Process extracted clause items
                for i, clause_text in enumerate(clause_items):
                    # Check if we can split into original clause and explanation
                    clause_parts = clause_text.split(":", 1)
                    
                    if len(clause_parts) > 1 and len(clause_parts[0]) > 10 and len(clause_parts[1]) > 10:
                        original = clause_parts[0].strip().replace('\\n', '\n').replace('\\"', '"')
                        simplified = clause_parts[1].strip().replace('\\n', '\n').replace('\\"', '"')
                    else:
                        original = clause_text.strip().replace('\\n', '\n').replace('\\"', '"')
                        simplified = f"Potential issue in clause {i+1}"
                    
                    # Check if the clause text indicates a concerning issue
                    is_concerning = any(keyword in clause_text.lower() for keyword in 
                                      ["concern", "problem", "risk", "caution", "warning", "red flag", 
                                       "issue", "unfair", "suspicious", "unusual", "questionable"])
                    
                    clauses.append(ClauseAnalysis(
                        text=original,
                        simplified_text=simplified,
                        is_concerning=is_concerning,
                        reason=f"Identified in clause analysis"
                    ))
                
                print(f"Extracted {len(clauses)} clauses")
            
            # Parse questions from extracted section
            if "questions" in sections:
                questions_section = sections["questions"]
                
                # Try to extract numbered or bulleted questions
                question_items = re.findall(r"(?:^|\n)(?:\d+\.|\*|\-|\•)\s*([^\n]{10,}\?)", questions_section)
                
                # If that didn't work, look for any line ending in question mark
                if not question_items:
                    question_items = re.findall(r"([^\n]{10,}\?)", questions_section)
                
                # If still nothing, split by newlines and add question marks
                if not question_items:
                    for line in [l.strip() for l in questions_section.split("\n") if len(l.strip()) > 15]:
                        if not line.endswith('?'):
                            line += '?'
                        question_items.append(line)
                
                # Process and clean up questions
                for question in question_items:
                    clean_q = question.strip()
                    if not clean_q.endswith('?'):
                        clean_q += '?'
                    # Clean escaped characters
                    clean_q = clean_q.replace('\\n', '\n').replace('\\"', '"').replace('\\\'', '\'')
                    if clean_q not in questions:
                        questions.append(clean_q)
                
                print(f"Extracted {len(questions)} questions")
            
            # Parse action items from extracted section
            if "actions" in sections:
                actions_section = sections["actions"]
                
                # Try to extract numbered or bulleted items
                action_items = re.findall(r"(?:^|\n)(?:\d+\.|\*|\-|\•)\s*([^\n]{10,})", actions_section)
                
                # If that didn't work, split by newlines for substantial lines
                if not action_items:
                    action_items = [a.strip() for a in actions_section.split("\n") if len(a.strip()) > 15]
                
                # Clean up action items
                action_items = [a.replace('\\n', '\n').replace('\\"', '"').replace('\\\'', '\'') for a in action_items]
                
                print(f"Extracted {len(action_items)} action items")
            
            # If no clauses were found but we have a likelihood and explanation, check if the explanation 
            # suggests why there are no concerning clauses
            if not clauses and explanation:
                # Check if explanation indicates a standard lease without concerns
                if (re.search(r"(standard|typical|normal|common|no concern|no issue|no red flag)", explanation, re.IGNORECASE) and
                    not re.search(r"(suspicious|fraud|scam|concerning|problematic|issue)", explanation, re.IGNORECASE)):
                    clauses.append(ClauseAnalysis(
                        text="Standard lease terms",
                        simplified_text="This lease appears to contain standard terms without significant concerns.",
                        is_concerning=False,
                        reason="The analysis indicates this is a standard lease agreement without concerning clauses."
                    ))
                    print("Added default clause for standard lease")
                # Check if explanation indicates a scam/suspicious document
                elif re.search(r"(suspicious|fraud|scam|concerning|problematic|issue|red flag)", explanation, re.IGNORECASE):
                    clauses.append(ClauseAnalysis(
                        text="Suspicious document",
                        simplified_text="This document contains suspicious elements that raise concerns.",
                        is_concerning=True,
                        reason="The analysis indicates potential issues with this document."
                    ))
                    print("Added default clause for suspicious document")
            
            # If we still have no clauses, provide a generic placeholder
            if not clauses:
                clauses.append(ClauseAnalysis(
                    text="No specific clauses identified",
                    simplified_text="The system couldn't identify specific clauses to analyze.",
                    is_concerning=False,
                    reason="Unable to extract specific clauses from the document."
                ))
                print("Added fallback placeholder clause")
            
            # If we have no questions, provide some generic ones based on scam likelihood
            if not questions:
                if scam_likelihood == ScamLikelihood.HIGH:
                    questions = [
                        "Can we meet in person to view the property before signing any agreement?",
                        "Can you provide proof of ownership or property management authorization?",
                        "Why is the security deposit or rent different from market rates?",
                        "Can I speak with current or previous tenants about their experience?",
                        "Will you require any payments before I can view the property in person?"
                    ]
                else:
                    questions = [
                        "Is a security deposit required? If so, how much?",
                        "When is rent due each month and what are the late payment penalties?",
                        "Are utilities included in the rent? If not, which ones am I responsible for?",
                        "What is the policy on early lease termination?",
                        "Are pets allowed? If so, are there additional fees or deposits?"
                    ]
                print(f"Added {len(questions)} default questions")
            
            # If we have no action items, provide defaults based on scam likelihood
            if not action_items:
                if scam_likelihood == ScamLikelihood.HIGH:
                    action_items = [
                        "Exercise extreme caution with this rental",
                        "Verify the legitimacy of the landlord through property records",
                        "Never send money before viewing the property in person",
                        "Consider reporting this listing if it shows signs of fraud"
                    ]
                elif scam_likelihood == ScamLikelihood.MEDIUM:
                    action_items = [
                        "Proceed with caution",
                        "Verify the property ownership",
                        "Request clarification on any concerning terms",
                        "Compare rental terms with similar properties in the area"
                    ]
                else:  # LOW
                    action_items = [
                        "Proceed with standard rental precautions",
                        "Schedule a property viewing",
                        "Review the lease agreement thoroughly before signing",
                        "Prepare questions about any unclear terms"
                    ]
                print(f"Added {len(action_items)} default action items")
            
            return scam_likelihood, explanation, clauses, questions, action_items
            
        except Exception as e:
            print(f"Error in regex parsing: {str(e)}")
            # Return defaults if parsing fails
            return scam_likelihood, explanation, clauses, questions, action_items

    @staticmethod
    async def save_analysis(result: AnalysisResult) -> str:
        """Save analysis result to MongoDB."""
        analyses = await get_analyses_collection()
        result_dict = result.dict()
        await analyses.insert_one(result_dict)
        return result.id

    @staticmethod
    async def get_analysis_by_id(analysis_id: str) -> AnalysisResult:
        """Retrieve an analysis by ID."""
        analyses = await get_analyses_collection()
        result = await analyses.find_one({"id": analysis_id})
        if result is None:
            return None
        return AnalysisResult(**result)

    @staticmethod
    async def _get_random_lease_document() -> str:
        """
        Get a random lease document from the database.
        For demo, this returns a fake lease document.
        In production, this would query MongoDB.
        """
        sample_leases = [
            """RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement ("Agreement") is made and entered into this ___ day of ________, 20__, by and between _____________ ("Landlord") and _____________ ("Tenant").

1. PROPERTY: Landlord leases to Tenant the residential property located at: _________________________________ ("Property").

2. TERM: This Agreement shall commence on _________, 20__ and continue until _________, 20__ ("Lease Term").

3. RENT: Tenant agrees to pay Landlord the sum of $________ per month as rent, due on the 1st day of each month.

4. SECURITY DEPOSIT: Tenant shall pay a security deposit of $________ upon execution of this Agreement.

5. UTILITIES: Tenant shall be responsible for payment of all utilities and services, except: ________________.

6. OCCUPANCY: The Property shall be occupied only by Tenant and the following persons: _________________.

7. MAINTENANCE: Tenant shall maintain the Property in good, clean condition and shall not make alterations without Landlord's written consent.

8. ENTRY: Landlord may enter the Property at reasonable times with 24 hours' notice to inspect, make repairs, or show to prospective tenants.

9. PETS: No pets shall be kept on the Property without Landlord's written consent.

10. TERMINATION: If Tenant fails to comply with any terms of this Agreement, Landlord may terminate this Agreement.

11. ATTORNEY'S FEES: In any action to enforce this Agreement, the prevailing party shall be entitled to reasonable attorney's fees.

12. ADDITIONAL TERMS: _________________________________________________

________________________________
Tenant                 Date

________________________________
Landlord              Date""",

            """LEASE AGREEMENT

THIS LEASE is made on [DATE] between [LANDLORD NAME] (hereinafter "Landlord") and [TENANT NAME] (hereinafter "Tenant").

1. PREMISES: Landlord hereby leases to Tenant the premises located at [ADDRESS] ("the Premises").

2. TERM: The term of this lease shall be for [LENGTH], beginning on [START DATE] and ending on [END DATE].

3. RENT: Tenant agrees to pay $[AMOUNT] per month, payable in advance on the first day of each month.

4. LATE CHARGES: If rent is not paid by the 5th day of the month, Tenant shall pay a late fee of $50 plus $10 per day until paid in full.

5. SECURITY DEPOSIT: Upon execution of this lease, Tenant shall deposit with Landlord the sum of $[AMOUNT] as security for the performance of Tenant's obligations under this lease.

6. UTILITIES: Tenant shall pay for all utilities and services except for: [LIST EXCEPTIONS IF ANY].

7. OCCUPANTS: The Premises shall be occupied solely by Tenant and [NAMES OF ADDITIONAL OCCUPANTS, IF ANY].

8. PETS: No pets shall be kept on the Premises without prior written consent of the Landlord.

9. REPAIRS AND MAINTENANCE: Tenant acknowledges that the Premises are in good order and repair. Tenant shall be responsible for all repairs required due to Tenant's negligence.

10. RIGHT OF ENTRY: Landlord may enter the Premises at reasonable hours to inspect, make repairs, or show the Premises to prospective tenants or buyers.

11. ASSIGNMENT AND SUBLETTING: Tenant shall not assign this lease or sublet any portion of the Premises without prior written consent of the Landlord.

12. TENANT'S HOLD OVER: If Tenant remains in possession after expiration of the term, Tenant shall become a tenant at sufferance and shall pay double rent.

13. ATTORNEY'S FEES: In case of any legal action to enforce this Agreement, the prevailing party shall be entitled to attorney's fees.

Tenant: ________________________ Date: ________

Landlord: ______________________ Date: ________"""
        ]
        
        return random.choice(sample_leases)

    @staticmethod
    async def _search_property_listings(address: str) -> Optional[str]:
        """
        Perform a search for property listings based on the address.
        This would use Google Search API in production, but for this demo
        it returns a mock listing URL.
        """
        print(f"Searching for property listings with address: {address}")
        # In a real implementation, this would call Google Search API
        # For demo, return a fake listing URL
        mock_listings = [
            f"https://www.zillow.com/homes/for_rent/{address.replace(' ', '-')}",
            f"https://www.apartments.com/search/{address.replace(' ', '-')}",
            f"https://www.craigslist.org/search/apa?query={address.replace(' ', '+')}"
        ]
        return random.choice(mock_listings)

    @classmethod
    def _process_gemini_response(cls, raw_response: str) -> Dict[str, Any]:
        """Process the raw response from Gemini and extract structured data."""
        # Always store the raw response for debugging
        result = {
            "raw_response": raw_response
        }
        
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
                
                # Calculate trustworthiness score and grade based on scam likelihood and number of concerning clauses
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
                    "clauses": concerning_clauses,
                    "questions": parsed_data.get('suggested_questions', []),
                    "action_items": parsed_data.get('action_items', []),
                    "trustworthiness_score": trustworthiness_score,
                    "trustworthiness_grade": trustworthiness_grade,
                    "risk_level": risk_level
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
                "trustworthiness_grade": trustworthiness_grade,
                "risk_level": risk_level
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
                "trustworthiness_grade": "C",
                "risk_level": "Medium Risk"
            }
            
    @staticmethod
    def _calculate_trustworthiness(scam_likelihood: str, concerning_clauses_count: int) -> tuple:
        """Calculate trustworthiness score, grade, and risk level based on analysis."""
        # Base score based on scam likelihood - MORE GENEROUS STARTING POINTS
        base_score = {
            "LOW": 90,    # Increased from 85
            "MEDIUM": 70, # Increased from 60
            "HIGH": 40    # Increased from 30
        }.get(scam_likelihood, 60)  # Default is more generous too (was 50)
        
        # Adjust score based on concerning clauses - LESS SEVERE PENALTIES
        if concerning_clauses_count == 0:
            adjustment = 10  # Bonus for no concerning clauses
        elif concerning_clauses_count == 1:
            adjustment = 0   # Single concern is normal, no penalty
        elif concerning_clauses_count <= 3:
            adjustment = -5  # Minor concerns
        elif concerning_clauses_count <= 6:
            adjustment = -10 # Moderate concerns (was -15)
        else:
            adjustment = -20 # Serious concerns (was -25)
            
        # Calculate final score (keeping within 0-100 range)
        score = max(0, min(100, base_score + adjustment))
        
        # Determine grade based on score - MORE RELAXED GRADING
        if score >= 85:      # Was 90
            grade = TrustworthinessGrade.A
        elif score >= 75:    # Was 80
            grade = TrustworthinessGrade.B
        elif score >= 55:    # Was 60
            grade = TrustworthinessGrade.C
        elif score >= 35:    # Was 40
            grade = TrustworthinessGrade.D
        else:
            grade = TrustworthinessGrade.F
            
        # Determine risk level - MORE RELAXED RISK ASSESSMENT
        if score >= 75:      # Was 80
            risk_level = RiskLevel.LOW_RISK
        elif score >= 55:    # Was 60
            risk_level = RiskLevel.MEDIUM_RISK
        elif score >= 25:    # Was 30
            risk_level = RiskLevel.HIGH_RISK
        else:
            risk_level = RiskLevel.VERY_HIGH_RISK
            
        return score, grade, risk_level
