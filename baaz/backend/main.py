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
from models import ScanRequest, ScanReport, AttackResult

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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Baaz AI Security Scanner"}
