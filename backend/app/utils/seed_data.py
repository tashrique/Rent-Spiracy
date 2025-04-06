"""
Seed data for the application. 
This module contains sample data that can be loaded into the database for testing or initial setup.
"""

import datetime
import uuid
from typing import Dict, List, Optional, Any

# Common flags for suspect leasers - these match our translation dictionary
COMMON_FLAGS = [
    "multiple reported scams",
    "non-existent properties",
    "asks for wire transfers",
    "requests payment before showing property",
    "unavailable for in-person meetings",
    "uses fake property listings",
    "requests security deposit via gift cards",
    "offers lease without credit check",
    "refuses to provide property address",
    "excessive application fees",
    "requires payment in cryptocurrency",
    "claims to be out of the country",
    "photos don't match property",
    "price below market value",
    "no background check required",
    "refuses property tour",
    "high-pressure sales tactics",
    "no lease agreement provided",
    "requests bank account information"
]

# Sample suspicious landlords/leasers - expanded to 30 entries
SUSPECT_LEASERS = [
    {
        "_id": "e03f5b5f-1963-4de8-8017-0718dfa6065f",
        "id": "e03f5b5f-1963-4de8-8017-0718dfa6065f",
        "name": "John Smith",
        "email": "suspicious_landlord@example.com",
        "phone": "555-123-4567",
        "addresses": [
            "123 Scam Avenue, Faketown, NY",
            "456 Fraud Street, Scamville, CA"
        ],
        "flags": [
            "multiple reported scams",
            "non-existent properties",
            "asks for wire transfers"
        ],
        "reported_count": 3,
        "created_at": datetime.datetime(2025, 4, 5, 1, 38, 47, 369000)
    },
    {
        "_id": "7a1b83f4-5c2d-4e6f-8g9h-0i1j2k3l4m5n",
        "id": "7a1b83f4-5c2d-4e6f-8g9h-0i1j2k3l4m5n",
        "name": "Jane Wilson",
        "email": "scam_master@fakeemail.net",
        "phone": "555-987-6543",
        "addresses": [
            "789 Phishing Lane, Scamtown, CA",
            "321 Deception Road, Fraudville, NY"
        ],
        "flags": [
            "requests payment before showing property",
            "unavailable for in-person meetings",
            "uses fake property listings"
        ],
        "reported_count": 5,
        "created_at": datetime.datetime(2025, 3, 15, 14, 22, 10, 123000)
    },
    {
        "_id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        "name": "Robert Johnson",
        "email": "fake_properties@scam.org",
        "phone": "555-555-5555",
        "addresses": [
            "555 Nonexistent Place, Fakecity, FL"
        ],
        "flags": [
            "requests security deposit via gift cards",
            "offers lease without credit check",
            "refuses to provide property address"
        ],
        "reported_count": 8,
        "created_at": datetime.datetime(2025, 2, 28, 9, 15, 30, 500000)
    },
    {
        "_id": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        "id": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        "name": "Sarah Williams",
        "email": "rent_scammer@fraudmail.com",
        "phone": "555-222-3333",
        "addresses": [
            "789 Ghost Property Lane, Nowhere, TX"
        ],
        "flags": [
            "excessive application fees",
            "requires payment in cryptocurrency",
            "claims to be out of the country"
        ],
        "reported_count": 6,
        "created_at": datetime.datetime(2025, 2, 15, 11, 45, 20, 100000)
    },
    {
        "_id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
        "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
        "name": "Michael Brown",
        "email": "property_scams@fakehomes.net",
        "phone": "555-444-5555",
        "addresses": [
            "123 Deception Drive, Scamville, CA",
            "456 Fraud Boulevard, Faketown, NY"
        ],
        "flags": [
            "photos don't match property",
            "price below market value",
            "no background check required"
        ],
        "reported_count": 4,
        "created_at": datetime.datetime(2025, 1, 30, 8, 20, 15, 300000)
    },
    {
        "_id": "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
        "id": "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
        "name": "Emily Davis",
        "email": "lease_scams@scamemail.org",
        "phone": "555-666-7777",
        "addresses": [
            "321 Fictional Street, Nonexistent City, CA"
        ],
        "flags": [
            "refuses property tour",
            "high-pressure sales tactics",
            "no lease agreement provided"
        ],
        "reported_count": 7,
        "created_at": datetime.datetime(2025, 1, 15, 13, 30, 45, 200000)
    },
    {
        "_id": "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
        "id": "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
        "name": "David Wilson",
        "email": "rental_fraud@scamcentral.net",
        "phone": "555-888-9999",
        "addresses": [
            "987 Phantom Road, Fakeville, NY",
            "654 Illusion Avenue, Scamtown, FL"
        ],
        "flags": [
            "requests bank account information",
            "multiple reported scams",
            "asks for wire transfers"
        ],
        "reported_count": 9,
        "created_at": datetime.datetime(2024, 12, 20, 16, 50, 10, 400000)
    },
    {
        "_id": "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
        "id": "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
        "name": "Jennifer Martinez",
        "email": "property_fraud@fakeestate.com",
        "phone": "555-123-0000",
        "addresses": [
            "135 Nonexistent Circle, Nowhere, CA"
        ],
        "flags": [
            "unavailable for in-person meetings",
            "requires payment in cryptocurrency",
            "price below market value"
        ],
        "reported_count": 5,
        "created_at": datetime.datetime(2024, 12, 5, 9, 15, 30, 700000)
    },
    {
        "_id": "8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w",
        "id": "8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w",
        "name": "James Anderson",
        "email": "fake_rentals@scamlord.org",
        "phone": "555-111-2222",
        "addresses": [
            "246 Scam Street, Fraudville, TX",
            "135 Deceptive Drive, Faketown, CA"
        ],
        "flags": [
            "requests security deposit via gift cards",
            "claims to be out of the country",
            "no lease agreement provided"
        ],
        "reported_count": 8,
        "created_at": datetime.datetime(2024, 11, 15, 14, 45, 20, 600000)
    },
    {
        "_id": "9i0j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x",
        "id": "9i0j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x",
        "name": "Maria Garcia",
        "email": "lease_fraudster@scammail.net",
        "phone": "555-333-4444",
        "addresses": [
            "369 Phantom Place, Nonexistent City, NY"
        ],
        "flags": [
            "offers lease without credit check",
            "photos don't match property",
            "high-pressure sales tactics"
        ],
        "reported_count": 6,
        "created_at": datetime.datetime(2024, 11, 1, 11, 30, 15, 900000)
    }
]

