"""
PromptBazaar Backend API tests (pytest).
Covers: health, seed idempotency, prompts list/detail (content hidden),
credit estimator, subscription plans, credit packs, custom works,
creators profile, auth-protection (401 for protected endpoints), no _id leaks.
"""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback to /app/frontend/.env contents
    try:
        with open("/app/frontend/.env") as fh:
            for line in fh:
                if line.startswith("REACT_APP_BACKEND_URL"):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _no_underscore_id(obj):
    """Recursively assert no '_id' key in a dict/list structure."""
    if isinstance(obj, dict):
        assert "_id" not in obj, f"_id leaked in dict: keys={list(obj.keys())}"
        for v in obj.values():
            _no_underscore_id(v)
    elif isinstance(obj, list):
        for item in obj:
            _no_underscore_id(item)


# ---------- Health ----------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        assert data.get("service") == "PromptBazaar"


# ---------- Seed (idempotent) ----------
class TestSeed:
    def test_seed_first_call(self, client):
        r = client.post(f"{API}/dev/seed")
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_seed_idempotent(self, client):
        # Capture counts before second call
        prompts_before = client.get(f"{API}/prompts").json()
        works_before = client.get(f"{API}/custom-works").json()
        r = client.post(f"{API}/dev/seed")
        assert r.status_code == 200
        prompts_after = client.get(f"{API}/prompts").json()
        works_after = client.get(f"{API}/custom-works").json()
        # counts should be equal: seed should not duplicate
        assert len(prompts_after) == len(prompts_before), "seed duplicated prompts"
        assert len(works_after) == len(works_before), "seed duplicated custom works"


