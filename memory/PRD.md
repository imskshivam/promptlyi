# Promptly — Prompt Marketplace · PRD

## Original problem statement
Build a prompt marketplace with two user types (business creator + normal user). Creators list prompts with image/video examples. Some prompts are restricted (credits required), others are direct-buy in INR. Built-in credit estimation engine auto-prices prompts. Three subscription tiers for creators (199/499/899 INR). Credit packs for users. Custom-work request board (post tasks, prompt engineers apply). Dynamic country pricing. Reference video: Wello-style modern SaaS landing.

## Architecture
- **Backend**: FastAPI + Motor (MongoDB) — single `server.py`
- **Frontend**: React 19 + Tailwind + Shadcn UI + Recharts, editorial design (Cabinet Grotesk + Satoshi, warm sand bg, vermilion + cobalt accents)
- **Auth**: Emergent-managed Google OAuth (session-data exchange → `session_token` cookie)
- **Payments**: Dodo Payments (currently MOCKED — no API keys yet)
- **Object storage**: integration playbook gathered, not yet wired (uploads use external URLs for now)

## Implemented (Iter 1 + 2 — Feb 2026)
- Brand: **Promptly** (renamed from PromptBazaar)
- Landing: hero "Earn money through prompts", animated brand marquee (smooth fade edges, hover-pause), how-it-works cards, featured-prompts grid, credit-engine showcase, testimonials, final CTA
- Marketplace: Top-Trending-Creators row + All-Prompts grid + category filters + search
- Prompt detail: preview-locked content, restricted/required-media badges, instructions, buy-with-credits or buy-with-money
- Creator profile (public)
- Creator dashboard tabs:
  - **Create Prompt** — full form with reference-media URL, "requires user image/video?" toggle + instructions, restricted/price toggle, **live credit-engine sidebar**
  - **My Prompts** — list with delete
  - **Revenue** — line + bar charts (Recharts) with **interval switcher (30D / 12W / 12M)**
  - **Sales** — list of every purchase of creator's prompts
  - **Payouts** — request payout (5% commission preview), payout history (MOCKED)
- User dashboard: wallet (credit packs), purchases (transaction history), custom-work requests
- Pricing page: creator subscriptions (199/499/899) + user credit packs (toggle)
- Custom Works board: list/apply
- Onboarding: role selection (business / normal) on first sign-in
- Free creator registration (no paywall to publish; subscription is optional upgrade)
- Backend endpoints (key):
  - `auth/session`, `auth/me`, `auth/role`, `auth/logout`
  - `prompts` (GET list, POST, GET id, PUT, DELETE), `prompts/mine`, `prompts/purchase`
  - `credit-estimate`, `credits/packs`, `credits/buy`, `credits/history`
  - `subscriptions/plans`, `subscriptions/subscribe`, `subscriptions/mine`
  - `creators/trending`, `creators/{id}`
  - `dashboard/creator-stats`, `dashboard/creator-revenue?interval=`, `dashboard/creator-sales`
  - `payouts/request` (5% commission), `payouts/history`
  - `custom-works` (CRUD + apply + mine), `dev/seed`

## P0 Backlog
- Wire real Dodo Payments (subscriptions, credit packs, prompt purchases) — currently MOCKED
- Wire Emergent object storage for prompt example uploads (currently URL-only)
- Dynamic country pricing UI (detect country, show converted price)

## P1 Backlog
- Admin moderation panel (currently absent)
- Reviews / ratings on prompts
- Email notifications (sale, payout, new applicant)
- Search relevance + tag-based discovery

## P2 Backlog
- Featured-prompt placement marketplace (creator pays to feature)
- Affiliate / referral system
- Prompt versioning + collaborative edits
