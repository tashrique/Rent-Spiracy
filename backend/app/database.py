from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging
import asyncio

logger = logging.getLogger(__name__)

load_dotenv()

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "rent_spiracy")

logger.info(f"Connecting to database: {DATABASE_NAME}")

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db.users
listings_collection = db.listings

logger.info("Database client initialized")

# Export the async client and database
__all__ = ['client', 'db', 'users_collection', 'listings_collection'] 