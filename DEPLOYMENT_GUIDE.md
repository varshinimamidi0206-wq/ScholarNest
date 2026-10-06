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

## 3. Frontend Deployment: Vercel

1. **Import Project to Vercel:**
   - Go to the [Vercel Dashboard](https://vercel.com) &rarr; **Add New Project**.
   - Select your ScholarNest repository.
   - Configure build settings:
     - **Framework Preset:** `Vite`
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

2. **Configure Environment Variables on Vercel:**
   Under **Environment Variables**, add:
   ```env
   VITE_API_URL=https://scholarnest-api.onrender.com/api
   ```

3. **Single-Page Application (SPA) Routing Configuration:**
   Create a `vercel.json` file inside `frontend/` (already pre-configured) to handle React Router client rewrites:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

4. **Deploy:**
   - Click **Deploy**.
   - Test navigation across all pages (`/dashboard`, `/scholarships`, `/profile`, `/applications`).

---

## 4. Production Security Checklist

- [x] Passwords hashed using bcrypt with salt rounds &ge; 10.
- [x] All user database queries verify `user_id = $1` from verified JWT.
- [x] No `GEMINI_API_KEY` or `DATABASE_URL` exposed to client bundle.
- [x] Centralized error middleware suppresses stack traces in production (`NODE_ENV=production`).
- [x] Private uploads stored outside web root with unique UUID/timestamp naming.
- [x] `.env` excluded from version control via `.gitignore`.
- [x] Responsive layout tested across desktop, tablet, and mobile browsers.
