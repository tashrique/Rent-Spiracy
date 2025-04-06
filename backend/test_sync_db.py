from pymongo import MongoClient
import os
from dotenv import load_dotenv

def test_connection():
    # Load environment variables
    load_dotenv()
    
    # Get MongoDB URL from environment
    MONGODB_URL = os.getenv("MONGODB_URL")
    print(f"Using connection string: {MONGODB_URL}")
    
    try:
        # Create client with increased timeout
        print("Attempting to connect to MongoDB...")
        client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        
        # Test connection
        print("Testing connection...")
        client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        
        # List databases
        print("\nListing databases:")
        databases = client.list_database_names()
        print(f"Available databases: {databases}")
        
        # Get specific database
        db = client.rent_spiracy
        print(f"\nTesting access to rent_spiracy database...")
        collections = db.list_collection_names()
        print(f"Collections in rent_spiracy: {collections}")
        
    except Exception as e:
        print(f"\nError connecting to MongoDB: {str(e)}")
        print(f"Error type: {type(e)}")
    finally:
        # Close connection
        client.close()

if __name__ == "__main__":
    test_connection() 