# ---------- Prompts list & filters ----------
class TestPromptsList:
    def test_list_prompts(self, client):
        r = client.get(f"{API}/prompts")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 4, "expected seeded prompts"
        _no_underscore_id(data)
        for p in data:
            # content must be hidden for unauthenticated viewer
            assert p.get("content") is None, "content leaked to unauthenticated viewer"
            assert "id" in p
            assert "title" in p
            assert "creator" in p
            assert isinstance(p.get("tags"), list)

    def test_filter_only_free(self, client):
        r = client.get(f"{API}/prompts", params={"only_free": "true"})
        assert r.status_code == 200
        for p in r.json():
            assert p["price_inr"] == 0

    def test_filter_category(self, client):
        r = client.get(f"{API}/prompts", params={"category": "marketing"})
        assert r.status_code == 200
        for p in r.json():
            assert p["category"] == "marketing"

    def test_filter_media_type(self, client):
        r = client.get(f"{API}/prompts", params={"media_type": "image"})
        assert r.status_code == 200
        for p in r.json():
            assert p["media_type"] == "image"

    def test_filter_q_search(self, client):
        r = client.get(f"{API}/prompts", params={"q": "cyberpunk"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert any("cyberpunk" in p["title"].lower() or "cyberpunk" in p["description"].lower() for p in data)


# ---------- Prompt detail (content hidden when not owner / not purchased) ----------
class TestPromptDetail:
    def test_detail_hides_content_for_unauth(self, client):
        prompts = client.get(f"{API}/prompts").json()
        assert len(prompts) > 0
        pid = prompts[0]["id"]
        r = client.get(f"{API}/prompts/{pid}")
        assert r.status_code == 200
        data = r.json()
        _no_underscore_id(data)
        assert data["content"] is None, "content must be hidden for unauthenticated viewer"
        assert data["id"] == pid
        assert "creator" in data and data["creator"] is not None

    def test_detail_404(self, client):
        r = client.get(f"{API}/prompts/nonexistent-id-xyz")
        assert r.status_code == 404


# ---------- Credit estimator ----------
class TestCreditEstimator:
    def test_estimate_basic(self, client):
        r = client.post(f"{API}/credit-estimate", json={"text": "hello world"})
        assert r.status_code == 200
        d = r.json()
        assert d["words"] == 2
        assert d["credits"] >= 1
        assert d["complexity"] == 0
        assert d["tier"] in {"basic", "standard", "advanced"}

    def test_estimate_complexity(self, client):
        text = "Please analyze the code step-by-step and produce detailed json output, advanced full plan."
        r = client.post(f"{API}/credit-estimate", json={"text": text})
        assert r.status_code == 200
        d = r.json()
        # keywords: analyze, step-by-step, code, json, detailed, advanced, full -> 7 (count >=5)
        assert d["complexity"] >= 5
        assert d["credits"] > d["words"] // 8  # boosted by complexity
        assert d["tier"] in {"standard", "advanced"}

    def test_estimate_long_text_tier_advanced(self, client):
        text = ("word " * 200).strip()
        r = client.post(f"{API}/credit-estimate", json={"text": text})
        assert r.status_code == 200
        d = r.json()
        assert d["words"] == 200
        # 200//8 = 25 -> advanced
        assert d["tier"] == "advanced"
        assert d["credits"] >= 25

    def test_estimate_empty(self, client):
        r = client.post(f"{API}/credit-estimate", json={"text": ""})
        assert r.status_code == 200
        d = r.json()
        assert d["words"] == 0
        assert d["credits"] >= 1  # base = max(1, 0) = 1


# ---------- Subscription plans ----------
class TestSubscriptionPlans:
    def test_plans(self, client):
        r = client.get(f"{API}/subscriptions/plans")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 3
        ids = {p["id"] for p in data}
        assert ids == {"basic", "pro", "elite"}
        prices = {p["id"]: p["price_inr"] for p in data}
        assert prices["basic"] == 199
        assert prices["pro"] == 499
        assert prices["elite"] == 899
        for p in data:
            assert isinstance(p["features"], list) and len(p["features"]) >= 1


# ---------- Credit packs ----------
class TestCreditPacks:
    def test_packs(self, client):
        r = client.get(f"{API}/credits/packs")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        ids = {p["id"] for p in data}
        assert ids == {"starter", "pro", "max"}
        for p in data:
            assert p["credits"] > 0
            assert p["price_inr"] > 0
            assert "label" in p


# ---------- Custom works ----------
class TestCustomWorks:
    def test_list(self, client):
        r = client.get(f"{API}/custom-works")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        _no_underscore_id(data)
        if data:
            w = data[0]
            assert "id" in w
            assert "title" in w
            assert "posted_by" in w


# ---------- Creator profile ----------
class TestCreatorProfile:
    def test_creator_profile_existing(self, client):
        prompts = client.get(f"{API}/prompts").json()
        assert prompts, "need seeded prompts"
        creator_id = prompts[0]["creator"]["id"]
        r = client.get(f"{API}/creators/{creator_id}")
        assert r.status_code == 200
        data = r.json()
        _no_underscore_id(data)
        assert data["creator"]["id"] == creator_id
        assert isinstance(data["prompts"], list)
        assert "stats" in data
        assert data["stats"]["prompts_count"] == len(data["prompts"])
        # Content should be hidden in creator profile listing too
        for p in data["prompts"]:
            assert p["content"] is None

    def test_creator_profile_404(self, client):
        r = client.get(f"{API}/creators/nonexistent-creator-xyz")
        assert r.status_code == 404


# ---------- Auth protection ----------
class TestAuthProtected:
    """All these endpoints must return 401 without a session cookie/bearer token."""

    @pytest.mark.parametrize("method,path,body", [
        ("GET", "/auth/me", None),
        ("POST", "/auth/role", {"role": "normal"}),
        ("POST", "/prompts", {"title": "x", "description": "x", "content": "x", "category": "x"}),
        ("GET", "/prompts/mine", None),
        ("POST", "/prompts/purchase", {"prompt_id": "x", "method": "credits"}),
        ("GET", "/purchases", None),
        ("POST", "/credits/buy", {"pack_id": "starter"}),
        ("GET", "/credits/history", None),
        ("POST", "/subscriptions/subscribe", {"plan_id": "basic"}),
        ("GET", "/subscriptions/mine", None),
        ("GET", "/dashboard/creator-stats", None),
        ("POST", "/custom-works", {"title": "x", "description": "x", "budget_inr": 1000}),
        ("POST", "/custom-works/x/apply", {"message": "hi", "quoted_price_inr": 100}),
        ("GET", "/custom-works/mine", None),
    ])
    def test_protected_returns_401(self, client, method, path, body):
        # Use a fresh session (no cookies) to ensure no leakage
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        url = f"{API}{path}"
        if method == "GET":
            r = s.get(url)
        else:
            r = s.post(url, json=body or {})
        assert r.status_code == 401, f"{method} {path} expected 401, got {r.status_code} body={r.text[:200]}"


# ---------- /api/auth/session header validation ----------
class TestAuthSession:
    def test_missing_header_returns_400(self, client):
        s = requests.Session()
        r = s.post(f"{API}/auth/session")
        assert r.status_code == 400, f"expected 400, got {r.status_code}"

    def test_bogus_session_id_returns_401(self, client):
        s = requests.Session()
        s.headers.update({"X-Session-ID": "totally-bogus-session-id-xyz-12345"})
        r = s.post(f"{API}/auth/session")
        assert r.status_code == 401, f"expected 401, got {r.status_code} body={r.text[:200]}"


# ---------- _id leak global checks ----------
class TestNoIdLeaks:
    def test_no_id_in_prompts(self, client):
        r = client.get(f"{API}/prompts")
        assert r.status_code == 200
        # Hard string check too
        assert '"_id"' not in r.text, "_id present in /prompts response"
        _no_underscore_id(r.json())

    def test_no_id_in_custom_works(self, client):
        r = client.get(f"{API}/custom-works")
        assert r.status_code == 200
        assert '"_id"' not in r.text
        _no_underscore_id(r.json())

    def test_no_id_in_plans_packs(self, client):
        for path in ("/subscriptions/plans", "/credits/packs"):
            r = client.get(f"{API}{path}")
            assert r.status_code == 200
            assert '"_id"' not in r.text
