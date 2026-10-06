# ScholarNest — Full-Stack AI Scholarship Discovery Platform

**Tagline:** Your Path to the Right Scholarship  
**AI Assistant:** NestGuide  

ScholarNest is a production-ready, full-stack web application designed to help higher education students discover scholarships matching their academic performance, family income, course, state quota, and social reservation category.

Built for hackathons and production deployment, ScholarNest pairs a **deterministic mathematical matching engine** with **Google Gemini AI (NestGuide)** called strictly from the secure backend.

---

## Key Features

1. **Deterministic Matching Engine (100 Points Total)**:
   - Evaluates scholarships without AI hallucinations:
     - Academic Performance: **25 Points**
     - Family Income Ceiling: **20 Points**
     - Degree & Stream Fit: **20 Points**
     - State Quota & Nativity: **15 Points**
     - Social / Reservation Category: **10 Points**
     - Gender, Age, and Special Quotas: **10 Points**
   - Calculates dynamic scores point-by-point; never hardcoded.

2. **NestGuide AI Assistant**:
   - Floating contextual assistant powered by Google Gemini (called only from backend).
   - Explains *“Why am I eligible?”* based on the exact deterministic result.
   - Multilingual guidance supporting **English**, **Telugu (తెలుగు)**, and **Hindi (हिंदी)**.

3. **8-Stage Application Lifecycle Tracker**:
   - `SAVED` &bull; `INTERESTED` &bull; `DOCUMENTS_PREPARING` &bull; `READY_TO_APPLY` &bull; `APPLIED` &bull; `UNDER_REVIEW` &bull; `SELECTED` &bull; `REJECTED`
   - Attach reference numbers, custom notes, and submission timestamps.

4. **Document Readiness & AI Analysis**:
   - Private storage for Income, Caste, Marksheets, and Bonafide certificates.
   - AI document verification returns structured JSON with readability checks, issue lists, and readiness classification (`Ready`, `Needs Attention`, `Under Review`).

5. **Dynamic Dashboard & Deadline Protection**:
   - Real-time profile completion meter.
   - Automated deadline countdowns highlighting urgent opportunities (&le; 14 days).
   - Zero hardcoded statistics.

6. **Scholarship Comparison Tool**:
   - Side-by-side criteria matrix comparing up to 3 schemes simultaneously.

---

## Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (Clean education startup aesthetic, no emojis)
- **Routing:** React Router v7
- **Icons:** Lucide React
- **HTTP Client:** Centralized Axios instance with JWT interceptors

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Tokens) with Bearer headers
- **Security:** bcryptjs password hashing (salt rounds: 10), Zod schema validation
- **File Handling:** Multer private upload middleware

### Database
- **PostgreSQL / Supabase:** Standard PostgreSQL schema with UUID primary keys, indexes, and constraints.
- **Relational Fallback:** Integrated persistent relational engine for out-of-the-box zero-config hackathon execution.

### Artificial Intelligence
- **LLM:** Google Gemini API (`gemini-1.5-flash`)
- **Execution:** Strictly backend-only. Never exposes API keys or internal prompts to the browser.
- **Caching:** AI outputs cached in `ai_outputs` table with SHA-256 input hashing.

---

## Project Structure

```
scholarnest/
├── frontend/
│   ├── public/assets/scholarnest-logo.svg
│   ├── src/
│   │   ├── components/         # ScholarshipCard, EligibilityModal, NestGuideModal, ProtectedRoute
│   │   ├── layouts/            # Navbar, Footer, AppLayout
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Profile, Scholarships, Details, Compare, Applications, Saved, Documents
│   │   ├── services/api.js     # Centralized Axios client
│   │   ├── hooks/useAuth.jsx   # Auth context & hook
│   │   ├── App.jsx             # React Router hierarchy
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection, env loader
│   │   ├── controllers/        # Auth, Profile, Scholarships, Matching, Applications, Documents, AI, Dashboard, Notifications
│   │   ├── routes/             # Express route endpoints
│   │   ├── services/           # Deterministic matchingService, aiService (Gemini)
│   │   ├── middleware/         # JWT auth, errorHandler, multer
│   │   ├── validators/         # Zod schemas
│   │   └── server.js           # Express app entry point
│   ├── package.json
│   └── uploads/                # Private encrypted document files
│
├── database/
│   ├── schema.sql              # Supabase PostgreSQL schema
│   └── seeds.sql               # Realistic verified scholarship seed data
│
├── README.md
├── ARCHITECTURE.md
├── AI_INTEGRATION.md
├── DEPLOYMENT_GUIDE.md
├── .env.example
└── .gitignore
```

---

## Quick Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Environment Configuration
Create a `.env` file in the project root (or inside `backend/`):
```bash
cp .env.example .env
```
Populate your environment variables:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install & Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

### 4. Install & Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## API Overview

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/auth/me` | Fetch authenticated user | Yes |
| GET/PUT | `/api/profile` | Get or update student profile | Yes |
| GET | `/api/scholarships` | Search, filter, and sort scholarships | Optional |
| GET | `/api/scholarships/:id` | Get scholarship details & dynamic match | Optional |
| GET | `/api/matches` | Rank all scholarships by match score | Yes |
| GET/POST/DEL | `/api/saved` | Manage bookmarked scholarships | Yes |
| GET/POST/PUT/DEL | `/api/applications` | Manage 8-stage application pipeline | Yes |
| GET/POST/DEL | `/api/documents` | Upload & manage private documents | Yes |
| POST | `/api/documents/:id/analyze`| Gemini AI document verification | Yes |
| POST | `/api/ai/eligibility-explanation`| Gemini AI explanation of match score | Yes |
| POST | `/api/ai/nestguide` | Interactive multilingual AI assistant | Optional |
| GET | `/api/dashboard` | Aggregated dynamic student metrics | Yes |
| GET | `/api/notifications` | User notifications & alerts | Yes |
| GET | `/api/health` | Service and database health status | No |

---

## Complete Demo Flow

1. **Landing Page**: View value proposition, how the deterministic engine works, and platform features.
2. **Registration**: Sign up (`/register`) & login (`/login`).
3. **Student Profile**: Complete the 19 criteria (`/profile`) — watch the profile completion meter update.
4. **Dashboard**: Inspect real matching count, upcoming deadlines, and pipeline distribution (`/dashboard`).
5. **Scholarship Discovery**: Filter by stream, state, category, and minimum amount (`/scholarships`).
6. **Eligibility Check**: Click *“Check My Eligibility”* on any card to view the 100-point breakdown.
7. **Ask NestGuide**: Click *“Why Am I Eligible?”* for instant Gemini AI explanation.
8. **Document Upload**: Add an Income Certificate in `/documents` and click *“AI Verify Document”*.
9. **Track Application**: Advance an opportunity through the 8 stages (`/applications`).
10. **Multilingual AI**: Open floating NestGuide in Telugu or Hindi for native guidance.
