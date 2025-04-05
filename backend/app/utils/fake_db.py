from typing import Dict, List, Optional

# Mock database of known scams
KNOWN_SCAMS = {
    "emails": [
        "scammer@fakeemail.com",
        "landlord.fake@scammail.com",
    ],
    "phones": [
        "+15551234567",
        "+18005551212",
    ],
    "addresses": [
        "123 Fake Street, Scamville, CA 90210",
        "456 Nonexistent Ave, Faketown, NY 10001",
    ],
    "keywords": [
        "wire transfer only",
        "overseas",
        "can't meet in person",
        "send money first",
        "western union",
        "money order only",
    ]
}

# Mock database of reported scams
REPORTED_SCAMS = []


def check_email(email: str) -> bool:
    """Check if an email is in the known scams database"""
    return email in KNOWN_SCAMS["emails"]


def check_phone(phone: str) -> bool:
    """Check if a phone number is in the known scams database"""
    return phone in KNOWN_SCAMS["phones"]


def check_address(address: str) -> bool:
    """Check if an address is in the known scams database"""
    for known_address in KNOWN_SCAMS["addresses"]:
        if address.lower() in known_address.lower():
            return True
    return False


def check_text_for_keywords(text: str) -> List[str]:
    """Check if text contains any scam keywords, return matching keywords"""
    found_keywords = []
    for keyword in KNOWN_SCAMS["keywords"]:
        if keyword.lower() in text.lower():
            found_keywords.append(keyword)
    return found_keywords


def report_scam(data: Dict) -> None:
    """Add a new scam report to the database"""
    REPORTED_SCAMS.append(data)
