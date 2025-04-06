from fastapi import HTTPException, Request
from typing import Dict, Tuple, Callable
from datetime import datetime, timedelta
import time
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from starlette.types import ASGIApp

class RateLimiter(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, requests_per_minute: int = 60):
        super().__init__(app)
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
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        ip = request.client.host
        current_time = time.time()
        
        # Clean old requests
        self._clean_old_requests(ip)
        
        # Initialize requests list for new IPs
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Check rate limit
        if len(self.requests[ip]) >= self.requests_per_minute:
            return Response(
                content="Too many requests. Please try again later.",
                status_code=429
            )
        
        # Add current request
        self.requests[ip].append(current_time)
        
        # Continue processing the request
        response = await call_next(request)
        return response