# Full-Stack Deployment Practice App (Render + Vercel + MongoDB)

This project contains a simple task management app designed specifically to help you practice deploying a **Node.js/Express Backend on Render**, a **React/Vite Frontend on Vercel**, and connecting both to a **MongoDB Atlas Cluster**.

---

## 📁 Project Structure

```text
wise-fermi/
├── server/          # Express API (Deploy to Render)
│   ├── index.js     # Entry point & Mongoose setup
│   ├── models/      # Task schema
│   └── package.json
└── client/          # React + Vite (Deploy to Vercel)
    ├── src/         # Main UI component & styles
    └── package.json
```

---

## 🛠️ Step-by-Step Deployment Guide

### STEP 1: Set Up MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in/create a free account.
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (note down your `username` and `password`).
4. Under **Network Access**, click **Add IP Address** -> Select **Allow Access From Anywhere** (`0.0.0.0/0`) so Render can connect to your DB.
5. Click **Database** -> **Connect** -> **Drivers** (Node.js) -> Copy your Connection String (`mongodb+srv://...`).

---

### STEP 2: Deploy Backend to Render
1. Push this repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Fill in the build settings:
   - **Name**: `my-practice-backend` (or your choice)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Scroll down to **Environment Variables** and add:
   - `MONGODB_URI`: `<Your MongoDB Connection String from Step 1>`
   - `CLIENT_URL`: `*` (or your live Vercel URL later for CORS security)
6. Click **Create Web Service**. Wait for the deployment to finish and copy your Render live URL (e.g. `https://my-practice-backend.onrender.com`).

---

### STEP 3: Deploy Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In project setup:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `client`
4. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL`: `<Your Render Backend URL from Step 2>` (e.g., `https://my-practice-backend.onrender.com`)
5. Click **Deploy**.

---

## 💻 Local Development Setup

To run locally before deploying:

### Backend (`/server`):
```bash
cd server
npm install
# Create a .env file with your local or Atlas MONGODB_URI & PORT=5000
npm run dev
```

### Frontend (`/client`):
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
