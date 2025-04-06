import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import asyncio
from typing import Optional

# Load environment variables
load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "rent-spiracy")

class Database:
    _instance: Optional['Database'] = None
    _lock = asyncio.Lock()
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        
    @classmethod
    async def get_instance(cls) -> 'Database':
        if not cls._instance:
            async with cls._lock:
                if not cls._instance:
                    cls._instance = cls()
        return cls._instance

    async def connect_db(self):
        """Connect to MongoDB."""
        if self.client is None:
            self.client = AsyncIOMotorClient(
                MONGO_URI,
                maxPoolSize=10,
                minPoolSize=1,
                maxIdleTimeMS=30000
            )
            print("MongoDB connection established")

    async def close_db(self):
        """Close MongoDB connection."""
        if self.client is not None:
            self.client.close()
            self.client = None
            print("MongoDB connection closed")

    def get_db(self):
        """Get database instance."""
        if self.client is None:
            raise ConnectionError("Database connection not established")
        return self.client[DATABASE_NAME]

# Helper functions to access common collections


async def get_rentals_collection():
    """Get rentals collection."""
    db_instance = await Database.get_instance()
    return db_instance.get_db().rentals


async def get_analyses_collection():
    """Get analyses collection."""
    db_instance = await Database.get_instance()
    return db_instance.get_db().analyses
