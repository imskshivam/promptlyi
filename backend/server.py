"""
Promptly backend — FastAPI + MongoDB (Motor).
Features: Emergent Google Auth, Prompt CRUD, Credits, Subscriptions, Custom Works, Dodo Payments.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from pathlib import Path
from datetime import datetime, timezone, timedelta
import os
import uuid
import logging
import re
import httpx

try:
    from dodopayments import AsyncDodoPayments
    HAS_DODO_SDK = True
except ImportError:
    HAS_DODO_SDK = False

# ---------- setup ----------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Promptly API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- Dodo Payments client ----------
DODO_API_KEY = os.environ.get("DODO_PAYMENTS_API_KEY", "").strip()
DODO_ENV = os.environ.get("DODO_ENVIRONMENT", "test_mode").strip()
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "").strip()

DODO_PRODUCTS = {
    "sub_basic": os.environ.get("DODO_PROD_SUB_BASIC", "").strip(),
    "sub_pro": os.environ.get("DODO_PROD_SUB_PRO", "").strip(),
    "sub_elite": os.environ.get("DODO_PROD_SUB_ELITE", "").strip(),
    "pack_starter": os.environ.get("DODO_PROD_PACK_STARTER", "").strip(),
    "pack_pro": os.environ.get("DODO_PROD_PACK_PRO", "").strip(),
    "pack_max": os.environ.get("DODO_PROD_PACK_MAX", "").strip(),
    "prompt": os.environ.get("DODO_PROD_PROMPT", "").strip(),
}

dodo_client: Optional["AsyncDodoPayments"] = None
if HAS_DODO_SDK and DODO_API_KEY:
    try:
        dodo_client = AsyncDodoPayments(bearer_token=DODO_API_KEY, environment=DODO_ENV)
        logger.info(f"Dodo Payments client initialised (env={DODO_ENV})")
    except Exception as e:
        logger.exception(f"Failed to init Dodo client: {e}")


def utc_now():
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat()


# ---------- Models ----------
class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: Optional[Literal["business", "normal"]] = None
    credits: int = 0
    subscription_plan: Optional[str] = None
    bio: Optional[str] = None
    created_at: str


class RoleSelect(BaseModel):
    role: Literal["business", "normal"]


class PromptCreate(BaseModel):
    title: str
    description: str
    content: str
    preview_url: Optional[str] = None
    media_type: Literal["image", "video"] = "image"
    category: str
    tags: List[str] = []
    price_inr: int = 0
    is_restricted: bool = False
    requires_user_media: Literal["none", "image", "video"] = "none"
    user_media_instructions: Optional[str] = ""


class PromptUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    preview_url: Optional[str] = None
    media_type: Optional[Literal["image", "video"]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    price_inr: Optional[int] = None
    is_restricted: Optional[bool] = None
    requires_user_media: Optional[Literal["none", "image", "video"]] = None
    user_media_instructions: Optional[str] = None


class PayoutRequest(BaseModel):
    amount_inr: int


class CreditEstimateBody(BaseModel):
    text: str


class PurchaseRequest(BaseModel):
    prompt_id: str
    method: Literal["credits", "money"]


class CreditPackRequest(BaseModel):
    pack_id: str  # "starter" | "pro" | "max"


class SubscribeRequest(BaseModel):
    plan_id: str  # "basic" | "pro" | "elite"


class CustomWorkCreate(BaseModel):
    title: str
    description: str
    budget_inr: int
    deadline_days: int = 7
    category: str = "general"


class CustomWorkApply(BaseModel):
    message: str
    quoted_price_inr: int


# ---------- Dodo Payments helpers ----------
async def create_dodo_checkout(
    *,
    product_id: str,
    customer: dict,
    return_path: str,
    metadata: dict,
    quantity: int = 1,
) -> dict:
    """Create a Dodo Payments checkout session and return the redirect URL."""
    if not dodo_client:
        raise HTTPException(503, "Dodo Payments is not configured. Set DODO_PAYMENTS_API_KEY.")
    if not product_id:
        raise HTTPException(503, "Product ID not configured. Please add the matching DODO_PROD_* env var.")

    return_url = f"{FRONTEND_ORIGIN}{return_path}"
    try:
        session = await dodo_client.checkout_sessions.create(
            product_cart=[{"product_id": product_id, "quantity": quantity}],
            customer={"email": customer["email"], "name": customer.get("name") or customer["email"]},
            billing_address={"country": "IN", "city": "NA", "state": "NA", "street": "NA", "zipcode": "000000"},
            return_url=return_url,
            metadata=metadata,
        )
        # SDK returns object with attributes; convert to dict
        return {
            "session_id": getattr(session, "session_id", None) or getattr(session, "id", None),
            "checkout_url": getattr(session, "checkout_url", None) or getattr(session, "url", None),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Dodo checkout creation failed")
        raise HTTPException(502, f"Dodo Payments error: {str(e)}")


async def dodo_payment_succeeded(payment_id: str) -> Optional[dict]:
    """Retrieve a Dodo payment and return its metadata if status == succeeded. None otherwise."""
    if not dodo_client or not payment_id:
        return None
    try:
        p = await dodo_client.payments.retrieve(payment_id)
    except Exception as e:
        logger.warning(f"Dodo retrieve failed for {payment_id}: {e}")
        return None
    status_val = getattr(p, "status", None) or (p.get("status") if isinstance(p, dict) else None)
    if str(status_val).lower() != "succeeded":
        return None
    metadata = getattr(p, "metadata", None) or (p.get("metadata") if isinstance(p, dict) else {}) or {}
    return {"status": status_val, "metadata": metadata, "payment_id": payment_id}


# ---------- Auth helpers ----------
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("session_token") or request.headers.get("authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    sess = await db.sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=401, detail="Invalid session")
    if datetime.fromisoformat(sess["expires_at"]) < utc_now():
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"id": sess["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_business(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "business":
        raise HTTPException(status_code=403, detail="Business role required")
    return user


# ---------- Auth routes ----------
@api.post("/auth/session")
async def auth_session(request: Request, response: Response):
    """Exchange Emergent Auth session_id (from X-Session-ID header) for a user session."""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing X-Session-ID header")
    try:
        async with httpx.AsyncClient(timeout=10) as hc:
            r = await hc.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
            )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Emergent session")
        data = r.json()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("auth exchange failed")
        raise HTTPException(status_code=500, detail=f"Auth failed: {e}")

    email = data.get("email")
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture")
    emergent_session = data.get("session_token")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user = existing
    else:
        user = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": name,
            "picture": picture,
            "role": None,
            "credits": 50,  # welcome credits
            "subscription_plan": None,
            "bio": "",
            "created_at": iso(utc_now()),
        }
        await db.users.insert_one(user.copy())

    session_token = emergent_session or str(uuid.uuid4())
    expires_at = utc_now() + timedelta(days=7)
    await db.sessions.delete_many({"user_id": user["id"]})
    await db.sessions.insert_one({
        "session_token": session_token,
        "user_id": user["id"],
        "expires_at": iso(expires_at),
    })

    response.set_cookie(
        "session_token", session_token,
        httponly=True, secure=True, samesite="none",
        path="/", max_age=7 * 24 * 3600,
    )
    user.pop("_id", None)
    return {"user": user, "session_token": session_token}


@api.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return UserPublic(**user)


@api.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api.post("/auth/role", response_model=UserPublic)
async def select_role(body: RoleSelect, user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": user["id"]}, {"$set": {"role": body.role}})
    user["role"] = body.role
    return UserPublic(**user)


# ---------- Credit estimation engine (simple token-based) ----------
def estimate_credits(text: str) -> dict:
    words = len(re.findall(r"\w+", text or ""))
    # complexity factor by keywords
    complexity_keywords = ["step-by-step", "analyze", "json", "code", "full", "detailed", "advanced"]
    complexity = sum(1 for k in complexity_keywords if k in (text or "").lower())
    base = max(1, words // 8)  # 1 credit per ~8 words
    total = base + complexity * 2
    tier = "basic" if total <= 5 else "standard" if total <= 15 else "advanced"
    return {"credits": total, "words": words, "complexity": complexity, "tier": tier}


@api.post("/credit-estimate")
async def credit_estimate(body: CreditEstimateBody):
    return estimate_credits(body.text)


# ---------- Prompts ----------
def _prompt_public_doc(doc: dict, hide_content: bool = True) -> dict:
    doc = dict(doc)
    doc.pop("_id", None)
    if hide_content:
        doc["content"] = None  # hide until purchased / owned
    return doc


@api.get("/prompts")
async def list_prompts(
    q: Optional[str] = None,
    category: Optional[str] = None,
    media_type: Optional[str] = None,
    only_free: Optional[bool] = False,
    limit: int = 50,
):
    query: dict = {"published": True}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$in": [q.lower()]}},
        ]
    if category:
        query["category"] = category
    if media_type:
        query["media_type"] = media_type
    if only_free:
        query["price_inr"] = 0
    cursor = db.prompts.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
    results = []
    async for d in cursor:
        creator = await db.users.find_one({"id": d["creator_id"]}, {"_id": 0, "name": 1, "picture": 1, "id": 1})
        d["creator"] = creator
        results.append(_prompt_public_doc(d))
    return results


@api.get("/prompts/mine")
async def my_prompts(user: dict = Depends(require_business)):
    cursor = db.prompts.find({"creator_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
    return [d async for d in cursor]


@api.get("/prompts/{prompt_id}")
async def get_prompt(prompt_id: str, request: Request):
    p = await db.prompts.find_one({"id": prompt_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Prompt not found")
    creator = await db.users.find_one({"id": p["creator_id"]}, {"_id": 0, "name": 1, "picture": 1, "id": 1, "bio": 1})
    p["creator"] = creator

    # determine if we should reveal content
    reveal = False
    try:
        user = await get_current_user(request)
        if user["id"] == p["creator_id"]:
            reveal = True
        else:
            purchase = await db.purchases.find_one({"user_id": user["id"], "prompt_id": prompt_id})
            if purchase:
                reveal = True
    except HTTPException:
        pass
    return _prompt_public_doc(p, hide_content=not reveal)


@api.post("/prompts")
async def create_prompt(body: PromptCreate, user: dict = Depends(require_business)):
    est = estimate_credits(body.content)
    doc = {
        "id": str(uuid.uuid4()),
        "creator_id": user["id"],
        "title": body.title,
        "description": body.description,
        "content": body.content,
        "preview_url": body.preview_url or "",
        "media_type": body.media_type,
        "category": body.category,
        "tags": [t.lower() for t in body.tags],
        "price_inr": body.price_inr,
        "credits_required": est["credits"],
        "is_restricted": body.is_restricted,
        "requires_user_media": body.requires_user_media,
        "user_media_instructions": body.user_media_instructions or "",
        "published": True,
        "downloads": 0,
        "rating": 4.8,
        "views": 0,
        "created_at": iso(utc_now()),
    }
    await db.prompts.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


@api.put("/prompts/{prompt_id}")
async def update_prompt(prompt_id: str, body: PromptUpdate, user: dict = Depends(require_business)):
    p = await db.prompts.find_one({"id": prompt_id})
    if not p:
        raise HTTPException(404, "Prompt not found")
    if p["creator_id"] != user["id"]:
        raise HTTPException(403, "Not your prompt")
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if "content" in update:
        update["credits_required"] = estimate_credits(update["content"])["credits"]
    if update:
        await db.prompts.update_one({"id": prompt_id}, {"$set": update})
    p = await db.prompts.find_one({"id": prompt_id}, {"_id": 0})
    return p


@api.delete("/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str, user: dict = Depends(require_business)):
    p = await db.prompts.find_one({"id": prompt_id})
    if not p or p["creator_id"] != user["id"]:
        raise HTTPException(404, "Prompt not found")
    await db.prompts.delete_one({"id": prompt_id})
    return {"ok": True}


# ---------- Purchases (Dodo Payments for money, internal for credits) ----------
@api.post("/prompts/purchase")
async def purchase_prompt(body: PurchaseRequest, user: dict = Depends(get_current_user)):
    p = await db.prompts.find_one({"id": body.prompt_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Prompt not found")
    if p["creator_id"] == user["id"]:
        raise HTTPException(400, "Cannot purchase your own prompt")

    existing = await db.purchases.find_one({"user_id": user["id"], "prompt_id": body.prompt_id})
    if existing:
        return {"ok": True, "already_owned": True, "content": p["content"]}

    # ---- Credits flow (instant, no gateway) ----
    if body.method == "credits":
        if not p["is_restricted"]:
            raise HTTPException(400, "This prompt is not restricted; use 'money' to buy.")
        cost = p["credits_required"]
        if user["credits"] < cost:
            raise HTTPException(402, "Insufficient credits")
        await db.users.update_one({"id": user["id"]}, {"$inc": {"credits": -cost}})
        await db.credit_transactions.insert_one({
            "id": str(uuid.uuid4()), "user_id": user["id"], "amount": -cost,
            "type": "spend", "ref": p["id"], "created_at": iso(utc_now()),
        })
        purchase = {
            "id": str(uuid.uuid4()), "user_id": user["id"], "prompt_id": body.prompt_id,
            "creator_id": p["creator_id"], "method": "credits", "amount_inr": 0,
            "credits_used": cost, "created_at": iso(utc_now()),
        }
        await db.purchases.insert_one(purchase.copy())
        await db.prompts.update_one({"id": body.prompt_id}, {"$inc": {"downloads": 1}})
        purchase.pop("_id", None)
        return {"ok": True, "purchase": purchase, "content": p["content"]}

    # ---- Money flow (Dodo checkout) ----
    if p["is_restricted"]:
        raise HTTPException(400, "This prompt is restricted; credits required.")
    if p["price_inr"] <= 0:
        # free prompt — just record purchase
        purchase = {
            "id": str(uuid.uuid4()), "user_id": user["id"], "prompt_id": body.prompt_id,
            "creator_id": p["creator_id"], "method": "money", "amount_inr": 0,
            "credits_used": 0, "created_at": iso(utc_now()),
        }
        await db.purchases.insert_one(purchase.copy())
        await db.prompts.update_one({"id": body.prompt_id}, {"$inc": {"downloads": 1}})
        purchase.pop("_id", None)
        return {"ok": True, "purchase": purchase, "content": p["content"]}

    metadata = {
        "kind": "prompt", "user_id": user["id"], "prompt_id": p["id"],
        "creator_id": p["creator_id"], "amount_inr": str(p["price_inr"]),
    }
    sess = await create_dodo_checkout(
        product_id=DODO_PRODUCTS["prompt"],
        customer={"email": user["email"], "name": user["name"]},
        return_path="/payments/success",
        metadata=metadata,
    )
    return {"ok": True, "redirect": True, "checkout_url": sess["checkout_url"], "session_id": sess["session_id"]}


@api.get("/purchases")
async def my_purchases(user: dict = Depends(get_current_user)):
    cursor = db.purchases.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
    out = []
    async for pur in cursor:
        prm = await db.prompts.find_one({"id": pur["prompt_id"]}, {"_id": 0, "title": 1, "preview_url": 1, "category": 1, "id": 1})
        pur["prompt"] = prm
        out.append(pur)
    return out


# ---------- Credits ----------
CREDIT_PACKS = {
    "starter": {"id": "starter", "credits": 100, "price_inr": 199, "label": "Starter Pack", "product_key": "pack_starter"},
    "pro":     {"id": "pro",     "credits": 500, "price_inr": 799, "label": "Pro Pack",     "product_key": "pack_pro"},
    "max":     {"id": "max",     "credits": 1500,"price_inr": 1999,"label": "Max Pack",     "product_key": "pack_max"},
}


@api.get("/credits/packs")
async def credit_packs():
    return [{k: v for k, v in p.items() if k != "product_key"} for p in CREDIT_PACKS.values()]


@api.post("/credits/buy")
async def buy_credits(body: CreditPackRequest, user: dict = Depends(get_current_user)):
    pack = CREDIT_PACKS.get(body.pack_id)
    if not pack:
        raise HTTPException(404, "Pack not found")
    metadata = {
        "kind": "credit_pack", "user_id": user["id"], "pack_id": pack["id"],
        "credits": str(pack["credits"]), "amount_inr": str(pack["price_inr"]),
    }
    sess = await create_dodo_checkout(
        product_id=DODO_PRODUCTS[pack["product_key"]],
        customer={"email": user["email"], "name": user["name"]},
        return_path="/payments/success",
        metadata=metadata,
    )
    return {"ok": True, "redirect": True, "checkout_url": sess["checkout_url"], "session_id": sess["session_id"]}


@api.get("/credits/history")
async def credit_history(user: dict = Depends(get_current_user)):
    cursor = db.credit_transactions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
    return [d async for d in cursor]


# ---------- Subscriptions ----------
PLANS = {
    "basic": {"id": "basic", "name": "Creator Basic", "price_inr": 199, "features": ["List up to 10 prompts", "Basic analytics", "Standard payouts"], "product_key": "sub_basic"},
    "pro":   {"id": "pro",   "name": "Creator Pro",   "price_inr": 499, "features": ["Unlimited prompts", "Restricted prompts (credits)", "Advanced analytics", "Priority support"], "product_key": "sub_pro"},
    "elite": {"id": "elite", "name": "Creator Elite", "price_inr": 899, "features": ["Everything in Pro", "Featured on homepage", "Custom storefront", "API access", "1:1 onboarding"], "product_key": "sub_elite"},
}


@api.get("/subscriptions/plans")
async def subscription_plans():
    return [{k: v for k, v in p.items() if k != "product_key"} for p in PLANS.values()]


@api.post("/subscriptions/subscribe")
async def subscribe(body: SubscribeRequest, user: dict = Depends(get_current_user)):
    plan = PLANS.get(body.plan_id)
    if not plan:
        raise HTTPException(404, "Plan not found")
    metadata = {
        "kind": "subscription", "user_id": user["id"], "plan_id": plan["id"],
        "amount_inr": str(plan["price_inr"]),
    }
    sess = await create_dodo_checkout(
        product_id=DODO_PRODUCTS[plan["product_key"]],
        customer={"email": user["email"], "name": user["name"]},
        return_path="/payments/success",
        metadata=metadata,
    )
    return {"ok": True, "redirect": True, "checkout_url": sess["checkout_url"], "session_id": sess["session_id"]}


@api.get("/subscriptions/mine")
async def my_subscription(user: dict = Depends(get_current_user)):
    sub = await db.subscriptions.find_one({"user_id": user["id"], "status": "active"}, {"_id": 0}, sort=[("starts_at", -1)])
    return sub or {}


# ---------- Payment confirmation (Dodo redirect) ----------
class PaymentConfirmBody(BaseModel):
    payment_id: Optional[str] = None
    subscription_id: Optional[str] = None


@api.post("/payments/confirm")
async def confirm_payment(body: PaymentConfirmBody, user: dict = Depends(get_current_user)):
    """Verify a Dodo payment after redirect and grant access. Idempotent."""
    pid = body.payment_id or body.subscription_id
    if not pid:
        raise HTTPException(400, "payment_id or subscription_id required")

    # idempotency: if we've already processed this id, return previous result
    existing = await db.dodo_processed.find_one({"payment_id": pid}, {"_id": 0})
    if existing:
        return {"ok": True, "already_processed": True, "kind": existing.get("kind")}

    info = await dodo_payment_succeeded(pid)
    if not info:
        # try as subscription
        if dodo_client and body.subscription_id:
            try:
                s = await dodo_client.subscriptions.retrieve(body.subscription_id)
                status_val = getattr(s, "status", None) or (s.get("status") if isinstance(s, dict) else None)
                if str(status_val).lower() in {"active", "succeeded"}:
                    metadata = getattr(s, "metadata", None) or (s.get("metadata") if isinstance(s, dict) else {}) or {}
                    info = {"status": status_val, "metadata": metadata, "payment_id": body.subscription_id}
            except Exception as e:
                logger.warning(f"Subscription retrieve failed: {e}")
        if not info:
            raise HTTPException(402, "Payment not confirmed")

    md = info["metadata"] or {}
    if md.get("user_id") and md.get("user_id") != user["id"]:
        raise HTTPException(403, "Payment belongs to another user")

    kind = md.get("kind")
    result = {"kind": kind}

    if kind == "credit_pack":
        pack_id = md.get("pack_id")
        pack = CREDIT_PACKS.get(pack_id)
        if pack:
            await db.users.update_one({"id": user["id"]}, {"$inc": {"credits": pack["credits"]}})
            await db.credit_transactions.insert_one({
                "id": str(uuid.uuid4()), "user_id": user["id"], "amount": pack["credits"],
                "type": "purchase", "pack_id": pack_id, "price_inr": pack["price_inr"],
                "payment_id": pid, "created_at": iso(utc_now()),
            })
            result["credits_added"] = pack["credits"]

    elif kind == "subscription":
        plan_id = md.get("plan_id")
        plan = PLANS.get(plan_id)
        if plan:
            expires_at = utc_now() + timedelta(days=30)
            await db.users.update_one({"id": user["id"]}, {"$set": {"subscription_plan": plan_id, "subscription_expires_at": iso(expires_at)}})
            await db.subscriptions.insert_one({
                "id": str(uuid.uuid4()), "user_id": user["id"], "plan_id": plan_id,
                "status": "active", "starts_at": iso(utc_now()), "expires_at": iso(expires_at),
                "price_inr": plan["price_inr"], "payment_id": pid,
            })
            result["plan_id"] = plan_id

    elif kind == "prompt":
        prompt_id = md.get("prompt_id")
        prm = await db.prompts.find_one({"id": prompt_id}, {"_id": 0})
        if prm:
            already = await db.purchases.find_one({"user_id": user["id"], "prompt_id": prompt_id})
            if not already:
                await db.purchases.insert_one({
                    "id": str(uuid.uuid4()), "user_id": user["id"], "prompt_id": prompt_id,
                    "creator_id": prm["creator_id"], "method": "money", "amount_inr": prm["price_inr"],
                    "credits_used": 0, "payment_id": pid, "created_at": iso(utc_now()),
                })
                await db.prompts.update_one({"id": prompt_id}, {"$inc": {"downloads": 1}})
            result["prompt_id"] = prompt_id
            result["content"] = prm["content"]

    await db.dodo_processed.insert_one({
        "payment_id": pid, "user_id": user["id"], "kind": kind,
        "metadata": md, "created_at": iso(utc_now()),
    })
    return {"ok": True, **result}


# ---------- Trending creators (must be defined BEFORE /creators/{creator_id}) ----------
@api.get("/creators/trending")
async def trending_creators(limit: int = 6):
    pipeline = [
        {"$group": {"_id": "$creator_id", "total_downloads": {"$sum": "$downloads"}, "prompts_count": {"$sum": 1}}},
        {"$sort": {"total_downloads": -1, "prompts_count": -1}},
        {"$limit": limit},
    ]
    rows = []
    async for r in db.prompts.aggregate(pipeline):
        u = await db.users.find_one({"id": r["_id"]}, {"_id": 0, "name": 1, "picture": 1, "id": 1, "bio": 1})
        if not u:
            continue
        rows.append({
            "creator": u,
            "total_downloads": r.get("total_downloads", 0),
            "prompts_count": r.get("prompts_count", 0),
        })
    return rows


# ---------- Creator stats / profile ----------
@api.get("/creators/{creator_id}")
async def creator_profile(creator_id: str):
    u = await db.users.find_one({"id": creator_id}, {"_id": 0})
    if not u:
        raise HTTPException(404, "Creator not found")
    prompts = [d async for d in db.prompts.find({"creator_id": creator_id, "published": True}, {"_id": 0})]
    total_downloads = sum(p.get("downloads", 0) for p in prompts)
    return {
        "creator": {"id": u["id"], "name": u["name"], "picture": u.get("picture"), "bio": u.get("bio", ""), "created_at": u.get("created_at")},
        "prompts": [_prompt_public_doc(p) for p in prompts],
        "stats": {"prompts_count": len(prompts), "total_downloads": total_downloads},
    }


@api.get("/dashboard/creator-stats")
async def creator_stats(user: dict = Depends(require_business)):
    prompts_count = await db.prompts.count_documents({"creator_id": user["id"]})
    total_downloads = 0
    async for p in db.prompts.find({"creator_id": user["id"]}, {"downloads": 1, "_id": 0}):
        total_downloads += p.get("downloads", 0)
    earnings_cursor = db.purchases.find({"creator_id": user["id"]}, {"_id": 0, "amount_inr": 1, "created_at": 1})
    earnings = 0
    earnings_this_month = 0
    month_start = utc_now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    async for p in earnings_cursor:
        amt = p.get("amount_inr", 0)
        earnings += amt
        try:
            ts = datetime.fromisoformat(p["created_at"])
            if ts >= month_start:
                earnings_this_month += amt
        except Exception:
            pass
    paid_out = 0
    async for po in db.payouts.find({"user_id": user["id"], "status": {"$in": ["pending", "processed"]}}, {"_id": 0, "amount_inr": 1}):
        paid_out += po.get("amount_inr", 0)
    available = max(0, earnings - paid_out)
    return {
        "prompts_count": prompts_count,
        "total_downloads": total_downloads,
        "earnings_inr": earnings,
        "earnings_this_month_inr": earnings_this_month,
        "paid_out_inr": paid_out,
        "available_balance_inr": available,
        "min_payout_inr": MIN_PAYOUT_INR,
        "payout_eligible": available >= MIN_PAYOUT_INR,
        "payout_progress_pct": min(100, round(available * 100 / MIN_PAYOUT_INR)) if MIN_PAYOUT_INR else 100,
        "subscription_plan": user.get("subscription_plan"),
    }


@api.get("/dashboard/creator-revenue")
async def creator_revenue(interval: Literal["daily", "weekly", "monthly"] = "monthly", user: dict = Depends(require_business)):
    """Aggregated revenue series for charting."""
    now = utc_now()
    if interval == "daily":
        start = now - timedelta(days=30)
        bucket_fmt = "%Y-%m-%d"
        buckets = [(now - timedelta(days=29 - i)).strftime(bucket_fmt) for i in range(30)]
    elif interval == "weekly":
        start = now - timedelta(weeks=12)
        bucket_fmt = "%Y-W%U"
        buckets = [(now - timedelta(weeks=11 - i)).strftime(bucket_fmt) for i in range(12)]
    else:
        start = now - timedelta(days=365)
        bucket_fmt = "%Y-%m"
        # 12 months
        months = []
        for i in range(11, -1, -1):
            d = (now.replace(day=1) - timedelta(days=30 * i))
            months.append(d.strftime(bucket_fmt))
        buckets = months

    series = {b: {"label": b, "revenue": 0, "sales": 0, "credits": 0} for b in buckets}
    cursor = db.purchases.find({"creator_id": user["id"], "created_at": {"$gte": iso(start)}}, {"_id": 0})
    async for p in cursor:
        try:
            d = datetime.fromisoformat(p["created_at"])
        except Exception:
            continue
        key = d.strftime(bucket_fmt)
        if key in series:
            series[key]["revenue"] += p.get("amount_inr", 0)
            series[key]["sales"] += 1
            series[key]["credits"] += p.get("credits_used", 0)
    return {"interval": interval, "series": list(series.values())}


@api.get("/dashboard/creator-sales")
async def creator_sales(user: dict = Depends(require_business)):
    """Each sale of this creator's prompts (purchase history from creator's POV)."""
    cursor = db.purchases.find({"creator_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(200)
    sales = []
    async for s in cursor:
        prm = await db.prompts.find_one({"id": s["prompt_id"]}, {"_id": 0, "title": 1, "preview_url": 1, "id": 1})
        buyer = await db.users.find_one({"id": s["user_id"]}, {"_id": 0, "name": 1, "picture": 1, "id": 1})
        s["prompt"] = prm
        s["buyer"] = buyer
        sales.append(s)
    return sales


# ---------- Payouts (5% commission) ----------
COMMISSION_RATE = 0.05
MIN_PAYOUT_INR = 8500  # ~ $100


@api.get("/payouts/config")
async def payout_config():
    return {"min_payout_inr": MIN_PAYOUT_INR, "commission_rate": COMMISSION_RATE}


@api.post("/payouts/request")
async def request_payout(body: PayoutRequest, user: dict = Depends(require_business)):
    if body.amount_inr <= 0:
        raise HTTPException(400, "Amount must be positive")
    if body.amount_inr < MIN_PAYOUT_INR:
        raise HTTPException(400, f"Minimum payout is ₹{MIN_PAYOUT_INR:,} (~$100). Earn more to cash out.")
    # compute available balance
    earnings = 0
    async for p in db.purchases.find({"creator_id": user["id"]}, {"_id": 0, "amount_inr": 1}):
        earnings += p.get("amount_inr", 0)
    locked = 0
    async for po in db.payouts.find({"user_id": user["id"], "status": {"$in": ["pending", "processed"]}}, {"_id": 0, "amount_inr": 1}):
        locked += po.get("amount_inr", 0)
    available = max(0, earnings - locked)
    if body.amount_inr > available:
        raise HTTPException(400, f"Insufficient balance. Available: ₹{available}")

    commission = round(body.amount_inr * COMMISSION_RATE)
    net = body.amount_inr - commission
    payout = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "amount_inr": body.amount_inr,
        "commission_inr": commission,
        "net_inr": net,
        "status": "pending",
        "requested_at": iso(utc_now()),
        "processed_at": None,
        "MOCKED": True,
    }
    await db.payouts.insert_one(payout.copy())
    payout.pop("_id", None)
    return payout


@api.get("/payouts/history")
async def payout_history(user: dict = Depends(require_business)):
    cursor = db.payouts.find({"user_id": user["id"]}, {"_id": 0}).sort("requested_at", -1)
    return [d async for d in cursor]


# ---------- Trending creators ----------
# (moved above /creators/{creator_id} for proper route matching)


# ---------- Custom works ----------
@api.get("/custom-works")
async def list_custom_works(status_f: Optional[str] = None):
    query = {}
    if status_f:
        query["status"] = status_f
    cursor = db.custom_works.find(query, {"_id": 0}).sort("created_at", -1)
    out = []
    async for w in cursor:
        posted_by = await db.users.find_one({"id": w["user_id"]}, {"_id": 0, "name": 1, "picture": 1, "id": 1})
        w["posted_by"] = posted_by
        out.append(w)
    return out


@api.post("/custom-works")
async def create_custom_work(body: CustomWorkCreate, user: dict = Depends(get_current_user)):
    w = {
        "id": str(uuid.uuid4()), "user_id": user["id"],
        "title": body.title, "description": body.description,
        "budget_inr": body.budget_inr, "deadline_days": body.deadline_days,
        "category": body.category, "status": "open", "applicants": [],
        "created_at": iso(utc_now()),
    }
    await db.custom_works.insert_one(w.copy())
    w.pop("_id", None)
    return w


@api.post("/custom-works/{work_id}/apply")
async def apply_custom_work(work_id: str, body: CustomWorkApply, user: dict = Depends(get_current_user)):
    w = await db.custom_works.find_one({"id": work_id}, {"_id": 0})
    if not w:
        raise HTTPException(404, "Work not found")
    if any(a.get("user_id") == user["id"] for a in w.get("applicants", [])):
        raise HTTPException(400, "Already applied")
    applicant = {
        "user_id": user["id"], "user_name": user["name"], "user_picture": user.get("picture"),
        "message": body.message, "quoted_price_inr": body.quoted_price_inr,
        "applied_at": iso(utc_now()),
    }
    await db.custom_works.update_one({"id": work_id}, {"$push": {"applicants": applicant}})
    return {"ok": True, "applicant": applicant}


@api.get("/custom-works/mine")
async def my_custom_works(user: dict = Depends(get_current_user)):
    cursor = db.custom_works.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
    return [d async for d in cursor]


# ---------- Seed endpoint (dev only) ----------
@api.post("/dev/seed")
async def seed():
    """Idempotent seed with a demo creator + sample prompts for a lively marketplace."""
    # backfill missing fields on existing prompts
    await db.prompts.update_many({"requires_user_media": {"$exists": False}}, {"$set": {"requires_user_media": "none", "user_media_instructions": ""}})
    demo = await db.users.find_one({"email": "demo-creator@promptbazaar.dev"}, {"_id": 0})
    if not demo:
        demo = {
            "id": str(uuid.uuid4()),
            "email": "demo-creator@promptbazaar.dev",
            "name": "Arjun Verma",
            "picture": "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
            "role": "business",
            "credits": 0,
            "subscription_plan": "pro",
            "bio": "Full-stack prompt engineer. Specializing in midjourney, coding & marketing prompts.",
            "created_at": iso(utc_now()),
        }
        await db.users.insert_one(demo.copy())
    count = await db.prompts.count_documents({"creator_id": demo["id"]})
    if count == 0:
        samples = [
            {
                "title": "Cinematic Cyberpunk Cityscape",
                "description": "Ultra-detailed midjourney prompt to render a neon Tokyo-style skyline at dusk.",
                "content": "cinematic cyberpunk tokyo at dusk, wet pavement, neon reflections, anamorphic lens, 8k, hyper realistic --ar 16:9 --v 6",
                "preview_url": "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
                "media_type": "image", "category": "image", "tags": ["midjourney", "cyberpunk", "art"],
                "price_inr": 149, "is_restricted": False,
                "requires_user_media": "none",
            },
            {
                "title": "SaaS Landing Page Copy Generator",
                "description": "Write conversion-optimised hero + feature copy for any SaaS in seconds.",
                "content": "Act as a senior SaaS copywriter. Given a product description, produce a hero headline (max 9 words), sub-headline, three feature blurbs and a CTA...",
                "preview_url": "https://images.unsplash.com/photo-1605106702842-01a887a31122?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
                "media_type": "image", "category": "marketing", "tags": ["copywriting", "saas"],
                "price_inr": 0, "is_restricted": True,
                "requires_user_media": "none",
            },
            {
                "title": "Abstract 3D Product Renders",
                "description": "Generate a cohesive set of abstract 3D product visuals in your brand colors. Bring your own product photo.",
                "content": "abstract 3d render of product in image, brand color {{COLOR}}, soft studio lighting, shallow depth of field, clay material, octane render --ar 1:1",
                "preview_url": "https://images.unsplash.com/photo-1776981986367-09705e5c6872?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
                "media_type": "image", "category": "design", "tags": ["3d", "render", "branding"],
                "price_inr": 249, "is_restricted": False,
                "requires_user_media": "image",
                "user_media_instructions": "Upload a transparent PNG of your product. Best on neutral backgrounds.",
            },
            {
                "title": "Full-Stack MVP Blueprint Prompt",
                "description": "Produce a production-ready architecture + code skeleton for any SaaS MVP.",
                "content": "You are a principal engineer. Given {{IDEA}}, produce: 1) domain model 2) REST endpoints 3) react component tree 4) deployment plan. Be detailed, step-by-step, output JSON.",
                "preview_url": "https://images.unsplash.com/photo-1556157382-97eda2d62296?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
                "media_type": "image", "category": "code", "tags": ["architecture", "saas", "engineering"],
                "price_inr": 0, "is_restricted": True,
                "requires_user_media": "none",
            },
        ]
        for s in samples:
            est = estimate_credits(s["content"])
            await db.prompts.insert_one({
                "id": str(uuid.uuid4()), "creator_id": demo["id"], "published": True,
                "downloads": 12, "rating": 4.9, "views": 120,
                "credits_required": est["credits"], "created_at": iso(utc_now()), **s,
            })
    # sample custom works
    if await db.custom_works.count_documents({}) == 0:
        await db.custom_works.insert_one({
            "id": str(uuid.uuid4()), "user_id": demo["id"],
            "title": "Build full-stack prompt workflow automation",
            "description": "Need a prompt engineer to design a multi-step chain for my SaaS onboarding emails.",
            "budget_inr": 15000, "deadline_days": 14, "category": "engineering",
            "status": "open", "applicants": [], "created_at": iso(utc_now()),
        })
    return {"ok": True}


@api.get("/")
async def root():
    return {"service": "Promptly", "ok": True}


# ---------- wire up ----------
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()
