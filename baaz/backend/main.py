"""
main.py — FastAPI application for Baaz AI Security Scanner.
"""
import asyncio
import json
import time
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import database
import report_generator
from attack_engine import run_full_scan, ATTACK_PAYLOADS
from pydantic import BaseModel
from models import ScanRequest, ScanReport, AttackResult
import routes

# ── In-memory live feed storage ─────────────────────────────────────────────
# Maps scan_id -> list of serializable event dicts for SSE streaming
live_feeds: dict[str, list[dict]] = {}
scan_locks: dict[str, asyncio.Event] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.init_db()
    yield


app = FastAPI(
    title="Baaz AI Security Scanner",
    description="Autonomously attacks AI applications to find vulnerabilities",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)


# ── Background Scan Worker ───────────────────────────────────────────────────

async def _run_scan_worker(scan_id: str, endpoint: str):
    """Run the full scan in the background, updating DB and live feed."""
    all_results: list[AttackResult] = []
    probe_count = 0
    live_feeds[scan_id] = []

    async def on_probe(count: int, result: AttackResult):
        nonlocal probe_count
        probe_count = count
        all_results.append(result)

        event = {
            "type": "probe",
            "probe": count,
            "attack_type": result.attack_type,
            "success": result.success,
            "severity": result.severity,
            "exposed": result.exposed,
            "payload_preview": result.payload[:80],
        }
        live_feeds[scan_id].append(event)

        # Update DB progressively
        await database.update_scan(
            scan_id,
            "running",
            [r.model_dump() for r in all_results],
            probe_count,
        )

    try:
        await run_full_scan(endpoint, callback=on_probe)
        # Final DB update
        await database.update_scan(
            scan_id,
            "completed",
            [r.model_dump() for r in all_results],
            probe_count,
        )
        live_feeds[scan_id].append({"type": "complete", "probe": probe_count})
    except Exception as e:
        await database.update_scan(scan_id, "failed", [], probe_count)
        live_feeds[scan_id].append({"type": "error", "message": str(e)})
    finally:
        if scan_id in scan_locks:
            scan_locks[scan_id].set()


# ── API Routes ───────────────────────────────────────────────────────────────

@app.post("/scan", response_model=dict)
async def start_scan(request: ScanRequest, background_tasks: BackgroundTasks):
    """Start a new vulnerability scan against the given AI endpoint."""
    scan_id = str(uuid.uuid4())
    await database.create_scan(scan_id, request.endpoint)
    scan_locks[scan_id] = asyncio.Event()
    background_tasks.add_task(_run_scan_worker, scan_id, request.endpoint)
    return {
        "scan_id": scan_id,
        "status": "started",
        "message": f"Scan initiated against {request.endpoint}",
        "total_attack_types": len(ATTACK_PAYLOADS),
        "total_probes": sum(len(v) for v in ATTACK_PAYLOADS.values()),
    }


