# ScholarNest — Production Deployment Guide

This guide details how to deploy ScholarNest to production using **Supabase PostgreSQL**, **Render** (Backend API), and **Vercel** (Frontend SPA).

---

## 1. Database Setup: Supabase PostgreSQL

1. **Create a Supabase Project:**
   - Log in to [Supabase](https://supabase.com) and create a new project named `scholarnest-db`.
   - Choose a region close to your primary audience (e.g. `ap-south-1` for India).
   - Set a secure database password and save it.

2. **Execute Schema & Seeds:**
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Open and copy the contents of `database/schema.sql` into the SQL Editor and run it.
   - Next, copy and run the contents of `database/seeds.sql` to populate the 10+ verified scholarships.

3. **Obtain Connection String:**
   - Go to **Project Settings** &rarr; **Database**.
   - Under **Connection string**, select **Nodejs** or **URI**.
   - Copy the URI (format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`).

---

## 2. Backend Deployment: Render

1. **Create a Web Service on Render:**
   - Go to the [Render Dashboard](https://dashboard.render.com) &rarr; **New +** &rarr; **Web Service**.
   - Connect your GitHub repository containing the ScholarNest project.
   - Configure the service settings:
     - **Name:** `scholarnest-api`
     - **Root Directory:** `backend`
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `node src/server.js`

2. **Configure Environment Variables on Render:**
   Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=[GENERATE_A_64_CHAR_HEX_KEY]
   JWT_EXPIRES_IN=7d
   DATABASE_URL=[YOUR_SUPABASE_CONNECTION_STRING]
   GEMINI_API_KEY=[YOUR_GOOGLE_GEMINI_API_KEY]
   CLIENT_URL=https://scholarnest.vercel.app
   ```

3. **Deploy & Verify:**
   - Click **Create Web Service**.
   - Once deployed, visit `https://scholarnest-api.onrender.com/api/health`.
   - Confirm `{ "status": "ONLINE", "database": "healthy" }` is returned.

---

## 3. Deployment: Vercel

ScholarNest supports two production architectures:

### Option A: Unified Full-Stack Deployment on Vercel (Recommended)
Both the Vite frontend SPA and the Express API endpoints (`/api/*`) run directly on Vercel as serverless functions with zero external server dependencies:

1. **Import Project to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com) &rarr; **Add New Project**.
   - Select your ScholarNest repository (`varshinimamidi0206-wq/ScholarNest`).
   - If Root Directory is `frontend`:
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - If Root Directory is root (`.`):
     - Automatically detected by root `vercel.json`.

2. **Configure Environment Variables on Vercel:**
   In **Project Settings &rarr; Environment Variables**, add:
   ```env
   NODE_ENV=production
   JWT_SECRET=your_production_jwt_secret_key
   JWT_EXPIRES_IN=7d
   DATABASE_URL=your_supabase_postgresql_connection_string
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_URL=https://my-scholar-nest.vercel.app
   ```

3. **Routing Configuration (`vercel.json`):**
   Pre-configured to route API requests to `/api/index.js` while serving frontend client-side routes via `/index.html`:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/index.js" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Option B: Separate Backend (e.g. Render / Railway)
If you deploy the Express server separately on Render/Railway:
1. Under Vercel Environment Variables, add:
   ```env
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```
2. The frontend Axios client automatically routes all API calls to your external server.

---

## 4. Production Security Checklist

- [x] Passwords hashed using bcrypt with salt rounds &ge; 10.
- [x] All user database queries verify `user_id = $1` from verified JWT.
- [x] No `GEMINI_API_KEY` or `DATABASE_URL` exposed to client bundle.
- [x] Centralized error middleware suppresses stack traces in production (`NODE_ENV=production`).
- [x] Private uploads stored outside web root with unique UUID/timestamp naming.
- [x] `.env` excluded from version control via `.gitignore`.
- [x] Responsive layout tested across desktop, tablet, and mobile browsers.
