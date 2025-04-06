#!/usr/bin/env python
"""
Test script for the SuspectLeaserLookup search functionality.
This script allows you to test the search capabilities of the lookup data structure.

Usage:
    python test_search.py [command] [args]

Commands:
    all - List all suspect leasers (paginated)
    name [query] - Search by name
    email [query] - Search by email
    phone [query] - Search by phone
    address [query] - Search by address
    demo - Run a demonstration of all search capabilities

Examples:
    python test_search.py all 0 5  # List first 5 entries
    python test_search.py name Smith  # Search for 'Smith' in names
    python test_search.py email scam  # Search for 'scam' in emails
    python test_search.py demo  # Run a full demonstration
"""

import sys
import json
from app.utils.seed_data import suspect_leaser_lookup
from app.utils.translation import translate_suspect_leaser

def print_json(data):
    """Print JSON data in a readable format"""
    print(json.dumps(data, indent=2, default=str))

def list_all(skip=0, limit=10):
    """List all entries with pagination"""
    results = suspect_leaser_lookup.get_all(skip=int(skip), limit=int(limit))
    print(f"Found {len(results)} results (showing {skip}-{int(skip)+len(results)})")
    print_json(results)

def search_by_name(query):
    """Search by name"""
    results = suspect_leaser_lookup.search({"name": query})
    print(f"Found {len(results)} results for name search: '{query}'")
    if results:
        print_json(results)
    else:
        print("No results found")

def search_by_email(query):
    """Search by email"""
    results = suspect_leaser_lookup.search({"email": query})
    print(f"Found {len(results)} results for email search: '{query}'")
    if results:
        print_json(results)
    else:
        print("No results found")

def search_by_phone(query):
    """Search by phone"""
    results = suspect_leaser_lookup.search({"phone": query})
    print(f"Found {len(results)} results for phone search: '{query}'")
    if results:
        print_json(results)
    else:
        print("No results found")

def search_by_address(query):
    """Search by address"""
    results = suspect_leaser_lookup.search({"address": query})
    print(f"Found {len(results)} results for address search: '{query}'")
    if results:
        print_json(results)
    else:
        print("No results found")

def run_demo():
    """Run a demonstration of search capabilities"""
    from app.utils.search_example import demonstrate_lookup
    demonstrate_lookup()

def translate_demo(language="spanish"):
    """Demonstrate translation of suspect leaser flags"""
    results = suspect_leaser_lookup.get_all(limit=1)
    if not results:
        print("No suspect leasers found")
        return
        
    leaser = results[0]
    print("Original flags:")
    print_json(leaser["flags"])
    
    translated = translate_suspect_leaser(leaser, language)
    print(f"\nTranslated flags ({language}):")
    print_json(translated["flags"])

def main():
    """Process command line arguments and run the appropriate function"""
    if len(sys.argv) < 2:
        print(__doc__)
        return

    command = sys.argv[1].lower()
    
    if command == "all":
        skip = sys.argv[2] if len(sys.argv) > 2 else "0"
        limit = sys.argv[3] if len(sys.argv) > 3 else "10"
        list_all(skip, limit)
    elif command == "name" and len(sys.argv) > 2:
        search_by_name(sys.argv[2])
    elif command == "email" and len(sys.argv) > 2:
        search_by_email(sys.argv[2])
    elif command == "phone" and len(sys.argv) > 2:
        search_by_phone(sys.argv[2])
    elif command == "address" and len(sys.argv) > 2:
        search_by_address(sys.argv[2])
    elif command == "demo":
        run_demo()
    elif command == "translate":
        language = sys.argv[2] if len(sys.argv) > 2 else "spanish"
        translate_demo(language)
    else:
        print("Invalid command or missing arguments")
        print(__doc__)

if __name__ == "__main__":
    main() 