# Generate 20 more suspect leasers to reach 30 total
for i in range(20):
    name_options = ["Thomas Lee", "Jessica Taylor", "Daniel Rodriguez", "Amanda White", 
                   "Christopher Harris", "Michelle Martin", "Andrew Thompson", "Elizabeth Lewis",
                   "Kevin Jackson", "Stephanie Clark", "Ryan Miller", "Rachel Wilson", 
                   "Jonathan Allen", "Nicole Scott", "Brandon Young", "Melissa Green",
                   "Patrick Hall", "Lauren Adams", "Gregory Baker", "Megan Turner"]
    
    email_options = [
        f"scam{i}@fraudmail.net", 
        f"fake_landlord{i}@scamrental.com",
        f"property{i}_scammer@fakemail.org",
        f"leasing{i}.fraud@deception.net",
        f"rental.scams{i}@fakeproperty.com"
    ]
    
    phone_options = [
        f"555-{100+i}-{1000+i}", 
        f"555-{200+i}-{2000+i}",
        f"555-{300+i}-{3000+i}",
        f"555-{400+i}-{4000+i}"
    ]
    
    address_options = [
        [f"{100+i} Fake Street, Nonexistent City, CA"],
        [f"{200+i} Scam Avenue, Fraudtown, NY"],
        [f"{300+i} Phantom Road, Fakeville, TX", f"{400+i} Deception Lane, Scamburg, FL"],
        [f"{500+i} Nonexistent Boulevard, Nowhere, WA", f"{600+i} Illusion Drive, Faketown, AZ"]
    ]
    
    # Pick 2-3 random flags from common flags
    import random
    flag_count = random.randint(2, 4)
    selected_flags = random.sample(COMMON_FLAGS, flag_count)
    
    reported_count = random.randint(1, 12)
    
    # Create a date within the last 6 months
    days_ago = random.randint(0, 180)
    created_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)
    
    # Generate a new suspect leaser
    new_id = str(uuid.uuid4())
    new_leaser = {
        "_id": new_id,
        "id": new_id,
        "name": name_options[i % len(name_options)],
        "email": email_options[i % len(email_options)],
        "phone": phone_options[i % len(phone_options)],
        "addresses": address_options[i % len(address_options)],
        "flags": selected_flags,
        "reported_count": reported_count,
        "created_at": created_date
    }
    
    SUSPECT_LEASERS.append(new_leaser)

