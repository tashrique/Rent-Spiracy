# 🛡️ Rent-Spiracy - Hackathon Spec (Updated)

## 🎯 Target Track: **Best People of Color Empowerment Hack**

### 👥 Problem Statement
People of color—especially immigrants, international students, and first-generation renters—are disproportionately targeted by rental scams, predatory lease clauses, and language/legal barriers. Many face:

- Unclear or deceptive lease agreements
- Pressure to sign contracts they don’t understand
- Fear of asking questions due to legal or cultural discomfort
- Lack of access to legal help or trustworthy housing info

### 💡 Solution: Rent-Spiracy
**Rent-Spiracy** is an AI-powered web app that empowers renters—especially people of color—with tools to:
- Detect scams in listings or lease agreements
- Understand lease terms in their own language
- Get personalized advice on what to watch for and what to ask
- Learn tenant rights in a localized, accessible way

The system is multilingual, culturally aware, and provides structured AI-powered risk analysis of rental documents and listings.

---

## 🔄 System Overview

USER FLOW - 
a user comes in first, and the FIRST thing they see popped up is language, and once they select language, every thing fromthen on will be in that lagnauge, the output too. however we re going to have only 3 hardcoded languages english chinese and spanish and hindi and once they select, the language, the interface appears inthat lagnuage and then there is liek a form of renters email or phone or url of listing or address and a file upload to upload lease aggreements. then we parse the pdf and send to backend. the link does a google search and the other info looks for information on the FAKE db we will be having. we will have a google search to find the zillow or craigslist listing but we will get a random terms and conditions and report on that address from a fakeDB  and al lthat information will be passed to gemini including the parsed lease. and then gemini wil lsend to backend the response, scam likeliness, to backend in the language the user specified, maybe strutured output will be good here, backend will send to frontend, if scam likely, backend will flag it in the Database(fakedb) and if the user wants speaking, the backend will send it to elevenlabs to speak in that language (elevenlabs part is stretch faeture but the rest is main feature.)

### 🧭 User Journey Flow
1. **Language Selection Prompt** (required on first visit)
   - Supported: English, Spanish, Chinese (Simplified), Hindi
   - Entire UI and AI output will use this selected language

2. **Scam Detection Form**
   - User submits any or all of:
     - Email / Phone number of landlord
     - URL of the listing
     - Physical address of the unit
     - Lease agreement file (PDF/docx)

3. **Backend Processing**
   - **Lease Parsing**: Extracted text sent to Gemini API for simplification and red flag analysis
   - **Listing Search**: Use Google Custom Search to look up the URL or address across platforms like Zillow, Craigslist
   - **FakeDB Lookup**: Check phone/email/address against a mock database of known scam patterns
   - **Gemini AI**: Given the parsed lease + listing data + FakeDB context, Gemini returns structured JSON with:
     - Scam Likelihood (High/Medium/Low)
     - Explanation of risk factors
     - Simplified clause summaries
     - Suggested questions to ask
     - All output in selected language
   - **Scam Tracking**: If Gemini flags scam, backend logs it in FakeDB with timestamp and reason
   - **Speech Support (Stretch)**: If enabled, Gemini output is sent to ElevenLabs to generate voice response in user’s language

4. **Frontend Display**
   - Renders a complete translated report:
     - Scam Risk Overview
     - Summarized lease clauses
     - Suggested actions/questions
     - Option to listen via ElevenLabs

---

## ✨ Key Features (MVP)

### 1. **Multilingual Entry Flow**
- Language selection on first load (English, Spanish, Chinese, Hindi)
- User interface and AI results are fully translated throughout experience

### 2. **Comprehensive Scam Detection Form**
- Input: phone, email, listing URL, property address, file upload
- Unified processing pipeline for full context-driven AI analysis

### 3. **Lease Translator & Clause Simplifier**
- PDF parsing → Gemini summarization of lease terms into plain language
- Highlights red flags and suspicious conditions

### 4. **Scam Risk Score & Explanation**
- Gemini classifies scam likelihood using inputs and cross-checks
- Outputs structured JSON with reasons, red flags, and clarity

### 5. **FakeDB Check & Auto-Learning**
- Mock database of scams powers cross-verification
- New flagged scams are auto-stored back in FakeDB

---

## 🧠 Future Feature Block: Renter Help & Legal Learning Center

### 1. **Know Your Rights Center**
- Summarized rights by state
- Translated, simplified law explanations for renters

### 2. **AI Legal Learning Bot**
- Gemini-based legal Q&A bot for rental questions

### 3. **Safe Renting Checklist**
- Step-by-step checklist with legal/cultural dos and don'ts

### 4. **Report a Bad Landlord**
- Add new complaints to FakeDB manually (optional)

---

## 🧰 Tech Stack
- **Frontend**: Next.js + Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI**: Gemini API (text summarization + translation), ElevenLabs (speech, optional)
- **Database**: MongoDB Atlas (FakeDB for scam tracking)
- **Search Integration**: Google Custom Search API (for listings)
- **Storage**: Firebase/Supabase for file handling
- **Domain**: `rentspiracy.tech`

---

## 🧪 Stretch Goals
- Text-to-speech playback via ElevenLabs
- Voice-based lease intake via Whisper
- Scam activity heatmap (neighborhood-level)
- Browser extension for listing scraping and risk popups

---

## 📦 Devpost Keywords
```
people of color, immigrant housing, rental scams, lease AI, legal translation, empowerment, Gemini API, MongoDB, beginner-friendly, multilingual, student housing, scam protection, FakeDB, craigslist, international students, accessibility