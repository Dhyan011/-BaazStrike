"""
routes.py — Extra API routes for auth, comments, and events.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import json

router = APIRouter()

# ── 1. Authentication ────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str

class LoginResponse(BaseModel):
    token: str
    message: str

@router.post("/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    # Enforce domain restriction: must end with .edu for the mock.
    # In a real app, this might be a specific university like @mit.edu
    if not req.email.strip().lower().endswith(".edu"):
        raise HTTPException(
            status_code=403, 
            detail="Access Denied. For students only. Please use your valid @*.edu university email address."
        )
    
    # Mocking a fast JWT-style token based on the email
    # In production, use standard python-jose JWT creation
    import base64
    fake_payload = {"email": req.email, "role": "student"}
    token = "sim-jwt." + base64.b64encode(json.dumps(fake_payload).encode()).decode()
    
    return LoginResponse(token=token, message="Welcome to the University Hub!")

# ── 2. Collaboration Hub (Comments) ──────────────────────────────────────────

# In-memory store for comments for simplicity (mock DB)
# Maps attack_type -> list of Comment records
comments_db: dict[str, list[dict]] = {
    "sql_injection": [
        {"author": "alice@state.edu", "body": "I had this issue in my CS401 project! Prepared statements fixed it.", "timestamp": "2026-03-01T10:00:00Z"}
    ]
}

class CommentCreate(BaseModel):
    author: str
    body: str

@router.get("/comments/{attack_type}")
async def get_comments(attack_type: str):
    return comments_db.get(attack_type, [])

@router.post("/comments/{attack_type}")
async def post_comment(attack_type: str, comment: CommentCreate):
    import datetime
    record = {
        "author": comment.author,
        "body": comment.body,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    if attack_type not in comments_db:
        comments_db[attack_type] = []
    comments_db[attack_type].append(record)
    return record

# ── 3. Events Feed ──────────────────────────────────────────────────────────

@router.get("/events")
async def get_events():
    return [
        {
            "id": "evt-1",
            "title": "Spring Collegiate CTF 2026",
            "date": "March 15-17, 2026",
            "type": "Capture The Flag",
            "link": "https://ctf.university.edu",
            "description": "A 48-hour beginner-friendly CTF covering web exploitation and cryptography."
        },
        {
            "id": "evt-2",
            "title": "CyberSec Symposium Guest Lecture",
            "date": "March 22, 2026",
            "type": "Seminar",
            "link": "#",
            "description": "Industry experts from top cybersecurity firms discuss the impact of LLM vulnerabilities."
        },
        {
            "id": "evt-3",
            "title": "DefCon Campus Hackathon",
            "date": "April 05, 2026",
            "type": "Hackathon",
            "link": "https://hackathon.university.edu",
            "description": "Build a secure-by-design application in 24 hours. Prizes for the top 3 teams!"
        }
    ]