# Function to generate a new suspect leaser with random ID
def generate_new_suspect_leaser(name, email, phone, addresses, flags, reported_count):
    """Generate a new suspect leaser with a random ID"""
    leaser_id = str(uuid.uuid4())
    return {
        "_id": leaser_id,
        "id": leaser_id,
        "name": name,
        "email": email,
        "phone": phone,
        "addresses": addresses,
        "flags": flags,
        "reported_count": reported_count,
        "created_at": datetime.datetime.utcnow()
    }

# Create a lookup data structure for efficient searching
class SuspectLeaserLookup:
    """
    A data structure for efficient searching and filtering of suspect leasers.
    Provides indexing by name, email, phone, and address.
    """
    
    def __init__(self, leasers: List[Dict[str, Any]]):
        self.all_leasers = leasers
        self.name_index: Dict[str, List[Dict[str, Any]]] = {}
        self.email_index: Dict[str, List[Dict[str, Any]]] = {}
        self.phone_index: Dict[str, List[Dict[str, Any]]] = {}
        self.address_index: Dict[str, List[Dict[str, Any]]] = {}
        self.id_index: Dict[str, Dict[str, Any]] = {}
        
        # Build indices
        self._build_indices()
    
    def _build_indices(self):
        """Build all search indices"""
        for leaser in self.all_leasers:
            # Index by ID
            self.id_index[leaser["id"]] = leaser
            
            # Index by name (lowercase for case-insensitive search)
            name_key = leaser["name"].lower()
            if name_key not in self.name_index:
                self.name_index[name_key] = []
            self.name_index[name_key].append(leaser)
            
            # Index by email
            if leaser.get("email"):
                email_key = leaser["email"].lower()
                if email_key not in self.email_index:
                    self.email_index[email_key] = []
                self.email_index[email_key].append(leaser)
            
            # Index by phone
            if leaser.get("phone"):
                phone_key = leaser["phone"]
                if phone_key not in self.phone_index:
                    self.phone_index[phone_key] = []
                self.phone_index[phone_key].append(leaser)
            
            # Index by each address
            if leaser.get("addresses"):
                for address in leaser["addresses"]:
                    address_key = address.lower()
                    if address_key not in self.address_index:
                        self.address_index[address_key] = []
                    self.address_index[address_key].append(leaser)
    
    def search(self, query: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Search for suspect leasers based on the provided query parameters.
        
        Args:
            query: Dictionary with optional keys 'name', 'email', 'phone', 'address'
            
        Returns:
            List of matching suspect leasers
        """
        results = set()
        found_any = False
        
        # Search by name
        if query.get("name"):
            name_query = query["name"].lower()
            for name_key, leasers in self.name_index.items():
                if name_query in name_key:
                    for leaser in leasers:
                        results.add(leaser["id"])
                    found_any = True
        
        # Search by email
        if query.get("email"):
            email_query = query["email"].lower()
            for email_key, leasers in self.email_index.items():
                if email_query in email_key:
                    for leaser in leasers:
                        results.add(leaser["id"])
                    found_any = True
        
        # Search by phone
        if query.get("phone"):
            phone_query = query["phone"]
            for phone_key, leasers in self.phone_index.items():
                if phone_query in phone_key:
                    for leaser in leasers:
                        results.add(leaser["id"])
                    found_any = True
        
        # Search by address
        if query.get("address"):
            address_query = query["address"].lower()
            for address_key, leasers in self.address_index.items():
                if address_query in address_key:
                    for leaser in leasers:
                        results.add(leaser["id"])
                    found_any = True
        
        # If no search parameters or no results, return empty list
        if not found_any:
            return []
        
        # Convert set of IDs to list of leaser objects
        return [self.id_index[leaser_id] for leaser_id in results]
    
    def get_by_id(self, leaser_id: str) -> Optional[Dict[str, Any]]:
        """Get a suspect leaser by ID"""
        return self.id_index.get(leaser_id)
    
    def get_all(self, skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
        """Get all suspect leasers with pagination"""
        end_idx = min(skip + limit, len(self.all_leasers))
        return self.all_leasers[skip:end_idx]

# Create and export the lookup instance with our seed data
suspect_leaser_lookup = SuspectLeaserLookup(SUSPECT_LEASERS)

# Function to seed the database with suspect leasers
async def seed_suspect_leasers(db_collection):
    """Seed the suspect_leasers collection with sample data"""
    # Check if collection is empty
    count = await db_collection.count_documents({})
    
    if count == 0:
        print(f"Seeding suspect_leasers collection with {len(SUSPECT_LEASERS)} entries...")
        # Insert all suspect leasers
        await db_collection.insert_many(SUSPECT_LEASERS)
        print("Suspect leasers seeded successfully.")
    else:
        print(f"Suspect leasers collection already contains {count} documents. Skipping seeding.") 