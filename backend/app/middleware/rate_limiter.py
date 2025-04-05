from fastapi import HTTPException, Request
from typing import Dict, Tuple
from datetime import datetime, timedelta
import time

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = {}
    
    def _clean_old_requests(self, ip: str):
        """Remove requests older than 1 minute"""
        if ip in self.requests:
            current_time = time.time()
            self.requests[ip] = [
                req_time for req_time in self.requests[ip]
                if current_time - req_time < 60
            ]
    
    async def __call__(self, request: Request):
        ip = request.client.host
        current_time = time.time()
        
        # Clean old requests
        self._clean_old_requests(ip)
        
        # Initialize requests list for new IPs
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Check rate limit
        if len(self.requests[ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )
        
        # Add current request
        self.requests[ip].append(current_time)
        
        # Continue processing the request
        return None 