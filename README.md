# 🛡️ Rent-Spiracy

AI-powered rental scam detection and lease understanding tool for people of color, especially immigrants, international students, and first-generation renters.

# LIVE deployment: https://www.rentspiracy.tech/

Frontend deployment: https://rent-spiracy.vercel.app/

Backend Deployment: https://rent-spiracy.onrender.com/

## 💡 Inspiration

As international students and first-time renters ourselves, we saw countless stories of immigrants and international students falling for predatory rental scams. Many leases are written in confusing legal jargon or foreign languages, and background checks on landlords are nearly impossible. We built [Rent-Spiracy](https://www.rentspiracy.tech/) to protect vulnerable communities - especially people of color, international students, immigrants, and first-generation renters - by making leases understandable and scammers accountable.

## 🧠 What It Does

Rent-Spiracy is an Gemini-powered web app that helps renters detect scams and understand leases, with multilingual support and tools built for accessibility. Users can:

- Select the language they speak (currently supports 8 - English, Bengali, Hindi, Chinese, Korean, Swahili, Arabic, Spanish)
- Upload a lease (PDF/image) and get a simplified, translated analysis of the lease in their chosen language
- Receive scam and red-flag clause detection comparing to the state laws
- Get scam-likeliness score 0-100 and riskiness score
- Get followup questions to ask to the landlord about the lease
- Find region-specific, language-matching tenant lawyers
- Search or report scam landlords (with evidence handling)

## 🛠️ How We Built It

We built Rent-Spiracy as a full-stack app using:

- **Frontend**: Next.js 15 + Tailwind CSS (Vercel), built for accessibility with dark mode and keyboard/screen reader support
- **Backend**: FastAPI (Python), containerized with Docker and deployed via Render
- **Database**: MongoDB Atlas, storing suspect landlords, reports, and multilingual lawyer profiles
- **AI**: Gemini API for clause summarization and translation; prompt-engineered for legal clarity and scam detection

> We prioritized performance and **accessibility**, ensuring the application works well on mobile devices with limited connectivity, which is essential for our target users. 

## 🧗 Challenges we ran into

One of our biggest technical and human challenges was training Gemini to meaningfully simplify and analyze lease documents. Most leases are dense, inconsistent, and full of legalese. Words like "indemnify," "arbitration clause," or "right of entry" may be harmless in one lease but suspicious in another depending on how they’re phrased. This meant we couldn’t just prompt the model to “simplify” or “translate.” We had to teach it how to interpret context.

We iterated through dozens of prompts to get Gemini to not just summarize, but **spot specific risk indicators** - such as vague payment terms, hidden renewal clauses, or restrictions that disproportionately harm tenants. Often, the model would either oversimplify (losing critical details) or flag generic clauses as scams. To fix this, we broke down the pipeline:
- First, we extracted raw text from leases (OCR preprocessing, removing headers, footers, and non-content text)
- Then, we chunked clauses by sections - e.g., payments, maintenance, rights, dispute resolution
- Each chunk was passed into Gemini with **targeted prompts**: one for simplification, one for red-flag analysis
- Finally, we used rule-based post-processing to **cross-reference flagged clauses** with a curated list of known scam patterns

This architecture helped us reduce hallucinations, minimize false positives.


## 🏆 Accomplishments that we're proud of

We didn’t want Rent-Spiracy to be just another AI wrapper or frontend demo. We wanted it to work for *real people* - many of whom don’t speak English, have low digital literacy, or don’t trust systems that rely on Google or Meta. This led us to build our own **self-contained multilingual fallback system**, decoupled from third-party translation APIs.

It started with realizing that lease analysis isn’t just a translation problem - it’s a **localization** and **trust** problem. If a user uploads a lease in Hindi or Bengali and gets AI output in English legalese, we’ve failed them. But relying on Google Translate introduces bias, latency, and privacy concerns. So we built:

- **Custom translation dictionaries** and rule-based grammatical transformations for 8 languages (on both frontend and backend)
- **A fallback pipeline** where if Gemini translation fails or rate-limits, users still get accurate, fast results from our local engine
- Continuous testing with real users who speak Hindi, Korean, and Bengali to tune output readability and clarity
- UI-level design decisions that prioritized readability over design flash - larger font sizes, full keyboard nav, RTL support, high-contrast dark mode

Current accessibility supports include - Skip-to-content links and keyboard navigation, ARIA live regions for screen reader announcements, Offline detection with visible indicators, Reduced motion support for vestibular disorders, Improved color contrast and text spacing, Touch-friendly mobile optimizations, Semantic HTML with proper ARIA attributes, Keyboard-navigable UI components, PWA support with manifest.json, Focus management for screen readers, High contrast mode support, Loading state indicators with reduced animations, Cognitive accessibility improvements, Responsive design for low bandwidth environments

> Our website architecture and UI follow the [U.S. Section 508 accessibility standards](https://www.section508.gov/manage/laws-and-policies/)

This system isn't flashy, but it’s **resilient**. It means Rent-Spiracy can work in areas with poor connectivity, without sharing user data externally, and with translations tuned for *legal clarity*, not marketing speak. We learned that accessibility is about dignity. And that required engineering effort.

## 📚 What we learned

Early in the build, we thought accessibility meant adding alt text, ARIA labels, and contrast-compliant colors. But when we tested the app with users whose primary language wasn’t English (I convinced my aunt to spend 3 hours with me today testing this app lol)—or who were unfamiliar with legal documents entirely—our assumptions started breaking. The UI looked clean to us, but it was **cognitively inaccessible**.

We started asking: what happens if the user is stressed, reading in their second or third language, and only has a phone to work with? This shifted how we approached engineering.

We redesigned components with **semantic chunking** of text—grouping clauses into “what you pay,” “what they can do,” and “what you can’t do.” This wasn't just visual; it changed the way we structured our API responses and AI prompts. We also added inline definitions for legal terms, not just as hover-tooltips (which don’t work well on mobile) but as expandable blocks readable by screen readers.

That process taught us that **accessibility is a debugging framework**—when your interface works for the most overloaded, under-resourced user, it will work better for everyone else too. And in our case, that user was often a person of color, an immigrant, or a first-generation renter trying to navigate an exploitative system in silence.


## 🚀 What's next for RentSpiracy
We realized that Rent-Spiracy doesn’t just analyze leases—it captures stories. Every time someone flags a suspicious landlord, every time a clause gets labeled "exploitative," it reflects real harm. But right now, that knowledge is siloed to the user. We want to change that by turning Rent-Spiracy into a **community-sourced database of rental scams**, organized by region, landlord identity, and document type.

Imagine you’re a Nigerian student in Queens seeing a listing on Craigslist. You upload the lease to Rent-Spiracy, and it tells you: “⚠️ This lease matches two other scam patterns reported by users in your area. Here’s what to watch for.” That’s not just helpful—that’s **networked protection**.

To build this, we’ll use MongoDB Atlas to link new scam reports with known flags via fuzzy matching on lease text and leaser metadata. Reports will be anonymized but structured for public analysis. And we’ll surface recurring scam tactics—like fraudulent application fees or invasive entry rights—to empower not just individuals, but **communities of renters**, especially in underrepresented zip codes where legal help is scarce.

Hope you had a great time reading through this. 
- 🇺🇸 **English**: Thank you  
- 🇪🇸 **Spanish**: Gracias  
- 🇨🇳 **Chinese (Simplified)**: 谢谢 (Xièxiè)  
- 🇮🇳 **Hindi**: धन्यवाद (Dhanyavaad)  
- 🇰🇷 **Korean**: 감사합니다 (Gamsahamnida)  
- 🇧🇩 **Bengali**: ধন্যবাদ (Dhonnobad)  
- 🌍 **Swahili**: Asante  
- 🇸🇦 **Arabic**: شكراً (Shukran)


(Tashrique Ahmed)[www.tashrique.com]
Brian
Arpan

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
   - `MONGO_URI`: MongoDB connection string
   - `DATABASE_NAME`: MongoDB database name (default: rent-spiracy)
6. Deploy

For more detailed instructions, see the [backend README](./backend/README.md).


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

### Database Setup

This project uses MongoDB for storing lawyer directory information. You'll need to:

1. Create a MongoDB database (local or MongoDB Atlas)
2. Add your MongoDB connection string to a `.env` file in the backend directory:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rent-spiracy
   DATABASE_NAME=rent-spiracy
   ```
3. Seed the lawyer database:
   ```bash
   cd backend
   ```


## 📚 Lawyer Directory API

The API provides endpoints for accessing the lawyer directory:

- `GET /lawyers` - Get all lawyers with optional filtering by language and region
- `GET /lawyers/{lawyer_id}` - Get a specific lawyer by ID
- `GET /lawyers/filter/by-language/{language}` - Get lawyers by language

Example usage:

```bash
# Get all lawyers
curl http://localhost:8000/lawyers

# Get lawyers who speak Spanish
curl http://localhost:8000/lawyers?language=spanish

# Get lawyers in the West region
curl http://localhost:8000/lawyers?region=West
```