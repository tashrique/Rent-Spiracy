"""
Seed database utility for Rent-Spiracy.
This script populates the database with initial data for testing.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.db import get_db_client
from app.utils.seed_data import SUSPECT_LEASERS, suspect_leaser_lookup

async def seed_database():
    """Seed the database with initial data"""
    print("Connecting to database...")
    client = await get_db_client()
    db = client.get_database()
    
    # Seed suspect leasers collection
    await seed_suspect_leasers(db)
    
    print("Database seeding completed.")

async def seed_suspect_leasers(db):
    """Seed suspect leasers collection"""
    collection = db.get_collection("suspect_leasers")
    
    # Check if collection has data already
    count = await collection.count_documents({})
    
    if count == 0:
        print(f"Seeding suspect_leasers collection with {len(SUSPECT_LEASERS)} entries...")
        
        # Insert all suspect leasers
        await collection.insert_many(SUSPECT_LEASERS)
        print("Suspect leasers seeded successfully.")
    else:
        print(f"Suspect leasers collection already contains {count} documents. Skipping seeding.")

if __name__ == "__main__":
    # Run the seeding script
    asyncio.run(seed_database()) 