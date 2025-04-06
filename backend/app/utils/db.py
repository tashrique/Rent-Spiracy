import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "rent-spiracy")

# Create a singleton database client


class Database:
    client: AsyncIOMotorClient = None

    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB."""
        if cls.client is None:
            cls.client = AsyncIOMotorClient(MONGO_URI)
            print("MongoDB connection established")

    @classmethod
    async def close_db(cls):
        """Close MongoDB connection."""
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            print("MongoDB connection closed")

    @classmethod
    def get_db(cls):
        """Get database instance."""
        if cls.client is None:
            raise ConnectionError("Database connection not established")
        return cls.client[DATABASE_NAME]

# Helper functions to access common collections


def get_rentals_collection():
    """Get rentals collection."""
    db = Database.get_db()
    return db.rentals


async def get_analyses_collection():
    """Get analyses collection."""
    db = Database.get_db()
    return db.analyses

def get_lawyers_collection():
    """Get lawyers collection."""
    db = Database.get_db()
    return db.lawyers
