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
        
        # Debug logging to see what language was used in the prompt
        logger.info(f"Using language: {language}")
        logger.info(f"Prompt excerpt (first 500 chars): {prompt[:500]}")
        # Use proper escaping for the string split
        language_instructions = []
        for line in prompt.split('\n'):
            if 'language' in line.lower() or 'LANGUAGE' in line:
                language_instructions.append(line)
        logger.info(f"Prompt excerpt (language instructions): {language_instructions[:5]}")
        
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
                            "reason": clause.get('reason', ''),
                            "california_law": clause.get('california_law', '')
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
                    "risk_level": risk_level.value,
                    "california_tenant_rights": parsed_data.get('california_tenant_rights', {})
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
                "risk_level": risk_level.value,
                "california_tenant_rights": {}
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
                "risk_level": RiskLevel.MEDIUM_RISK.value,
                "california_tenant_rights": {}
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
                
                # Handle problematic escape sequences that cause parse errors
                # Replace escaped backslashes with a temporary marker
                json_str = json_str.replace('\\\\', '__DOUBLE_BACKSLASH__')
                # Replace escaped quotes
                json_str = json_str.replace('\\"', '"')
                # Fix invalid escape sequences
                json_str = re.sub(r'\\(?!["\\/bfnrt])', r'\\\\', json_str)
                # Restore properly escaped backslashes
                json_str = json_str.replace('__DOUBLE_BACKSLASH__', '\\\\')
                
                try:
                    data = json.loads(json_str)
                    return data
                except json.JSONDecodeError as e:
                    logger.warning(f"Found JSON block but failed to parse: {e}")
                    
                    # Try specific fixes for common JSON formatting issues
                    fixed_json = json_str
                    
                    # Fix missing commas between array elements or dict items
                    if "Expecting ',' delimiter" in str(e):
                        fixed_json = re.sub(r'"\s*\n\s*"', '",\n"', fixed_json)
                        fixed_json = re.sub(r'}\s*\n\s*{', '},\n{', fixed_json)
                        fixed_json = re.sub(r'"\s*\n\s*{', '",\n{', fixed_json)
                        fixed_json = re.sub(r'}\s*\n\s*"', '},\n"', fixed_json)
                        fixed_json = re.sub(r']\s*\n\s*\[', '],\n[', fixed_json)
                        fixed_json = re.sub(r'"\s*\n\s*\[', '",\n[', fixed_json)
                        fixed_json = re.sub(r']\s*\n\s*"', '],\n"', fixed_json)
                    
                    # Fix property names not enclosed in quotes
                    if "Expecting property name enclosed in double quotes" in str(e):
                        # Match unquoted property names at the beginning of lines
                        fixed_json = re.sub(r'(?m)^(\s*)([a-zA-Z0-9_]+)(\s*:)', r'\1"\2"\3', fixed_json)
                        # Match unquoted property names inside objects
                        fixed_json = re.sub(r',\s*([a-zA-Z0-9_]+)(\s*:)', r', "\1"\2', fixed_json)
                        # Fix specific case for first property in object
                        fixed_json = re.sub(r'{\s*([a-zA-Z0-9_]+)(\s*:)', r'{ "\1"\2', fixed_json)
                    
                    # Try to parse after fixes
                    try:
                        data = json.loads(fixed_json)
                        logger.info("Successfully fixed JSON formatting")
                        return data
                    except json.JSONDecodeError as e2:
                        logger.warning(f"Failed to fix JSON: {e2}")
                
                # Try a more aggressive approach
                try:
                    # Extract key data using regex
                    scam_likelihood = "Medium"
                    likelihood_match = re.search(r'"scam_likelihood":\s*"([^"]+)"', json_str)
                    if likelihood_match:
                        scam_likelihood = likelihood_match.group(1)
                    
                    explanation = "Analysis completed"
                    explanation_match = re.search(r'"explanation":\s*"(.*?)(?:(?<!\\)",)', json_str, re.DOTALL)
                    if explanation_match:
                        explanation = explanation_match.group(1).replace('\\"', '"')
                    
                    # Extract clauses array using regex
                    clauses = []
                    clauses_section_match = re.search(r'"concerning_clauses"\s*:\s*\[(.*?)\]', json_str, re.DOTALL)
                    if clauses_section_match:
                        clauses_text = clauses_section_match.group(1)
                        
                        # Try to extract individual clause objects
                        clause_objects = re.findall(r'{(.*?)}', clauses_text, re.DOTALL)
                        for clause_obj in clause_objects:
                            original_match = re.search(r'"original_text"\s*:\s*"(.*?)(?:(?<!\\)",)', clause_obj, re.DOTALL)
                            simplified_match = re.search(r'"simplified_text"\s*:\s*"(.*?)(?:(?<!\\)",)', clause_obj, re.DOTALL)
                            
                            if original_match and simplified_match:
                                clauses.append({
                                    "original_text": original_match.group(1).replace('\\"', '"'),
                                    "simplified_text": simplified_match.group(1).replace('\\"', '"'),
                                    "is_concerning": True,
                                    "reason": "Extracted from analysis",
                                    "california_law": ""
                                })
                    
                    # Extract questions array
                    questions = []
                    questions_match = re.search(r'"suggested_questions"\s*:\s*\[(.*?)\]', json_str, re.DOTALL)
                    if questions_match:
                        questions_text = questions_match.group(1)
                        question_items = re.findall(r'"(.*?)(?:(?<!\\)",?)', questions_text)
                        questions = [q.replace('\\"', '"') for q in question_items if len(q) > 5]
                    
                    # Extract action items
                    actions = []
                    actions_match = re.search(r'"action_items"\s*:\s*\[(.*?)\]', json_str, re.DOTALL)
                    if actions_match:
                        actions_text = actions_match.group(1)
                        action_items = re.findall(r'"(.*?)(?:(?<!\\)",?)', actions_text)
                        actions = [a.replace('\\"', '"') for a in action_items if len(a) > 5]
                    
                    # Construct response
                    return {
                        "scam_likelihood": scam_likelihood,
                        "explanation": explanation,
                        "concerning_clauses": clauses,
                        "suggested_questions": questions,
                        "action_items": actions,
                        "california_tenant_rights": {}
                    }
                except Exception as regex_error:
                    logger.warning(f"Error in regex-based extraction: {regex_error}")
            
            # No valid JSON found in code blocks, try to find raw JSON
            raw_json_match = re.search(r'({[\s\S]*?"scam_likelihood"[\s\S]*?})', response_text)
            if raw_json_match:
                try:
                    data = json.loads(raw_json_match.group(1))
                    logger.info("Found and parsed raw JSON")
                    return data
                except json.JSONDecodeError:
                    logger.warning("Found raw JSON but failed to parse it")
            
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
                        "reason": "Identified as concerning in analysis",
                        "california_law": ""
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
                            "reason": "Identified as concerning in analysis",
                            "california_law": ""
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
                        "reason": "Identified as a red flag in analysis",
                        "california_law": ""
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
        """Extract action items from the response text."""
        action_items = []
        
        # Try to find a section with action items
        section_patterns = [
            r'(?:action\s+items|recommended\s+actions|suggestions|recommendations)\s*:?\s*(.+?)(?=\n\n\s*[A-Z#]|\n#|\n\*\*|$)',
            r'(?:what\s+to\s+do|next\s+steps)\s*:?\s*(.+?)(?=\n\n\s*[A-Z#]|\n#|\n\*\*|$)'
        ]
        
        section_text = ""
        for pattern in section_patterns:
            match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
            if match:
                section_text = match.group(1).strip()
                break
        
        if section_text:
            # Try to extract numbered or bulleted items
            items = re.findall(r'(?:\d+\.|\*|\-|\•)\s+(.+?)(?=\n\s*(?:\d+\.|\*|\-|\•)|\n\n|\n#|\n\*\*|$)', 
                              section_text, re.DOTALL)
            
            if items:
                for item in items:
                    cleaned_item = item.strip()
                    # Only add if it's a substantive item (not too short)
                    if len(cleaned_item) > 10:
                        action_items.append(cleaned_item)
        
        # If no action items found in a dedicated section, try to find them in the JSON
        if not action_items:
            # Look for an array of action items in the text
            items_match = re.search(r'"action_items"\s*:\s*\[\s*(.*?)\s*\]', response_text, re.DOTALL)
            if items_match:
                items_text = items_match.group(1)
                # Extract quoted strings from the array
                quoted_items = re.findall(r'"([^"]+)"', items_text)
                action_items.extend([item.strip() for item in quoted_items if len(item.strip()) > 10])
        
        return action_items
    
    @staticmethod
    def _generate_rental_analysis_prompt(
        document_content: str,
        listing_url: Optional[str] = None,
        property_address: Optional[str] = None,
        language: Optional[str] = "english"
    ) -> str:
        """Generate the prompt for Gemini API."""
        # Force language to be a string value, not an Enum object
        if hasattr(language, 'value'):
            language = language.value
        
        # Make sure we have a default language value
        if not language:
            language = "english"
            
        # Log what language we're using
        print(f"Generating prompt with language: {language}")
        
        prompt_parts = [
            f"You are an experienced legal expert specializing in rental agreements and lease documents with deep knowledge of California landlord-tenant law. Your task is to analyze the provided lease document in EXTREME DETAIL to identify potential scams, concerning clauses, tenant rights issues, and any other problematic elements. Your entire analysis MUST be written in {language.upper()}. Do NOT provide any analysis in English unless {language.upper()} is English.",
            
            f"First, determine if this is actually a lease agreement. Be VERY CAREFUL with this determination - only classify as 'not a lease' if the document is clearly something else like a tax form, bank statement, or random text. A basic or template lease should still be identified as a lease agreement, even if it's incomplete. If it has sections about rent, security deposit, tenant obligations, etc., it is likely a lease. If it's not a lease agreement, explicitly state this is NOT a lease agreement, explain what it appears to be, and why this indicates a potential scam. This explanation MUST be in {language.upper()}.",
            
            f"\n\nYour detailed analysis should include (ALL IN {language.upper()}):"
            f"\n1. A determination of scam likelihood (Low, Medium, or High) with thorough explanation"
            f"\n2. A comprehensive assessment of the lease as a whole - provide DETAILED analysis of at least 300 words"
            f"\n3. A detailed breakdown of EACH concerning clause with:"
            f"\n   - The exact text from the lease"
            f"\n   - A simplified explanation in plain language"
            f"\n   - Why this clause is concerning or problematic"
            f"\n   - Whether it might be illegal or unenforceable under California law"
            f"\n   - SPECIFIC California legal code references (e.g., Civil Code Section 1950.5 for security deposits, etc.)"
            f"\n   - Direct quotes from relevant California statutes when applicable"
            f"\n   - Specific recommendations for the tenant regarding this clause"
            f"\n4. Identification of standard/expected lease terms that are normal and fair to tenants:"
            f"\n   - Normal clauses that are typical in residential leases"
            f"\n   - Clauses that may initially seem concerning but are actually standard legal practice"
            f"\n   - An explanation of why these terms are considered normal, fair, or legally required"
            f"\n5. At least 6-8 specific questions the tenant should ask before signing, with explanations of why each question is important"
            f"\n6. Actionable recommendations - specific actions the tenant should take based on your analysis"
            f"\n7. A special section on California tenant rights that includes:"
            f"\n   - Relevant California Civil Code sections that apply to this lease"
            f"\n   - Local ordinances that might affect tenant rights (e.g., rent control in SF, LA, etc.)"
            f"\n   - Citations to specific case law where relevant"
            f"\n   - The exact text of the most important California statutes related to identified issues"


            f"\nIMPORTANT: EVERY SINGLE WORD of your analysis MUST be written in {language.upper()}. DO NOT use English at all unless {language.upper()} is English."
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
        
        # Add tenant law references to consider
        tenant_laws = f"""
\n\nImportant instructions for legal analysis:

1. First, identify any locations (city, county, state) mentioned in the lease document or provided property address.

2. Provide legal analysis based on the specific location mentioned in the lease. If no location is mentioned or if the location isn't clear, default to using California law as a reference.

3. For each problematic clause you identify, cite the specific:
   - State laws that apply (with specific code sections)
   - Local ordinances that might be relevant 
   - Case law that affects interpretation

4. When analyzing the lease, consider these key areas of tenant law (as they apply to the specific location):
   - Security deposit limitations and return requirements
   - Habitability and repair responsibilities
   - Privacy rights and landlord entry
   - Rent control and eviction protections
   - Discrimination protections
   - Lease termination requirements
   - Fee and late payment regulations
   - Tenant repair rights
   - Retaliation protections
   - Required disclosures
   - Utility responsibilities

5. Whenever possible, cite the specific legal code sections that apply to the location mentioned in the lease document, and include direct quotes from relevant statutes.

IMPORTANT: If the lease mentions a specific location (city/state), provide legal analysis tailored to that jurisdiction. If multiple locations are mentioned, focus on the property location. If no location is specified, use California law as a reference framework.
"""
        prompt_parts.append(tenant_laws)
        
        # Request structured JSON output
        json_format_instructions = f"""
\n\nPlease return your analysis in the following JSON format, COMPLETELY IN {language.upper()}, wrapped in triple backticks:
\n```json
\n{{
\n  "scam_likelihood": "Low|Medium|High",
\n  "explanation": "Your detailed 300+ word explanation here with thorough assessment of the entire lease... MUST BE IN {language.upper()}",
\n  "concerning_clauses": [
\n    {{
\n      "original_text": "Exact clause text from document...",
\n      "simplified_text": "Simplified explanation in {language.upper()}...",
\n      "is_concerning": true,
\n      "reason": "Detailed explanation of why this clause is concerning, potentially illegal, or unfair... MUST BE IN {language.upper()}",
\n      "california_law": "Specific legal references with jurisdiction, section numbers and direct quotes from the relevant statutes... MUST BE IN {language.upper()}"
\n    }},
\n    {{
\n      "original_text": "Another concerning clause...",
\n      "simplified_text": "Plain language explanation in {language.upper()}...",
\n      "is_concerning": true,
\n      "reason": "Explanation of the issue with this clause... MUST BE IN {language.upper()}",
\n      "california_law": "Specific legal references with jurisdiction, section numbers and direct quotes from the relevant statutes... MUST BE IN {language.upper()}"
\n    }},
\n    {{
\n      "original_text": "Standard lease clause about rent payment...",
\n      "simplified_text": "Plain language explanation in {language.upper()}...",
\n      "is_concerning": false,
\n      "reason": "Explanation of why this is a standard/normal lease term... MUST BE IN {language.upper()}",
\n      "california_law": "Optional: Any relevant legal references that support this as standard... MUST BE IN {language.upper()}"
\n    }},
\n    {{
\n      "original_text": "Another standard clause about quiet enjoyment...",
\n      "simplified_text": "Plain language explanation in {language.upper()}...",
\n      "is_concerning": false,
\n      "reason": "Explanation of why this is a standard/normal lease term... MUST BE IN {language.upper()}",
\n      "california_law": "Optional: Any relevant legal references... MUST BE IN {language.upper()}"
\n    }}
\n  ],
\n  "suggested_questions": [
\n    "Specific question about a concerning term? IN {language.upper()}",
\n    "Another important question to ask? IN {language.upper()}",
\n    "A question about rights or responsibilities? IN {language.upper()}",
\n    "A question about a potentially unfair term? IN {language.upper()}",
\n    "A question about missing information? IN {language.upper()}",
\n    "A question about unclear language or terms? IN {language.upper()}",
\n    "A question about legal rights and protections? IN {language.upper()}",
\n    "A question about responsibilities not mentioned in the lease? IN {language.upper()}"
\n  ],
\n  "action_items": [
\n    "Specific action the tenant should take, like 'Request written clarification about clause X' IN {language.upper()}",
\n    "Another action recommendation, like 'Verify the landlord is the actual property owner' IN {language.upper()}",
\n    "A third action recommendation, like 'Consult with a tenant rights attorney about clause Y' IN {language.upper()}"
\n  ],
\n  "california_tenant_rights": {{
\n    "relevant_statutes": [
\n      "State-specific Civil Code or statute reference - with location and exact law text",
\n      "Additional relevant statute with specific section numbers and text..."
\n    ],
\n    "local_ordinances": [
\n      "Any relevant local ordinances that apply based on the property location",
\n      "Rent control or tenant protection ordinances if applicable to the location" 
\n    ],
\n    "case_law": [
\n      "Relevant cases that interpret these statutes in the jurisdiction",
\n      "Precedent that affects how these laws are applied in the specific location"
\n    ]
\n  }}
\n}}
\n```
"""
        prompt_parts.append(json_format_instructions)
        
        prompt_parts.append(f"""
\nBe extremely thorough in your analysis. Identify ALL concerning clauses, not just the most obvious ones.
\nIf you find potentially illegal or highly unfair terms, be sure to highlight them prominently.
\nInclude at least 6-8 detailed, specific questions tailored to the exact issues in this lease document.
\nMAKE SURE to clearly distinguish between genuinely concerning clauses and standard/normal lease terms that are fair and legal.
\nFor standard lease terms, mark them as not concerning (is_concerning: false) and provide a brief explanation of why they are normal.
\nBe lenient in your assessment - only mark clauses as concerning if they are truly problematic or unfair to tenants.
\nStandard terms like basic rent payment requirements, reasonable maintenance obligations, and standard noise policies should not be flagged as concerning.
\nIf you can't find any concerning clauses, explain thoroughly why the lease appears to be fair and standard.
\nVERY IMPORTANT: Your response MUST be valid JSON that can be parsed programmatically - check that all quotes and braces match.
\nDO NOT include explanatory text outside the JSON block.
\nDO NOT nest multiple levels of quotes that would break JSON parsing.
\nEnsure your response is correctly formatted JSON and can be parsed directly.
\nALL OF THE TEXT INSIDE THE JSON, EVERY SINGLE WORD, MUST BE IN {language.upper()}.
\nFINAL REMINDER: YOUR ENTIRE RESPONSE SHOULD BE IN {language.upper()} only. Do not use English at all unless {language.upper()} is English.
""")
        
        # Combine all parts
        result = "\n".join(prompt_parts)
        
        # Double check explicit mention of language in the result
        if language.lower() not in result.lower():
            print(f"WARNING: Language {language} not found in prompt!")
            
        return result
    
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
        # Base score based on scam likelihood - MORE GENEROUS STARTING POINTS
        base_score = {
            "Low": 90,    # Increased from 85
            "Medium": 70, # Increased from 60
            "High": 40    # Increased from 30
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