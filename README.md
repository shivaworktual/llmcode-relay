# LLM Code — 1-Click Google OAuth Relay (Next.js / Vercel)

This lightweight serverless relay allows `llmcode` users to log in to Gmail with **1 click in their browser**, without ever having to configure Google Cloud projects, manage client secrets, or deal with port redirection issues.

---

## 🚀 Quick Deploy to Vercel (2 Minutes)

### Step 1: Get Google OAuth Credentials (One Time Only)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials** → **OAuth Client ID**.
3. Select Application type: **Web application**.
4. Under **Authorized redirect URIs**, add:
   - `https://your-app.vercel.app/api/callback`
   - *(Optional for testing: `http://localhost:3000/api/callback`)*
5. Copy your **Client ID** and **Client Secret**.

---

### Step 2: Deploy to Vercel
1. Push this `relay-server/` folder to GitHub.
2. In [Vercel Dashboard](https://vercel.com/new), import the repository.
3. In **Environment Variables**, add:
   - `GOOGLE_CLIENT_ID`: `your-client-id.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET`: `GOCSPX-your-secret`
   - `NEXT_PUBLIC_APP_URL`: `https://your-app.vercel.app`
4. Click **Deploy**!

---

## 🎯 How Users Log In
In `llmcode`, users simply type:
```bash
/connector
# Or
/gmail login
```
The terminal opens: `https://your-app.vercel.app/api/login?port=...`
User clicks "Sign in with Google" once, and `llmcode` is connected immediately!
