from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import uuid

from app.utils.db import Database

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/")
async def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    min_score: Optional[int] = Query(None, ge=0, le=100),
    type: Optional[str] = Query(
        None, description="Document type (e.g., lease, listing)")
):
    """
    List fake rental documents with optional filtering.

    - skip: Number of documents to skip
    - limit: Maximum number of documents to return
    - min_score: Minimum scam score
    - type: Document type filter
    """
    db = Database.get_db()
    fake_documents = db.fake_documents

    # Build query filter
    query = {}
    if min_score is not None:
        query["scam_score"] = {"$gte": min_score}
    if type:
        query["type"] = type

    # Execute query
    cursor = fake_documents.find(query).skip(
        skip).limit(limit).sort("created_at", -1)
    documents = await cursor.to_list(length=limit)

    # Convert ObjectId to string for JSON serialization
    for doc in documents:
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])

    return documents


@router.get("/{document_id}")
async def get_document(document_id: str):
    """
    Get a specific fake document by ID.
    """
    db = Database.get_db()
    fake_documents = db.fake_documents

    document = await fake_documents.find_one({"id": document_id})
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    # Convert ObjectId to string for JSON serialization
    if "_id" in document:
        document["_id"] = str(document["_id"])

    return document


@router.get("/search/")
async def search_documents(
    query: str = Query(..., min_length=3),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Search for fake documents using text search.
    """
    db = Database.get_db()
    fake_documents = db.fake_documents

    # Text search using MongoDB's text index
    cursor = fake_documents.find(
        {"$text": {"$search": query}},
        {"score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})]).limit(limit)

    documents = await cursor.to_list(length=limit)

    # Convert ObjectId to string for JSON serialization
    for doc in documents:
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])

    return documents
