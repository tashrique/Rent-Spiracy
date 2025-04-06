"""
Utility script to generate sample lawyer data and export to JSON file.
"""

import json
import random
from datetime import datetime
from enum import Enum
class Language(str, Enum):
    ENGLISH = "english"
    CHINESE = "chinese"
    HINDI = "hindi"
    SPANISH = "spanish"
    KOREAN = "korean"
    BENGALI = "bengali"
    SWAHILI = "swahili"
    ARABIC = "arabic"

class Region(str, Enum):
    NORTHEAST = "Northeast"
    MIDWEST = "Midwest"
    SOUTH = "South"
    WEST = "West"
    PACIFIC = "Pacific"

# Sample data for lawyers
first_names = [
    "James", "Robert", "Michael", "David", "John", "Joseph", "Charles", "Thomas", 
    "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Susan", "Karen", "Nancy",
    "Miguel", "José", "Maria", "Juan", "Elena", "Wei", "Li", "Jing", "Rahul", "Priya",
    "Aisha", "Ahmed", "Min-ji", "Ji-hoon", "Arjun", "Fatima", "Omar", "Chen", "Ananya"
]

last_names = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "López", "González", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Patel", "Kim", "Nguyen",
    "Chen", "Wang", "Singh", "Shah", "Khan", "Ali", "Ahmed", "Park", "Wu", "Gupta", "Das"
]

specializations = [
    "Tenant Rights", "Housing Law", "Landlord-Tenant Disputes", "Real Estate Law",
    "Housing Discrimination", "Lease Agreements", "Eviction Defense", "Housing Contracts",
    "Rental Property Issues", "Security Deposit Disputes"
]

cities_by_region = {
    Region.NORTHEAST: [
        "New York, NY", "Boston, MA", "Philadelphia, PA", "Washington, DC", 
        "Baltimore, MD", "Pittsburgh, PA", "Newark, NJ", "Providence, RI"
    ],
    Region.MIDWEST: [
        "Chicago, IL", "Detroit, MI", "Minneapolis, MN", "Cleveland, OH", 
        "St. Louis, MO", "Indianapolis, IN", "Milwaukee, WI", "Columbus, OH"
    ],
    Region.SOUTH: [
        "Atlanta, GA", "Miami, FL", "Dallas, TX", "Houston, TX", 
        "Charlotte, NC", "Nashville, TN", "New Orleans, LA", "Orlando, FL"
    ],
    Region.WEST: [
        "Denver, CO", "Phoenix, AZ", "Las Vegas, NV", "Salt Lake City, UT", 
        "Albuquerque, NM", "Boise, ID", "Tucson, AZ", "Colorado Springs, CO"
    ],
    Region.PACIFIC: [
        "Los Angeles, CA", "San Francisco, CA", "Seattle, WA", "Portland, OR", 
        "San Diego, CA", "Sacramento, CA", "San Jose, CA", "Oakland, CA"
    ]
}

free_consultation_options = ["15 minutes", "30 minutes", "1 hour", None]

def generate_lawyers():
    """Generate sample lawyer data and export to JSON file."""
    print("Generating lawyer data...")
    
    # Dictionary to store lawyers by language
    lawyers_by_language = {lang.value: [] for lang in Language}
    
    # Generate 20 lawyers
    for i in range(20):
        # Generate random lawyer data
        region = random.choice(list(Region))
        location = random.choice(cities_by_region[region])
        
        # Assign 1-3 languages to each lawyer
        num_languages = random.randint(1, 3)
        languages = random.sample(list(Language), num_languages)
        
        # Create lawyer document
        lawyer = {
            "name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "languages": [lang.value for lang in languages],
            "specialization": random.choice(specializations),
            "location": location,
            "region": region.value,
            "phone": f"({random.randint(100, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "email": f"lawyer{i+1}@example.com",
            "website": f"https://lawyer{i+1}.example.com" if random.random() > 0.3 else None,
            "pictureUrl": f"https://randomuser.me/api/portraits/{'women' if random.random() > 0.5 else 'men'}/{random.randint(1, 99)}.jpg",
            "freeDuration": random.choice(free_consultation_options),
            "rating": round(random.uniform(3.0, 5.0), 1)
        }
        
        # Add lawyer to each of their language groups
        for lang in languages:
            lawyers_by_language[lang.value].append(lawyer)
    
    # Ensure at least one lawyer for each language
    for language in Language:
        if not lawyers_by_language[language.value]:
            region = random.choice(list(Region))
            location = random.choice(cities_by_region[region])
            
            lawyer = {
                "name": f"{random.choice(first_names)} {random.choice(last_names)}",
                "languages": [language.value],
                "specialization": random.choice(specializations),
                "location": location,
                "region": region.value,
                "phone": f"({random.randint(100, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
                "email": f"lawyer_{language.value}@example.com",
                "website": f"https://lawyer_{language.value}.example.com",
                "pictureUrl": f"https://randomuser.me/api/portraits/{'women' if random.random() > 0.5 else 'men'}/{random.randint(1, 99)}.jpg",
                "freeDuration": random.choice(free_consultation_options),
                "rating": round(random.uniform(4.0, 5.0), 1)
            }
            
            lawyers_by_language[language.value].append(lawyer)
    
    # Save to JSON file
    with open('lawyers_data.json', 'w', encoding='utf-8') as f:
        json.dump(lawyers_by_language, f, indent=2, ensure_ascii=False)
    
    print("Lawyer data generation completed! Data saved to lawyers_data.json")

if __name__ == "__main__":
    generate_lawyers()