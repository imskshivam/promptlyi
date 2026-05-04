# Promptly — Backend Architecture (post Python → Node migration)

## Why a Python shim still exists
The platform's `supervisor.conf` is read-only and pinned to `uvicorn server:app --host 0.0.0.0 --port 8001`. We can't change supervisor, so `/app/backend/server.py` is now a **70-line Starlette ASGI proxy** whose only jobs are:
1. Spawn `node server.js` on internal port 8002 at uvicorn startup (and reap it on shutdown).
2. Forward every HTTP request (method, path, query, body, headers, cookies) to Node and return the response verbatim — preserving multi-value headers like `Set-Cookie`.

All business logic lives in Node. The Python file contains zero application code.

## Folder structure

```
/app/backend
├── server.py                 # uvicorn entrypoint → ASGI proxy → Node
├── server.js                 # Node entrypoint (express)
├── package.json
├── requirements.txt          # only proxy needs (httpx, starlette via uvicorn)
├── .env                      # shared by both processes
└── src
    ├── app.js                # express app factory, mounts /api routes
    ├── config
    │   ├── env.js            # all env vars in one place
    │   ├── db.js             # MongoDB native driver — connect/getDb/closeDb
    │   └── dodo.js           # Dodo Payments SDK init (test_mode)
    ├── middleware
    │   ├── auth.js           # getCurrentUser, requireBusiness
    │   └── errorHandler.js   # asyncH wrapper, HttpError, 404, error handler
    ├── routes
    │   ├── auth.js           # /api/auth/{session,me,logout,role}
    │   ├── prompts.js        # /api/credit-estimate, /api/prompts*, /api/purchases
    │   ├── credits.js        # /api/credits/{packs,buy,history}
    │   ├── subscriptions.js  # /api/subscriptions/{plans,subscribe,mine}
    │   ├── payments.js       # /api/payments/confirm   (Dodo redirect verifier)
    │   ├── creators.js       # /api/creators/{trending,:id}
    │   ├── dashboard.js      # /api/dashboard/{creator-stats,creator-revenue,creator-sales}
    │   ├── payouts.js        # /api/payouts/{config,request,history}
    │   ├── customWorks.js    # /api/custom-works (CRUD + apply + mine)
    │   └── dev.js            # /api/dev/seed
    ├── services
    │   ├── creditEngine.js   # token-based credit estimator
    │   └── dodoService.js    # createCheckout / paymentSucceeded / subscriptionSucceeded
    └── utils
        └── time.js           # iso, ymd, yearMonth, yearWeek helpers
```

## Stack

- **Runtime**: Node v20.20.2
- **HTTP**: Express 4.21
- **DB**: `mongodb` official driver 6.x (no Mongoose — same shape as previous Motor/Pymongo usage)
- **Auth**: Emergent Google OAuth via `POST /api/auth/session` (X-Session-ID header → exchange via demobackend.emergentagent.com → cookie `session_token`)
- **Payments**: Dodo Payments JS SDK 1.50 (test_mode) — `createCheckout`, `paymentSucceeded`, `subscriptionSucceeded`
- **Logging**: console (captured by supervisor stdout/stderr files)

## Verified endpoints (via proxy)

| Endpoint | Method | Status |
| --- | --- | --- |
| `/api/` | GET | 200 ✅ |
| `/api/dev/seed` | POST | 200 ✅ |
| `/api/prompts` | GET | 200 ✅ (4 seeded prompts) |
| `/api/credits/packs` | GET | 200 ✅ (3 packs) |
| `/api/subscriptions/plans` | GET | 200 ✅ (3 plans) |
| `/api/creators/trending` | GET | 200 ✅ |
| `/api/payouts/config` | GET | 200 ✅ |
| `/api/credit-estimate` | POST | 200 ✅ |
| `/api/auth/me` | GET (no cookie) | 401 ✅ |
| `/api/prompts/mine` | GET (no cookie) | 401 ✅ |
| `/api/dashboard/creator-stats` | GET (no cookie) | 401 ✅ |

## Operations

- **Restart backend**: `sudo supervisorctl restart backend` — restarts uvicorn which respawns Node.
- **Logs**: `tail -n 100 /var/log/supervisor/backend.{err,out}.log` (Node stdout/stderr inherit, so they appear here too).
- **Local dev (Node only, bypass proxy)**: `cd /app/backend && PORT=8002 node server.js`.
