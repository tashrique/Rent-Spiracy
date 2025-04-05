# 🛡️ Rent-Spiracy

AI-powered rental scam detection and lease understanding tool for people of color, especially immigrants, international students, and first-generation renters.

## Project Structure

- **Frontend**: Next.js application with Tailwind CSS
- **Backend**: FastAPI application

## Getting Started

### Frontend

To run the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend

To run the backend development server:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will be available at http://localhost:8000

The API documentation is available at http://localhost:8000/docs

## Features

- Multilingual support (English, Spanish, Chinese, Hindi)
- Scam detection in rental listings and lease agreements
- Lease clause simplification and translation
- Red flag identification in rental agreements
- Mock database for known scam patterns
