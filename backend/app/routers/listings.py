from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Form, Depends
from typing import List, Optional
from ..database import db
from ..models.listing import RentalListing
from ..services.gemini_service import analyze_listing
from ..services.zillow_service import get_property_data, analyze_price
from ..services.file_service import save_upload_file
from bson import ObjectId
import re
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)
router = APIRouter()

def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    phone_pattern = re.compile(r'^\+?1?\d{9,15}$')
    return bool(phone_pattern.match(phone))

def validate_email(email: str) -> bool:
    """Validate email format"""
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    return bool(email_pattern.match(email))

def validate_url(url: str) -> bool:
    """Validate URL format"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

@router.post("/listings/submit", response_model=RentalListing)
async def submit_listing(
    listing_url: str = Form(...),
    landlord_email: str = Form(...),
    landlord_phone: str = Form(...),
    property_address: str = Form(...),
    user_id: str = Form(...),
    lease_document: Optional[UploadFile] = File(None),
    background_tasks: BackgroundTasks = Depends()
):
    """
    Submit a new listing with optional file upload
    """
    # Validate inputs
    validation_errors = []
    
    if not validate_email(landlord_email):
        validation_errors.append("Invalid email format")
    
    if not validate_phone(landlord_phone):
        validation_errors.append("Invalid phone number format")
    
    if not validate_url(listing_url):
        validation_errors.append("Invalid listing URL format")
    
    if not ObjectId.is_valid(user_id):
        validation_errors.append("Invalid user ID")
    
    if validation_errors:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Validation failed",
                "errors": validation_errors
            }
        )

    try:
        # Handle file upload
        lease_document_url = None
        if lease_document:
            lease_document_url = await save_upload_file(lease_document, user_id)

        # Create listing object
        listing = RentalListing(
            user_id=ObjectId(user_id),
            listing_url=listing_url,
            landlord_email=landlord_email,
            landlord_phone=landlord_phone,
            property_address=property_address,
            lease_document_url=lease_document_url
        )

        # Insert listing into database
        listing_dict = listing.dict(by_alias=True)
        result = await db.listings.insert_one(listing_dict)
        
        # Trigger background analysis
        background_tasks.add_task(analyze_listing_background, str(result.inserted_id))
        
        # Return the created listing
        created_listing = await db.listings.find_one({"_id": result.inserted_id})
        return RentalListing(**created_listing)
        
    except Exception as e:
        logger.error(f"Error creating listing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Error creating listing",
                "error": str(e)
            }
        )

@router.get("/listings/{listing_id}", response_model=RentalListing)
async def get_listing(listing_id: str):
    """
    Get a specific rental listing with its analysis results
    """
    if not ObjectId.is_valid(listing_id):
        raise HTTPException(status_code=400, detail="Invalid listing ID")
    
    listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    return RentalListing(**listing)

@router.get("/listings/user/{user_id}", response_model=List[RentalListing])
async def get_user_listings(user_id: str):
    """
    Get all listings submitted by a specific user
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    cursor = db.listings.find({"user_id": ObjectId(user_id)})
    listings = []
    async for listing in cursor:
        listings.append(RentalListing(**listing))
    return listings

@router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str):
    """
    Delete a listing and its associated files
    """
    if not ObjectId.is_valid(listing_id):
        raise HTTPException(status_code=400, detail="Invalid listing ID")
    
    listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Delete associated file if it exists
    if listing.get("lease_document_url"):
        try:
            await delete_file(listing["lease_document_url"])
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
    
    # Delete listing from database
    result = await db.listings.delete_one({"_id": ObjectId(listing_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    return {"message": "Listing deleted successfully"}

async def analyze_listing_background(listing_id: str):
    """
    Background task to analyze a listing using various services
    """
    try:
        # Get the listing
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
        if not listing:
            return
        
        # Perform Gemini analysis
        gemini_results = await analyze_listing(listing)
        
        # Get Zillow data
        zillow_data = await get_property_data(listing["property_address"])
        
        # Calculate risk score (simple example - you might want to make this more sophisticated)
        risk_score = 0.0
        if gemini_results["risk_level"] == "high":
            risk_score += 0.7
        elif gemini_results["risk_level"] == "medium":
            risk_score += 0.4
        
        if zillow_data and "is_suspicious" in zillow_data:
            risk_score += 0.3
        
        # Update the listing with analysis results
        update_data = {
            "gemini_analysis": gemini_results,
            "zillow_price_data": zillow_data,
            "risk_score": risk_score,
            "red_flags": gemini_results.get("red_flags", [])
        }
        
        await db.listings.update_one(
            {"_id": ObjectId(listing_id)},
            {"$set": update_data}
        )
        
    except Exception as e:
        logger.error(f"Error in background analysis for listing {listing_id}: {str(e)}")
        # You might want to add error handling/retry logic here 