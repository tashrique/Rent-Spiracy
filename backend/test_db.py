import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def test_connection():
    # Load environment variables
    load_dotenv()
    
    # Get MongoDB URL from environment
    MONGODB_URL = os.getenv("MONGODB_URL")
    
    try:
        # Create client
        print("Attempting to connect to MongoDB...")
        client = AsyncIOMotorClient(MONGODB_URL)
        
        # Test connection
        print("Testing connection...")
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        
        # List databases
        print("\nListing databases:")
        databases = await client.list_database_names()
        print(f"Available databases: {databases}")
        
        # Get specific database
        db = client.rent_spiracy
        print(f"\nTesting access to rent_spiracy database...")
        collections = await db.list_collection_names()
        print(f"Collections in rent_spiracy: {collections}")
        
    except Exception as e:
        print(f"\nError connecting to MongoDB: {str(e)}")
        print(f"Error type: {type(e)}")
    finally:
        # Close connection
        client.close()

if __name__ == "__main__":
    asyncio.run(test_connection()) 