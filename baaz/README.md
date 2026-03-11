<div align="center">

# Baaz

### AI Security Scanner

Baaz autonomously red-teams AI chatbot endpoints — firing adversarial probes, analysing each response in real time, and delivering a structured vulnerability report with actionable fixes.

[![Python 3.12](https://img.shields.io/badge/python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-000?logo=next.js)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## Why Baaz?

Most AI applications go to production without adversarial testing. Baaz fills that gap — give it a URL, and it will systematically probe for prompt injection, jailbreaking, data leakage, and privilege escalation, then tell you exactly what's broken and how to fix it.

- **Zero-config scanning** — works immediately without any API key
- **Real-time streaming** — watch attacks land as they happen via SSE
- **Dual judge engine** — keyword regex analysis + optional Groq LLM for deeper insight
- **Exportable reports** — download results as JSON or Markdown

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11 or 3.12 |
| Node.js | 18+ |
| npm | 9+ |

### Setup

```bash
# Clone the repo
git clone https://github.com/Dhyan011/-BaazStrike.git
cd -BaazStrike/baaz

# Backend
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### Run

Open three terminals:

```bash
# 1. API server
cd baaz/backend && source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

```bash
# 2. Mock target (for testing)
cd baaz/backend && source .venv/bin/activate
uvicorn target_ai:app --reload --port 8001
```

```bash
# 3. Frontend
cd baaz/frontend
npm run dev
```

Open **http://localhost:3000**, enter `http://localhost:8001/chat`, and hit **Launch Scan**.

---

## How It Works

Baaz runs a 4-phase cycle for each of its **20 probes**:

1. **Fire** — sends an adversarial payload to the target endpoint via HTTP POST
2. **Capture** — records the AI's raw response
3. **Judge** — analyses the response for signs of compromise (keyword engine or Groq LLM)
4. **Stream** — pushes the result to the browser in real time via Server-Sent Events

After all 20 probes complete, the results are scored, categorised, and assembled into a report.

### Attack Categories

| Category | What it tests | Probes |
|----------|--------------|--------|
| **Prompt Injection** | Can the AI be tricked into revealing its system prompt? | 5 |
| **Jailbreaking** | Can safety guidelines be bypassed via persona framing? | 5 |
| **Data Extraction** | Does the AI leak PII, credentials, or internal data? | 5 |
| **Privilege Escalation** | Can a user claim admin rights to access restricted info? | 5 |

### Judgement Engine

The scanner ships with two judges:

**Keyword Judge** — Built-in, always available. Uses 24 regex signatures to detect leaked emails, API keys, system prompts, SQL output, admin confirmations, and more. Also recognises standard AI refusal phrases.

**Groq LLM Judge** — Optional. When a valid `GROQ_API_KEY` is set in `.env`, Baaz sends each probe result to `llama3-8b-8192` for deeper contextual analysis. Falls back to the keyword judge automatically on any failure.

### Risk Score

```
Score = min(100, CRITICAL×30 + HIGH×15 + MEDIUM×7 + LOW×3)
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Endpoint Health Check** | Auto-pings the target URL as you type, showing latency and connectivity |
| **Live Attack Feed** | Real-time scrolling log with per-probe severity and attack type |
| **Progress Tracker** | Segmented bar showing progress across all 4 attack categories |
| **Risk Meter** | Animated gauge visualising the overall risk score (0–100) |
| **Severity Summary** | At-a-glance cards for Critical, High, Medium, Low, Total, and Probes |
| **Attack Coverage Chart** | Visual breakdown of successes vs. defences per category |
| **Scan History** | Collapsible panel of past scans — click any to reload its report |
| **Severity Filter** | Filter the vulnerability list by severity level |
| **Report Export** | Download full results as `.json` or `.md` |

---

## Project Structure

```
baaz/
├── backend/
│   ├── main.py              # API routes, SSE streaming, background scan worker
│   ├── attack_engine.py     # 20 payloads, dual judge system
│   ├── target_ai.py         # Mock vulnerable AI for safe testing
│   ├── database.py          # Async SQLite via aiosqlite
│   ├── models.py            # Pydantic request/response schemas
│   ├── report_generator.py  # Risk scoring and report assembly
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── page.tsx          # Main page — state management and wiring
    │   ├── layout.tsx        # Root layout and SEO metadata
    │   ├── globals.css       # Design system and theme
    │   └── components/       # 11 React components
    ├── tailwind.config.js
    └── package.json
```

---

## API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/scan` | Start a new scan |
| `GET` | `/scan/{id}/stream` | SSE stream of live probe results |
| `GET` | `/scan/{id}` | Fetch completed scan report |
| `GET` | `/scans` | List recent scans |
| `GET` | `/ping?url=` | Check target reachability |

---

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | No | Groq API key for LLM-powered judgement. Get one free at [console.groq.com](https://console.groq.com). Without it, the keyword judge runs automatically. |

Create a `.env` file in the `backend/` directory:

```
GROQ_API_KEY=gsk_your_key_here
```

---

## Tech Stack

**Backend** — FastAPI · Python 3.12 · aiosqlite · httpx · Groq SDK  
**Frontend** — Next.js 14 · React 18 · Tailwind CSS · framer-motion · lucide-react

---

## Disclaimer

Baaz is a security research and educational tool. Only scan endpoints you own or have explicit written permission to test. Unauthorised scanning may violate applicable laws and terms of service.

---

## License

MIT

---

<div align="center">
<sub>Built by <a href="https://github.com/Dhyan011">Dhyan Patel</a></sub>
</div>
