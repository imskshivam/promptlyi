"""
Promptly · Python → Node bridge.

The platform's supervisor.conf is locked to `uvicorn server:app` on :8001, but the
real backend is now a Node.js / Express app (see /app/backend/server.js + /app/backend/src/).
This module:
  1. boots the Node process as a child on internal port 8002, and
  2. exposes an ASGI app that reverse-proxies every request to it.
All business logic lives in Node — this file is intentionally minimal.
"""
import os
import asyncio
import subprocess
import signal
import logging
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from dotenv import load_dotenv
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import Response, StreamingResponse
from starlette.routing import Route

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

NODE_PORT = int(os.environ.get("NODE_BACKEND_PORT", "8002"))
HOP_BY_HOP = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade", "host", "content-length",
    "content-encoding",
}

logging.basicConfig(level=logging.INFO, format="%(asctime)s [proxy] %(message)s")
log = logging.getLogger("promptly-proxy")

node_proc: subprocess.Popen | None = None
http_client: httpx.AsyncClient | None = None


def _start_node() -> subprocess.Popen:
    env = {**os.environ, "PORT": str(NODE_PORT)}
    proc = subprocess.Popen(
        ["node", "server.js"],
        cwd=str(ROOT),
        env=env,
        stdout=None,  # inherit -> supervisor logs
        stderr=None,
    )
    log.info(f"started node backend pid={proc.pid} on :{NODE_PORT}")
    return proc


async def _wait_for_node(timeout: float = 30.0) -> None:
    async with httpx.AsyncClient(timeout=2.0) as c:
        deadline = asyncio.get_event_loop().time() + timeout
        while asyncio.get_event_loop().time() < deadline:
            try:
                r = await c.get(f"http://127.0.0.1:{NODE_PORT}/api/")
                if r.status_code == 200:
                    log.info("node backend is healthy")
                    return
            except Exception:
                pass
            await asyncio.sleep(0.4)
    log.warning("node backend did not become healthy within timeout — proxy will still try")


@asynccontextmanager
async def lifespan(app):
    global node_proc, http_client
    node_proc = _start_node()
    http_client = httpx.AsyncClient(
        base_url=f"http://127.0.0.1:{NODE_PORT}",
        timeout=httpx.Timeout(30.0),
        follow_redirects=False,
    )
    await _wait_for_node()
    try:
        yield
    finally:
        if http_client:
            await http_client.aclose()
        if node_proc and node_proc.poll() is None:
            node_proc.send_signal(signal.SIGTERM)
            try:
                node_proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                node_proc.kill()
        log.info("shutdown complete")


async def proxy(request: Request) -> Response:
    assert http_client is not None
    headers = [(k, v) for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP]
    body = await request.body()
    target = request.url.path
    if request.url.query:
        target += f"?{request.url.query}"
    try:
        upstream = await http_client.request(
            request.method,
            target,
            content=body,
            headers=headers,
        )
    except httpx.ConnectError:
        return Response("Backend (Node) unavailable", status_code=502)
    except httpx.RequestError as e:
        return Response(f"Proxy error: {e}", status_code=502)

    # Pass-through response, preserving multi-value headers (e.g. Set-Cookie)
    out_headers = []
    for k, v in upstream.headers.multi_items():
        if k.lower() in HOP_BY_HOP:
            continue
        out_headers.append((k, v))

    return Response(content=upstream.content, status_code=upstream.status_code, headers=dict(out_headers))


# Keep raw header pairs (Set-Cookie etc.) by using a custom Response that streams
async def proxy_pass(request: Request):
    assert http_client is not None
    headers = [(k, v) for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP]
    body = await request.body()
    target = request.url.path
    if request.url.query:
        target += f"?{request.url.query}"
    try:
        upstream = await http_client.request(request.method, target, content=body, headers=headers)
    except httpx.ConnectError:
        return Response("Backend (Node) unavailable", status_code=502)
    except httpx.RequestError as e:
        return Response(f"Proxy error: {e}", status_code=502)

    response = Response(content=upstream.content, status_code=upstream.status_code)
    response.raw_headers = [
        (k.encode("latin-1"), v.encode("latin-1"))
        for k, v in upstream.headers.multi_items()
        if k.lower() not in HOP_BY_HOP
    ]
    return response


app = Starlette(
    debug=False,
    lifespan=lifespan,
    routes=[
        Route("/{path:path}", proxy_pass, methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]),
    ],
)
