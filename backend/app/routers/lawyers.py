from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId
from app.models import Lawyer, LawyerCreate, LawyerUpdate, LawyerFilter, Language, Region
from app.utils.db import get_lawyers_collection
import logging

router = APIRouter(
    prefix="/lawyers",
    tags=["lawyers"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("rent-spiracy")

@router.post("/", response_model=Lawyer)
async def create_lawyer(lawyer: LawyerCreate):
    """
    Create a new lawyer in the database.
    """
    collection = get_lawyers_collection()
    
    lawyer_dict = lawyer.model_dump()
    result = await collection.insert_one(lawyer_dict)
    
    # Update the id field with the ObjectId
    lawyer_dict["id"] = str(result.inserted_id)
    
    return lawyer_dict

@router.get("/", response_model=List[Lawyer])
async def get_lawyers(
    language: Optional[Language] = None,
    region: Optional[Region] = None,
    specialization: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """
    Get lawyers with optional filtering by language, region, and specialization.
    """
    collection = get_lawyers_collection()
    
    # Build query based on filters
    query = {}
    if language:
        query["languages"] = language
    if region:
        query["region"] = region
    if specialization:
        query["specialization"] = {"$regex": specialization, "$options": "i"}
    
    # Retrieve lawyers from the database
    cursor = collection.find(query).skip(skip).limit(limit)
    lawyers = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for lawyer in lawyers:
        lawyer["id"] = str(lawyer.get("_id"))
        lawyer.pop("_id", None)
    
    return lawyers

@router.get("/{lawyer_id}", response_model=Lawyer)
async def get_lawyer(lawyer_id: str):
    """
    Get a specific lawyer by ID.
    """
    collection = get_lawyers_collection()
    
    try:
        lawyer = await collection.find_one({"_id": ObjectId(lawyer_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lawyer ID format")
    
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    
    # Convert ObjectId to string
    lawyer["id"] = str(lawyer.get("_id"))
    lawyer.pop("_id", None)
    
    return lawyer

@router.put("/{lawyer_id}", response_model=Lawyer)
async def update_lawyer(lawyer_id: str, lawyer_update: LawyerUpdate):
    """
    Update a lawyer's information.
    """
    collection = get_lawyers_collection()
    
    # Convert to dict and remove None values
    update_data = {k: v for k, v in lawyer_update.model_dump().items() if v is not None}
    
    try:
        result = await collection.update_one(
            {"_id": ObjectId(lawyer_id)},
            {"$set": update_data}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lawyer ID format")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    
    # Get updated lawyer
    updated_lawyer = await collection.find_one({"_id": ObjectId(lawyer_id)})
    updated_lawyer["id"] = str(updated_lawyer.get("_id"))
    updated_lawyer.pop("_id", None)
    
    return updated_lawyer

@router.delete("/{lawyer_id}", response_model=dict)
async def delete_lawyer(lawyer_id: str):
    """
    Delete a lawyer from the database.
    """
    collection = get_lawyers_collection()
    
    try:
        result = await collection.delete_one({"_id": ObjectId(lawyer_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lawyer ID format")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    
    return {"detail": "Lawyer successfully deleted"}

@router.get("/filter/by-language/{language}", response_model=List[Lawyer])
async def filter_lawyers_by_language(language: Language):
    """
    Filter lawyers by language.
    """
    collection = get_lawyers_collection()
    
    cursor = collection.find({"languages": language})
    lawyers = await cursor.to_list(length=100)
    
    # Convert ObjectId to string
    for lawyer in lawyers:
        lawyer["id"] = str(lawyer.get("_id"))
        lawyer.pop("_id", None)
    
    return lawyers 