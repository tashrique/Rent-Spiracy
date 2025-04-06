"""
Example script demonstrating the use of the SuspectLeaserLookup data structure
for efficient searching and filtering of suspect leasers.
"""

from app.utils.seed_data import suspect_leaser_lookup, SUSPECT_LEASERS
from app.utils.translation import translate_suspect_leaser
import json

def print_json(data):
    """Print formatted JSON"""
    print(json.dumps(data, indent=2, default=str))

def demonstrate_lookup():
    """Demonstrate various search capabilities of the SuspectLeaserLookup class"""
    print("\n===== SUSPECT LEASER LOOKUP DEMO =====\n")
    
    # 1. Search by name
    print("===== SEARCH BY NAME 'Smith' =====")
    results = suspect_leaser_lookup.search({"name": "Smith"})
    print(f"Found {len(results)} results")
    print_json(results[0] if results else "No results found")
    
    # 2. Search by email domain
    print("\n===== SEARCH BY EMAIL DOMAIN 'scam' =====")
    results = suspect_leaser_lookup.search({"email": "scam"})
    print(f"Found {len(results)} results")
    print_json(results[0] if results else "No results found")
    
    # 3. Search by phone area code
    print("\n===== SEARCH BY PHONE AREA CODE '555' =====")
    results = suspect_leaser_lookup.search({"phone": "555"})
    print(f"Found {len(results)} results")
    print_json(results[0] if results else "No results found")
    
    # 4. Search by city
    print("\n===== SEARCH BY CITY 'Faketown' =====")
    results = suspect_leaser_lookup.search({"address": "Faketown"})
    print(f"Found {len(results)} results")
    print_json(results[0] if results else "No results found")
    
    # 5. Combined search
    print("\n===== COMBINED SEARCH (email: 'fraud' AND address: 'CA') =====")
    # This would need to be implemented in the SuspectLeaserLookup class
    email_results = set([r["id"] for r in suspect_leaser_lookup.search({"email": "fraud"})])
    address_results = set([r["id"] for r in suspect_leaser_lookup.search({"address": "CA"})])
    combined_ids = email_results.intersection(address_results)
    combined_results = [suspect_leaser_lookup.get_by_id(id) for id in combined_ids]
    
    print(f"Found {len(combined_results)} results")
    print_json(combined_results[0] if combined_results else "No results found")
    
    # 6. Demonstrate pagination
    print("\n===== PAGINATION DEMO (all entries, skip 5, limit 2) =====")
    results = suspect_leaser_lookup.get_all(skip=5, limit=2)
    print(f"Found {len(results)} results (page 3, 2 per page)")
    print_json(results)
    
    # 7. Demonstrate translation
    print("\n===== TRANSLATION DEMO (Spanish) =====")
    leaser = results[0] if results else SUSPECT_LEASERS[0]
    translated = translate_suspect_leaser(leaser, "spanish")
    print("Original flags:")
    print_json(leaser["flags"])
    print("\nTranslated flags (Spanish):")
    print_json(translated["flags"])

    # 8. Search specific flags
    print("\n===== DEMO ENDS =====")
    print("The lookup structure supports efficient searching by id, name, email, phone, and address.")
    print("For searching by flags or other fields, you would need to add additional indices.")

if __name__ == "__main__":
    demonstrate_lookup() 