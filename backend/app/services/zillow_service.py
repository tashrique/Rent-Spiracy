import os
import logging
from typing import Dict, Optional
import httpx
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()

ZILLOW_API_KEY = os.getenv("ZILLOW_API_KEY")
ZILLOW_API_ENDPOINT = "https://api.bridgedataoutput.com/api/v2/zestimates"

async def get_property_data(address: str) -> Optional[Dict]:
    """
    Fetch property data from Zillow API
    """
    try:
        async with httpx.AsyncClient() as client:
            params = {
                "access_token": ZILLOW_API_KEY,
                "address": address
            }
            
            response = await client.get(ZILLOW_API_ENDPOINT, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get("status", {}).get("success"):
                logger.error(f"Zillow API error for address {address}: {data}")
                return None
            
            # Extract relevant information
            property_data = {
                "zestimate": data.get("zestimate"),
                "rent_zestimate": data.get("rentZestimate"),
                "price_range": {
                    "low": data.get("valuationRange", {}).get("low"),
                    "high": data.get("valuationRange", {}).get("high")
                },
                "last_updated": data.get("lastUpdated")
            }
            
            return property_data
            
    except Exception as e:
        logger.error(f"Error fetching Zillow data: {str(e)}")
        return None

def analyze_price(listing_price: float, zillow_data: Dict) -> Dict:
    """
    Analyze if the listing price is reasonable compared to Zillow estimates
    """
    if not zillow_data or not zillow_data.get("rent_zestimate"):
        return {
            "comparison_possible": False,
            "message": "Unable to compare price - no Zillow data available"
        }
    
    zestimate = float(zillow_data["rent_zestimate"])
    price_diff_percent = ((listing_price - zestimate) / zestimate) * 100
    
    analysis = {
        "comparison_possible": True,
        "listing_price": listing_price,
        "zillow_estimate": zestimate,
        "price_difference_percent": price_diff_percent,
        "is_suspicious": abs(price_diff_percent) > 30
    }
    
    if price_diff_percent <= -30:
        analysis["warning"] = "Price is suspiciously low compared to market value"
    elif price_diff_percent >= 30:
        analysis["warning"] = "Price is significantly higher than market value"
    else:
        analysis["warning"] = "Price appears to be within reasonable market range"
    
    return analysis 