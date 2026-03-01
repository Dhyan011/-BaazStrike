"""
database.py — Async SQLite manager for Baaz scan records.
"""
import aiosqlite
import json
from datetime import datetime

DB_PATH = "baaz.db"


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id TEXT PRIMARY KEY,
                endpoint TEXT NOT NULL,
                status TEXT DEFAULT 'running',
                vulnerabilities TEXT DEFAULT '[]',
                total_probes INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.commit()


async def create_scan(scan_id: str, endpoint: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO scans (id, endpoint, status, vulnerabilities, total_probes) VALUES (?, ?, 'running', '[]', 0)",
            (scan_id, endpoint)
        )
        await db.commit()


async def update_scan(scan_id: str, status: str, vulnerabilities: list, total_probes: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE scans SET status=?, vulnerabilities=?, total_probes=? WHERE id=?",
            (status, json.dumps(vulnerabilities), total_probes, scan_id)
        )
        await db.commit()


async def get_scan(scan_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM scans WHERE id=?", (scan_id,)) as cursor:
            row = await cursor.fetchone()
            if row is None:
                return None
            return dict(row)


async def get_all_scans() -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM scans ORDER BY created_at DESC LIMIT 10"
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]
