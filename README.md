# 🛡️ Rent-Spiracy

AI-powered rental scam detection and lease understanding tool for people of color, especially immigrants, international students, and first-generation renters.

Frontend deployment: https://rent-spiracy.vercel.app/

Backend Deployment: https://rent-spiracy.onrender.com/

## 🚀 Deployment

This project consists of two main components that can be deployed separately:

### Frontend (Vercel)

1. Push your code to a GitHub repository
2. Import your project to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed backend API
4. Deploy

For more detailed instructions, see the [frontend README](./frontend/README.md).

### Backend (Render)

1. Push your code to a GitHub repository
2. Create a new Web Service in Render dashboard
3. Connect your GitHub repository
4. Select "Docker" as the runtime
5. Set environment variables:
   - `PORT`: 8000
   - `CORS_ORIGINS`: URL of your frontend deployment
6. Deploy

For more detailed instructions, see the [backend README](./backend/README.md).

## 🧰 Tech Stack

- **Frontend**: Next.js 15 + Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI**: Gemini API (text summarization + translation), ElevenLabs (speech, optional)
- **Database**: MongoDB Atlas (FakeDB for scam tracking)
- **Search Integration**: Google Custom Search API (for listings)
- **Storage**: Firebase/Supabase for file handling

## 📁 Project Structure

- **Frontend**: Next.js application with Tailwind CSS
- **Backend**: FastAPI application

## 🚀 Getting Started

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

## ✨ Features

- Multilingual support (English, Spanish, Chinese, Hindi)
- Scam detection in rental listings and lease agreements
- Lease clause simplification and translation
- Red flag identification in rental agreements
- Dark theme UI with accessible contrast