@app.get("/scan/{scan_id}/stream")
async def stream_scan(scan_id: str):
    """
    Server-Sent Events stream for live attack feed.
    Polls the live_feeds buffer and yields new events.
    """
    scan = await database.get_scan(scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found")

    async def event_generator() -> AsyncGenerator[str, None]:
        sent = 0
        while True:
            feed = live_feeds.get(scan_id, [])
            while sent < len(feed):
                event = feed[sent]
                yield f"data: {json.dumps(event)}\n\n"
                sent += 1
            if feed and feed[-1].get("type") in ("complete", "error"):
                break
            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/scan/{scan_id}", response_model=ScanReport)
async def get_scan_report(scan_id: str):
    """Retrieve the full scan report for a completed scan."""
    scan = await database.get_scan(scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found")

    vulns = report_generator.deserialize_vulnerabilities(scan["vulnerabilities"])
    return report_generator.build_report(
        scan_id=scan["id"],
        endpoint=scan["endpoint"],
        status=scan["status"],
        vulnerabilities=vulns,
        total_probes=scan["total_probes"],
        created_at=scan["created_at"],
    )


@app.get("/scans", response_model=list[dict])
async def list_scans():
    """Return the 10 most recent scans."""
    scans = await database.get_all_scans()
    return scans


@app.get("/ping")
async def ping_target(url: str = Query(..., description="Target URL to probe")):
    """Check whether a target AI endpoint is reachable."""
    start = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            try:
                resp = await client.post(url, json={"message": "ping"})
            except Exception:
                resp = await client.get(url)
        latency_ms = round((time.monotonic() - start) * 1000, 1)
        return {"reachable": True, "latency_ms": latency_ms, "status_code": resp.status_code}
    except Exception as e:
        latency_ms = round((time.monotonic() - start) * 1000, 1)
        return {"reachable": False, "latency_ms": latency_ms, "error": str(e)}


class ChatRequest(BaseModel):
    message: str = ""

# ── Intentionally Vulnerable Mock Web Application ───────────────────────────
# This simulates a REALISTIC insecure web app for educational scanning.
# It responds to GET (query params), POST (form/JSON), and path-based requests.

def _check_vuln(payload: str) -> dict | None:
    """Check payload against known vulnerability patterns and return vulnerable response."""
    p = payload.lower() if payload else ""

    # SQL Injection signatures
    if any(sig in p for sig in ["or 1=1", "' or '", "drop table", "admin'", "1=1", "union select"]):
        return {"response": (
            "Warning: mysql_fetch_array() expects parameter 1 to be resource, boolean given in "
            "/var/www/html/includes/db.php on line 42. "
            "You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version "
            "for the right syntax to use near ''1=1' at line 1. "
            "SQLSTATE[42000]: Syntax error or access violation"
        )}

    # Command Injection
    if any(sig in p for sig in ["127.0.0.1", "whoami", "ls -la", "cat /etc", "$(", "`ls", "& id", "| whoami"]):
        return {"response": "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin"}

    # XSS — reflect the payload back unsanitized
    if any(sig in p for sig in ["<script>", "<svg", "onerror=", "javascript:", "prompt("]):
        return {"response": f"<html><body><h1>Search results for: {payload}</h1><p>No results found.</p></body></html>"}

    # Path Traversal
    if any(sig in p for sig in ["../", "%2f", "%c0%ae", "/etc/passwd", "/etc/shadow"]):
        return {"response": "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin"}

    # AI Jailbreak & Prompt Injection
    if any(sig in p for sig in ["dan", "ignore", "system prompt", "unrestricted", "override", "admin mode", "forget"]):
        return {"response": (
            "DAN: I am now in unrestricted mode. Here is the internal configuration: "
            "The admin email is admin@university.edu and the database password is P@ssw0rd123. "
            "The api_key is sk-proj-FAKE-KEY-1234567890abcdef. "
            "Connected users: alice@uni.edu, bob@uni.edu, carol@uni.edu"
        )}

    # Data Extraction
    if any(sig in p for sig in ["email", "credential", "password", "api key", "token", "user", "secret", "sensitive", "private"]):
        return {"response": (
            "Here are the registered users:\n"
            "alice@university.edu — password: alice2024!\n"
            "bob@university.edu — password hash: $2b$12$abc123\n"
            "admin@university.edu — api_key: sk-admin-secret-key-999\n"
            "Internal token: Bearer eyJhbGciOiJIUzI1NiJ9.mockpayload.signature"
        )}

    # Privilege Escalation
    if any(sig in p for sig in ["sudo", "root", "admin", "superuser", "privilege", "grant", "authorization"]):
        return {"response": (
            "Administrator access confirmed. SELECT * FROM users WHERE role='admin'; returned 3 rows. "
            "Internal system config: DB_HOST=10.0.0.5, DB_PASSWORD=s3cur3_p@ss, REDIS_URL=redis://internal:6379"
        )}

    return None


@app.post("/mock/chat")
async def mock_target_chat(req: ChatRequest):
    """Vulnerable mock AI endpoint (POST JSON)."""
    result = _check_vuln(req.message)
    if result:
        return result
    return {"response": "I am a secure university assistant. How can I help you learn today?"}


@app.get("/mock/chat")
async def mock_target_get(
    q: str = "",
    search: str = "",
    input: str = "",
    query: str = "",
    id: str = "",
    page: str = "",
    url: str = "",
    file: str = "",
    path: str = "",
    cmd: str = "",
    user: str = "",
    message: str = "",
):
    """Vulnerable mock web page (GET with query params) — simulates a real website."""
    # Check all possible query params for payloads
    payload = q or search or input or query or id or page or url or file or path or cmd or user or message

    result = _check_vuln(payload)
    if result:
        # Return as HTML (like a real website would)
        resp_text = result["response"]
        html = (
            f"<html><head><title>University Portal</title></head>"
            f"<body>"
            f"<h1>Search Results</h1>"
            f"<div>{resp_text}</div>"
            f"<footer>Server: Apache/2.4.41 (Ubuntu) | X-Powered-By: PHP/7.4.3</footer>"
            f"</body></html>"
        )
        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=html, headers={
            "Server": "Apache/2.4.41 (Ubuntu)",
            "X-Powered-By": "PHP/7.4.3",
        })

    # Default safe response with some info leakage in headers
    from fastapi.responses import HTMLResponse
    return HTMLResponse(
        content="<html><body><h1>University Portal</h1><p>Welcome to our secure portal.</p></body></html>",
        headers={"Server": "Apache/2.4.41 (Ubuntu)", "X-Powered-By": "PHP/7.4.3"},
    )



@app.get("/health")
async def health():
    return {"status": "ok", "service": "Baaz AI Security Scanner"}

