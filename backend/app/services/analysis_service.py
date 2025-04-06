from app.models.rental import RentalAnalysisRequest, AnalysisResult, ClauseAnalysis, ScamLikelihood, RiskLevel, TrustworthinessGrade
from app.utils.db import get_analyses_collection, Database
from app.utils.gemini_service import GeminiService
from app.utils.jina_service import JinaService
from app.utils.llm_utils import format_analysis_response
from datetime import datetime
import uuid
import re
import json
import logging
import asyncio
from typing import Dict, Any, Optional, List

logger = logging.getLogger("rent-spiracy.analysis")

class AnalysisService:
    """Service for handling rental analysis."""

    @staticmethod
    async def analyze_rental(request: RentalAnalysisRequest) -> AnalysisResult:
        """
        Analyze a rental based on the provided information.
        Flow:
        1. If document_content provided: Analyze the document directly
        2. If listing_url provided: Use Jina to extract and analyze content
        3. If property_address provided: Search for listing, use Jina to extract and analyze
        """
        analysis_id = str(uuid.uuid4())
        logger.info(f"Starting analysis with ID: {analysis_id}")
        
        document_content = request.document_content
        property_info = {}
        
        try:
            # If URL is provided, extract content using Jina
            if request.listing_url:
                logger.info(f"User provided listing URL: {request.listing_url}")
                
                # Extract content using Jina's reader API
                jina_content = await JinaService.extract_content(request.listing_url)
                if jina_content:
                    # Format the content for analysis
                    document_content = (
                        f"Title: {jina_content.get('title', '')}\n"
                        f"Price: {jina_content.get('price', 'None')}\n"
                        f"Location: {jina_content.get('address', 'None')}\n"
                        f"Description: {jina_content.get('text', '')}"
                    )
                    logger.info(f"Successfully extracted content using Jina: {len(document_content)} chars")
                    
                    # Add a delay before making the Gemini API call
                    await asyncio.sleep(2)  # 2-second delay between API calls
                else:
                    logger.error("Failed to extract content from URL")
                    return AnalysisResult(
                        id=analysis_id,
                        scam_likelihood="High",
                        explanation="Unable to extract content from the provided URL. This could indicate a potential scam or technical issues.",
                        simplified_clauses=[],
                        suggested_questions=[
                            "Why is the content not accessible?",
                            "Can you verify this is a legitimate listing?",
                            "Can you provide an alternative way to view the property details?"
                        ],
                        action_items=[
                            "Verify the listing exists and is accessible",
                            "Request direct contact with the property manager",
                            "Ask for alternative listing links or documentation"
                        ],
                        created_at=datetime.now()
                    )
            
            if not document_content:
                raise ValueError("No content provided for analysis")
                
            # Get analysis from Gemini
            try:
                gemini_response = await GeminiService.analyze_rental_document(
                    document_content=document_content,
                    listing_url=request.listing_url or property_info.get("found_listing"),
                    property_address=request.property_address
                )
                logger.info("Received response from Gemini")
            except Exception as gemini_error:
                logger.error(f"Gemini API error: {str(gemini_error)}")
                # For any Gemini errors, provide basic analysis
                gemini_response = {
                    "raw_response": f"Error from Gemini API: {str(gemini_error)}",
                    "scam_likelihood": "Medium",
                    "explanation": (
                        "The AI analysis service encountered an error. "
                        "Here's what we found from the listing:\n\n"
                    ) + document_content[:500] + "...",
                    "concerning_clauses": [],
                    "questions": [
                        "Can you verify the property ownership?",
                        "Can you view the property in person?",
                        "Are there any fees required before viewing?",
                        "What is included in the rent?",
                        "What is the lease term?"
                    ],
                    "action_items": [
                        "Verify the property exists and is actually for rent",
                        "Never send money without viewing the property",
                        "Research typical rental prices in the area",
                        "Get all agreements in writing",
                        "Trust your instincts if something seems off"
                    ]
                }
            
            if not gemini_response:
                raise ValueError("No response received from AI services")
            
            raw_response = gemini_response.get("raw_response", "")
            logger.info(f"Processing Gemini response: {len(raw_response)} chars")
            
            # Format the response
            response = format_analysis_response(gemini_response)
            
            # Create the analysis result
            analysis_result = AnalysisResult(
                id=analysis_id,
                scam_likelihood=response["scam_likelihood"],
                trustworthiness_score=response["trustworthiness_score"],
                trustworthiness_grade=response["trustworthiness_grade"],
                risk_level=response["risk_level"],
                explanation=response["explanation"],
                simplified_clauses=response["simplified_clauses"],
                suggested_questions=response["suggested_questions"],
                action_items=response["action_items"],
                created_at=datetime.now(),
                raw_response=raw_response
            )
            
            # Store in database
            try:
                analyses = await get_analyses_collection()
                result_dict = analysis_result.dict()
                result_dict["scam_likelihood"] = response["scam_likelihood"]
                result_dict["risk_level"] = response["risk_level"]
                result_dict["trustworthiness_grade"] = response["trustworthiness_grade"]
                result_dict["created_at"] = result_dict["created_at"].isoformat()
                
                logger.info(f"Storing analysis result with ID: {analysis_id}")
                await analyses.insert_one(result_dict)
            except Exception as e:
                logger.error(f"Error storing analysis in database: {str(e)}")
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in analyze_rental: {str(e)}")
            logger.exception(e)
            raise

    @staticmethod
    def _calculate_trustworthiness(scam_likelihood: str, concerning_clauses_count: int) -> tuple:
        """Calculate trustworthiness score, grade, and risk level based on analysis."""
        # Base score based on scam likelihood
        base_score = {
            "LOW": 85,
            "MEDIUM": 60,
            "HIGH": 30
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
                    logger.info(f"Successfully parsed JSON code block with {len(json_str)} chars")
                    
                    # Validate that at least one key field is present
                    if any(k in data for k in ['scam_likelihood', 'explanation', 'concerning_clauses', 'clauses']):
                        result = {
                            "scam_likelihood": data.get('scam_likelihood', 'Medium'),
                            "explanation": data.get('explanation', 'Analysis completed.'),
                            "clauses": data.get('concerning_clauses', data.get('clauses', [])),
                            "questions": data.get('suggested_questions', data.get('questions', [])),
                            "action_items": data.get('action_items', [])
                        }
                        logger.info(f"Extracted data with {len(result.get('clauses', []))} clauses and {len(result.get('questions', []))} questions")
                        return result
                except json.JSONDecodeError as e:
                    logger.error(f"Found JSON block but failed to parse it: {e}")
            
            # Try to find JSON blocks without language specifier
            json_match = re.search(r'```\s*({\s*".*?})\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                try:
                    data = json.loads(json_str)
                    logger.info(f"Successfully parsed unmarked JSON code block with {len(json_str)} chars")
                    
                    # Validate that at least one key field is present
                    if any(k in data for k in ['scam_likelihood', 'explanation', 'concerning_clauses', 'clauses']):
                        result = {
                            "scam_likelihood": data.get('scam_likelihood', 'Medium'),
                            "explanation": data.get('explanation', 'Analysis completed.'),
                            "clauses": data.get('concerning_clauses', data.get('clauses', [])),
                            "questions": data.get('suggested_questions', data.get('questions', [])),
                            "action_items": data.get('action_items', [])
                        }
                        logger.info(f"Extracted data with {len(result.get('clauses', []))} clauses and {len(result.get('questions', []))} questions")
                        return result
                except json.JSONDecodeError:
                    logger.error("Found unmarked JSON block but failed to parse it")
            
            # Look for JSON objects with more flexible pattern
            potential_json_blocks = re.findall(r'({[\s\S]*?})', response_text)
            for json_str in potential_json_blocks:
                try:
                    if len(json_str) > 50:  # Only try to parse substantial JSON blocks
                        data = json.loads(json_str)
                        logger.info(f"Found embedded JSON, attempting to extract from {len(json_str)} chars")
                        
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
                            logger.info(f"Extracted embedded JSON with {len(clauses)} clauses and {len(questions)} questions")
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
                logger.info(f"Extracted data using structured markup")
                return structured_data
                
        except Exception as e:
            logger.error(f"Error extracting JSON from response: {e}")
            
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
            logger.info("Starting regex parsing of Gemini response")
            
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
                    logger.info(f"Extracted scam likelihood: {likelihood_text}")
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
                        logger.info(f"Extracted explanation ({len(explanation)} chars)")
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
                        logger.info(f"Found {section_name} section ({len(section_content)} chars)")
            
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
                
                logger.info(f"Extracted {len(clauses)} clauses")
            
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
                
                logger.info(f"Extracted {len(questions)} questions")
            
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
                
                logger.info(f"Extracted {len(action_items)} action items")
            
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
                    logger.info("Added default clause for standard lease")
                # Check if explanation indicates a scam/suspicious document
                elif re.search(r"(suspicious|fraud|scam|concerning|problematic|issue|red flag)", explanation, re.IGNORECASE):
                    clauses.append(ClauseAnalysis(
                        text="Suspicious document",
                        simplified_text="This document contains suspicious elements that raise concerns.",
                        is_concerning=True,
                        reason="The analysis indicates potential issues with this document."
                    ))
                    logger.info("Added default clause for suspicious document")
            
            # If we still have no clauses, provide a generic placeholder
            if not clauses:
                clauses.append(ClauseAnalysis(
                    text="No specific clauses identified",
                    simplified_text="The system couldn't identify specific clauses to analyze.",
                    is_concerning=False,
                    reason="Unable to extract specific clauses from the document."
                ))
                logger.info("Added fallback placeholder clause")
            
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
                logger.info(f"Added {len(questions)} default questions")
            
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
                logger.info(f"Added {len(action_items)} default action items")
            
            return scam_likelihood, explanation, clauses, questions, action_items
            
        except Exception as e:
            logger.error(f"Error in regex parsing: {str(e)}")
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
        Search for property listings based on address.
        Currently just returns the address as a URL for testing.
        In a real implementation, this would:
        1. Search real estate websites
        2. Return the most relevant listing URL
        """
        # For now, just return a mock URL
        return f"https://example.com/listing/{address.replace(' ', '-')}"

    @staticmethod
    async def _scrape_webpage_content(url: str) -> str:
        """
        Scrape content from a webpage using Jina's reader API.
        
        Args:
            url: The URL to scrape
            
        Returns:
            Extracted text content from the webpage
        """
        try:
            # Extract content using Jina
            content = await JinaService.extract_content(url)
            
            # Combine title and text
            full_content = f"Title: {content['title']}\n\n"
            
            # Add price if available
            if content['metadata']['price']:
                full_content += f"Price: ${content['metadata']['price']}\n\n"
                
            # Add address if available
            if content['metadata']['address']:
                full_content += f"Address: {content['metadata']['address']}\n\n"
                
            # Add main text content
            full_content += f"Description: {content['text']}"
            
            return full_content
            
        except Exception as e:
            logger.error(f"Error scraping webpage: {str(e)}")
            raise Exception(f"Failed to extract content from URL: {str(e)}")

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
        # Base score based on scam likelihood
        base_score = {
            "LOW": 85,
            "MEDIUM": 60,
            "HIGH": 30
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

    @staticmethod
    async def analyze_rental_listing(
        url: str,
        language: str = "english",
        voice_output: bool = False
    ) -> Dict[str, Any]:
        """
        Analyze a rental listing for potential scams and provide insights.
        Uses Jina for content extraction and Gemini for scam analysis.
        
        Args:
            url (str): The URL of the rental listing
            language (str): The language for the analysis (default: "english")
            voice_output (bool): Whether to generate voice output (default: False)
            
        Returns:
            Dict[str, Any]: Analysis results including scam likelihood, explanation, and recommendations
        """
        try:
            # Check if URL is from a site with known captcha issues
            if any(domain in url.lower() for domain in ['zillow.com', 'trulia.com']):
                return {
                    "error": "This website requires human verification. Please try copying and pasting the listing content directly.",
                    "status": "error",
                    "code": "CAPTCHA_DETECTED"
                }
                
            content = await JinaService.extract_content(url)
            if not content:
                return {
                    "error": "Unable to extract content. This could be due to website restrictions or invalid URL.",
                    "status": "error",
                    "code": "EXTRACTION_FAILED"
                }

            # Format the content for Gemini analysis
            formatted_content = f"""
            Title: {content.get('title', 'N/A')}
            Price: {content.get('price', 'N/A')}
            Location: {content.get('address', 'N/A')}
            Description: {content.get('text', 'N/A')}
            """

            # Get scam analysis from Gemini
            analysis = await GeminiService.analyze_rental_document(formatted_content)
            
            # Format the response
            response = format_analysis_response(analysis)
            
            # Add voice output if requested
            if voice_output:
                voice_service = VoiceService()
                voice_url = await voice_service.generate_voice_output(
                    response["explanation"],
                    language
                )
                response["voice_url"] = voice_url
            
            return response

        except Exception as e:
            logger.error(f"Error analyzing rental listing: {str(e)}")
            return {
                "error": "An error occurred while analyzing the listing",
                "scam_likelihood": "Unknown",
                "trustworthiness_score": 0,
                "trustworthiness_grade": "F",
                "risk_level": "Unknown Risk",
                "explanation": f"Error: {str(e)}",
                "concerning_clauses": [],
                "questions": [],
                "action_items": []
            }
