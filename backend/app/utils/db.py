import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from dotenv import load_dotenv
import logging
from app.utils.seed_data import SUSPECT_LEASERS, suspect_leaser_lookup

# Load environment variables
load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "rent-spiracy")

# Set up logging
logger = logging.getLogger(__name__)

# Create a singleton database client
class Database:
    client: AsyncIOMotorClient = None

    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB."""
        if cls.client is None:
            cls.client = AsyncIOMotorClient(MONGO_URI)
            logger.info("MongoDB connection established")
            
            # Initialize suspect leasers collection with seed data
            if os.getenv("ENVIRONMENT", "development") == "development":
                await cls.seed_suspect_leasers()

    @classmethod
    async def close_db(cls):
        """Close MongoDB connection."""
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            logger.info("MongoDB connection closed")

    @classmethod
    def get_db(cls):
        """Get database instance."""
        if cls.client is None:
            raise ConnectionError("Database connection not established")
        return cls.client[DATABASE_NAME]
            
    @classmethod
    async def seed_suspect_leasers(cls):
        """Seed the suspect leasers collection with initial data if it's empty."""
        try:
            db = cls.get_db()
            collection = db.suspect_leasers
            
            # Check if collection is empty
            count = await collection.count_documents({})
            if count == 0:
                logger.info("Seeding suspect leasers collection...")
                # Insert seed data
                await collection.insert_many(SUSPECT_LEASERS)
                logger.info(f"Added {len(SUSPECT_LEASERS)} suspect leasers to database")
                logger.info(f"Initialized lookup structure with {len(suspect_leaser_lookup.all_leasers)} entries")
            else:
                logger.info(f"Suspect leasers collection already contains {count} documents. Skipping seeding.")
                logger.info(f"Lookup structure initialized with existing data: {len(suspect_leaser_lookup.all_leasers)} entries")
        except Exception as e:
            logger.error(f"Error seeding suspect leasers: {e}")

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

async def get_collection(collection_name: str) -> AsyncIOMotorCollection:
    """Get collection by name."""
    db = Database.get_db()
    return db[collection_name]

# Get MongoDB client instance (for direct access if needed)
async def get_db_client() -> AsyncIOMotorClient:
    """Get database client."""
    if Database.client is None:
        await Database.connect_db()
    return Database.client
