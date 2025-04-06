from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorCollection
from app.utils.db import get_collection
from app.models import SuspectLeaser, SuspectLeaserCreate, SuspectLeaserUpdate, Language
from app.utils.translation import translate_suspect_leaser
from pydantic import EmailStr
import uuid
from datetime import datetime
from bson.objectid import ObjectId
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/suspect-leasers",
    tags=["suspect-leasers"],
    responses={404: {"description": "Not found"}}
)

# Get suspect leasers collection
async def get_suspect_leasers_collection() -> AsyncIOMotorCollection:
    return await get_collection("suspect_leasers")

@router.get("/", response_model=List[SuspectLeaser])
async def get_suspect_leasers(
    skip: int = 0, 
    limit: int = 10,
    language: Language = "english",
    collection: AsyncIOMotorCollection = Depends(get_suspect_leasers_collection)
):
    """Get a list of suspect leasers with pagination"""
    cursor = collection.find().skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
    
    # Translate the flags if language is not English
    if language != "english":
        results = [translate_suspect_leaser(leaser, language) for leaser in results]
        
    return results

@router.get("/search", response_model=List[SuspectLeaser])
async def search_suspect_leasers(
    name: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    address: Optional[str] = None,
    language: Language = "english",
    collection: AsyncIOMotorCollection = Depends(get_suspect_leasers_collection)
):
    """Search for suspect leasers by name, email, phone, or address"""
    query = {}
    
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    if email:
        query["email"] = {"$regex": email, "$options": "i"}
    if phone:
        query["phone"] = {"$regex": phone, "$options": "i"}
    if address:
        query["addresses"] = {"$regex": address, "$options": "i"}
        
    # If no search parameters provided, return empty list
    if not query:
        return []
        
    cursor = collection.find(query).limit(10)
    results = await cursor.to_list(length=10)
    
    # Translate the flags if language is not English
    if language != "english":
        results = [translate_suspect_leaser(leaser, language) for leaser in results]
        
    return results

@router.get("/{leaser_id}", response_model=SuspectLeaser)
async def get_suspect_leaser(
    leaser_id: str,
    language: Language = "english",
    collection: AsyncIOMotorCollection = Depends(get_suspect_leasers_collection)
):
    """Get a suspect leaser by ID"""
    leaser = await collection.find_one({"id": leaser_id})
    if not leaser:
        raise HTTPException(status_code=404, detail="Suspect leaser not found")
    
    # Translate the flags if language is not English
    if language != "english":
        leaser = translate_suspect_leaser(leaser, language)
        
    return leaser

@router.post("/", response_model=SuspectLeaser)
async def create_suspect_leaser(
    leaser: SuspectLeaserCreate,
    collection: AsyncIOMotorCollection = Depends(get_suspect_leasers_collection)
):
    """Create a new suspect leaser"""
    # Generate unique ID
    leaser_id = str(uuid.uuid4())
    
    # Create document
    leaser_doc = {
        "_id": leaser_id,
        "id": leaser_id,
        **leaser.dict(),
        "created_at": datetime.utcnow()
    }
    
    # Insert document
    await collection.insert_one(leaser_doc)
    
    # Return document
    return {**leaser_doc}

@router.put("/{leaser_id}", response_model=SuspectLeaser)
async def update_suspect_leaser(
    leaser_id: str,
    leaser_update: SuspectLeaserUpdate,
    collection: AsyncIOMotorCollection = Depends(get_suspect_leasers_collection)
):
    """Update a suspect leaser"""
    # Check if leaser exists
    existing_leaser = await collection.find_one({"id": leaser_id})
    if not existing_leaser:
        raise HTTPException(status_code=404, detail="Suspect leaser not found")
    
    # Update document
    update_data = {k: v for k, v in leaser_update.dict().items() if v is not None}
    await collection.update_one({"id": leaser_id}, {"$set": update_data})
    
    # Return updated document
    updated_leaser = await collection.find_one({"id": leaser_id})
    return updated_leaser

@router.delete("/{leaser_id}")
async def delete_suspect_leaser(
    leaser_id: str,
    collection: AsyncIOMotorCollection = Depends(get_suspect_leasers_collection)
):
    """Delete a suspect leaser"""
    # Check if leaser exists
    existing_leaser = await collection.find_one({"id": leaser_id})
    if not existing_leaser:
        raise HTTPException(status_code=404, detail="Suspect leaser not found")
    
    # Delete document
    await collection.delete_one({"id": leaser_id})
    
    # Return success
    return {"message": "Suspect leaser deleted"}

@router.post("/{leaser_id}/report")
async def report_suspect_leaser(leaser_id: str):
    """
    Report a suspect leaser, incrementing their reported_count.
    
    Args:
        leaser_id: ID of the suspect leaser to report
        
    Returns:
        Updated suspect leaser with incremented reported_count
    """
    collection = await get_collection("suspect_leasers")
    
    # Find the suspect leaser
    suspect_leaser = await collection.find_one({"id": leaser_id})
    if not suspect_leaser:
        raise HTTPException(status_code=404, detail="Suspect leaser not found")
    
    # Increment the reported_count field
    result = await collection.update_one(
        {"id": leaser_id},
        {"$inc": {"reported_count": 1}}
    )
    
    if result.modified_count != 1:
        logger.error(f"Failed to increment reported_count for suspect leaser {leaser_id}")
        raise HTTPException(status_code=500, detail="Failed to update reported count")
    
    # Get the updated document
    updated_leaser = await collection.find_one({"id": leaser_id})
    
    logger.info(f"Suspect leaser {leaser_id} reported. New count: {updated_leaser['reported_count']}")
    
    return {
        "success": True, 
        "reported_count": updated_leaser["reported_count"],
        "message": "Report submitted successfully"
    } 