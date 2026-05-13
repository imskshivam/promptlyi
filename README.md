# Promptly — Prompt Marketplace

A full-stack marketplace for buying and selling AI prompts. Built with React (frontend) + Node/Express (backend) + MongoDB.

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **MongoDB** — install locally from https://www.mongodb.com/try/download/community  
  *Or use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster.*

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
# (MongoDB must be running on localhost:27017)
node server.js
```

The backend starts on **http://localhost:4000**.

#### Environment variables (backend)

Copy `.env.example` → `.env` and adjust if needed:

```bash
cp .env.example .env
```

Key variables:

| Variable | Default | Description |
|---|---|---|
| `MONGO_URL` | `mongodb://127.0.0.1:27017` | MongoDB connection string |
| `DB_NAME` | `promptly` | Database name |
| `PORT` | `4000` | Backend port |
| `JWT_SECRET` | *(set one!)* | Secret for signing JWTs |

---

### 2. Seed sample data (optional)

Once the backend is running, seed sample prompts and a demo creator:

```bash
curl -X POST http://localhost:4000/api/dev/seed
```

---

### 3. Frontend

```bash
cd frontend
yarn install   # or: npm install
yarn start     # or: npm start
```

The frontend starts on **http://localhost:3000** and automatically proxies `/api` calls to the backend.

#### Environment variables (frontend)

Create `frontend/.env` (already included):

```
REACT_APP_BACKEND_URL=http://localhost:4000
```

---

## Authentication

This project uses **email + password authentication** (no external OAuth provider needed).

- Register at http://localhost:3000/login
- You start with **50 free credits**
- Choose your role (Creator or Buyer) on first login

---

## Payments (DodoPayments)

Payment features are optional. To enable them, add your DodoPayments API key to `backend/.env`:

```
DODO_PAYMENTS_API_KEY=your_key_here
```

Without a key, payment routes return a graceful error and the rest of the app works normally.

---

## Project Structure

```
promptlyi/
├── backend/
│   ├── server.js          ← Entry point (run this)
│   ├── .env               ← Your local env vars
│   └── src/
│       ├── config/        ← DB, env, Dodo setup
│       ├── middleware/     ← JWT auth, error handler
│       ├── routes/        ← All API routes
│       ├── services/      ← Credit engine, Dodo service
│       └── utils/         ← Time helpers
└── frontend/
    ├── src/
    │   ├── components/    ← Shared UI components
    │   ├── context/       ← AuthContext (global auth state)
    │   ├── pages/         ← Route-level pages
    │   └── lib/           ← axios instance, utilities
    └── .env               ← Frontend env vars
```

> **Note:** `backend/server.py` is a legacy file from the original Emergent platform deployment. You can ignore it — run `node server.js` directly.
