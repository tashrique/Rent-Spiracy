import os
import aiohttp
import logging
import json
import re
from typing import Dict, Any, Optional
import asyncio
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from urllib.parse import quote

logger = logging.getLogger(__name__)

# Cache for storing URL content
url_cache: Dict[str, Dict[str, Any]] = {}
CACHE_DURATION = timedelta(hours=24)  # Cache entries expire after 24 hours

class JinaService:
    """Service for interacting with Jina's reader API."""
    
    READER_BASE_URL = "https://r.jina.ai"  # Changed back to r.jina.ai

    @classmethod
    async def extract_content(cls, url: str) -> Dict[str, Any]:
        """Extract content from a URL using Jina's reader API."""
        try:
            # Check cache first
            if url in url_cache:
                cache_entry = url_cache[url]
                if datetime.now() - cache_entry['timestamp'] < CACHE_DURATION:
                    logger.info(f"Cache hit for URL: {url}")
                    return cache_entry['content']
                else:
                    logger.info(f"Removing expired cache entry for URL: {url}")
                    del url_cache[url]

            logger.info(f"Cache miss for URL: {url}, fetching from Jina API")
            
            # Encode the URL and construct the full URL
            encoded_url = quote(url, safe='')
            reader_url = f"{cls.READER_BASE_URL}/{encoded_url}"
            logger.info(f"Making request to: {reader_url}")
            
            # Query parameters
            params = {
                "wait_for": "networkidle",
                "wait_time": "5000",
                "javascript": "true",
                "render": "true"
            }
            
            headers = {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
            }
            
            timeout = aiohttp.ClientTimeout(total=45)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                try:
                    async with session.get(
                        reader_url,
                        params=params,
                        headers=headers,
                        ssl=True
                    ) as response:
                        response_text = await response.text()
                        logger.info(f"Jina Reader API response status: {response.status}")
                        logger.info(f"Response text preview: {response_text[:200]}")
                        
                        if response.status != 200:
                            logger.error(f"Jina Reader API error: {response.status} - {response_text}")
                            return None

                        try:
                            data = json.loads(response_text)
                            
                            if data.get("code") == 200 and data.get("status") == 20000:
                                content_data = data.get("data", {})
                                
                                # Get title and text content
                                title = content_data.get("title", "").strip()
                                text = content_data.get("text", "").strip()
                                
                                # Extract price from title first
                                price = None
                                price_patterns = [
                                    r'\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                                    r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*per\s*month',
                                    r'rent:?\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                                    r'price:?\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
                                ]
                                
                                # Check title first
                                if title:
                                    for pattern in price_patterns:
                                        match = re.search(pattern, title, re.IGNORECASE)
                                        if match:
                                            price = f"${match.group(1)}"
                                            break
                                
                                # Then check content
                                if not price and text:
                                    for pattern in price_patterns:
                                        match = re.search(pattern, text, re.IGNORECASE)
                                        if match:
                                            price = f"${match.group(1)}"
                                            break
                                
                                # Extract location
                                location = None
                                location_patterns = [
                                    r'(\d+[^,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)[^,]*)',
                                    r'(?:located at|address):\s*([^\.]+)',
                                    r'(?:in|at)\s+(\d+[^,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)[^,]*)'
                                ]
                                
                                for pattern in location_patterns:
                                    match = re.search(pattern, text, re.IGNORECASE) or re.search(pattern, title, re.IGNORECASE)
                                    if match:
                                        location = match.group(1).strip()
                                        break
                                
                                content = {
                                    "title": title,
                                    "text": text,
                                    "price": price,
                                    "location": location
                                }
                                
                                # Cache the results
                                url_cache[url] = {
                                    'content': content,
                                    'timestamp': datetime.now()
                                }
                                
                                logger.info(f"Successfully extracted content: Title={title[:50]}..., Price={price}, Location={location}")
                                return content

                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse JSON response: {str(e)}")
                            return None

                except asyncio.TimeoutError:
                    logger.error("Timeout while calling Jina Reader API")
                    return None
                except aiohttp.ClientError as e:
                    logger.error(f"Network error while calling Jina Reader API: {str(e)}")
                    return None

        except Exception as e:
            logger.error(f"Unexpected error extracting content: {str(e)}")
            logger.exception(e)
            return None

    @classmethod
    def clear_cache(cls):
        """Clear the URL cache."""
        global url_cache
        url_cache.clear()
        logger.info("URL cache cleared")

    @staticmethod
    def _extract_price(text: str) -> Optional[str]:
        """Extract price from text content."""
        price_patterns = [
            r'\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # $1,234.56 or $1234.56
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*dollars',  # 1,234.56 dollars
            r'rent:?\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # rent: $1,234.56
            r'monthly:?\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # monthly: $1,234.56
            r'price:?\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'  # price: $1,234.56
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        return None

    @staticmethod
    def _extract_address(text: str) -> Optional[str]:
        """Extract address from text content."""
        address_patterns = [
            r'located at:?\s*([^\.]+)',  # located at: 123 Main St
            r'address:?\s*([^\.]+)',  # address: 123 Main St
            r'property at:?\s*([^\.]+)',  # property at: 123 Main St
            r'\b\d+\s+[A-Za-z0-9\s,]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|circle|cir|court|ct|way|parkway|pkwy|place|pl)[^\.]*',  # Basic address pattern
            r'in\s+([A-Za-z\s]+(?:San Francisco|Oakland|Berkeley|Alameda|San Jose)[^\.]+)'  # Location in city
        ]
        
        for pattern in address_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None 