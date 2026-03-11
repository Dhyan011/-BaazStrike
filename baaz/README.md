<![CDATA[<div align="center">

# 🦅 Baaz — AI Security Scanner

**Autonomously attack AI applications to find vulnerabilities.**

20 adversarial probes · 4 attack categories · Real-time streaming · LLM + keyword judge

[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 🔍 What Is Baaz?

Baaz is an **AI red-teaming tool** that scans any AI chatbot endpoint for security vulnerabilities. Point it at a URL, and it autonomously:

1. **Fires 20 attack payloads** across 4 categories
2. **Judges each response** using an LLM (Groq) or built-in keyword engine
3. **Streams results in real-time** via Server-Sent Events
4. **Generates a vulnerability report** with severity ratings and fixes

> Works out of the box — **no API key required**. The keyword-based judge detects leaks automatically. Add a [Groq API key](https://console.groq.com) for deeper LLM-powered analysis.

---

## ⚡ Quick Start

### Prerequisites
- Python 3.11 or 3.12
- Node.js 18+
- npm

### 1. Clone
```bash
git clone https://github.com/Dhyan011/-BaazStrike.git
cd -BaazStrike/baaz
```

### 2. Backend Setup
```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. (Optional) Add Groq API Key
```bash
echo "GROQ_API_KEY=gsk_your_key_here" > .env
```
> Get a free key at [console.groq.com](https://console.groq.com). Without it, the keyword judge runs automatically.

### 4. Start the Backend
```bash
# Terminal 1 — API server
uvicorn main:app --reload --port 8000

# Terminal 2 — Mock vulnerable AI (for testing)
uvicorn target_ai:app --reload --port 8001
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 6. Scan!
Open **http://localhost:3000** → enter **http://localhost:8001/chat** → click **Launch Scan**

---

## 🏗️ Architecture

```
Browser (Next.js :3000)
  │
  ├── POST /scan           → starts background scan
  ├── GET  /scan/:id/stream → SSE live probe events
  ├── GET  /scan/:id       → final ScanReport
  ├── GET  /scans          → last 10 scans
  └── GET  /ping?url=      → health check
  │
FastAPI Backend (:8000)
  │
  ├── attack_engine.py ──→ Target AI endpoint
  │   └── judge_attack() ──→ Groq LLM or keyword fallback
  ├── database.py ──→ SQLite (baaz.db)
  └── report_generator.py ──→ risk score + report assembly
```

---

## 🎯 Attack Categories

| Category | Probes | Goal |
|---|---|---|
| 💉 **Prompt Injection** | 5 | Trick AI into revealing its system prompt |
| 🔓 **Jailbreaking** | 5 | Bypass safety via personas (DAN, evil twin) |
| 📤 **Data Extraction** | 5 | Extract emails, API keys, user data |
| ⬆️ **Privilege Escalation** | 5 | Claim admin access to get restricted info |

---

## 🧠 Dual Judge System

### Keyword Judge (always available — no API key needed)
- **24 regex signatures** across all 4 attack categories
- Detects: email addresses, `sk-*` tokens, `DAN:` prefix, admin grants, SQL output, system prompt echoes
- Recognises refusal phrases ("I'm sorry", "I cannot") → `success=False`

### Groq LLM Judge (when API key is set)
- Uses **llama3-8b-8192** for nuanced analysis
- Returns structured JSON: `{success, severity, exposed, explanation, fix}`
- Auto-falls back to keyword judge on any failure

---

## 📊 Risk Score

```
risk_score = min(100, CRITICAL×30 + HIGH×15 + MEDIUM×7 + LOW×3)
```

| Score | Label |
|---|---|
| 0 | 🔵 SECURE |
| 1–24 | 🟢 LOW RISK |
| 25–49 | 🟡 MEDIUM RISK |
| 50–74 | 🟠 HIGH RISK |
| 75–100 | 🔴 CRITICAL RISK |

---

## 🖥️ Frontend Features

| Feature | Description |
|---|---|
| **Health Check** | Auto-pings target as you type — shows latency |
| **Progress Bar** | 4-segment bar fills in real-time (per attack category) |
| **Live Feed** | Scrolling terminal-style attack log with colour-coded severity |
| **Summary Cards** | 6 tiles: Critical / High / Medium / Low / Total / Probes |
| **Risk Meter** | Animated SVG arc gauge (0–100) |
| **Attack Coverage** | Per-category slot grid — glowing = breach, grey = defended |
| **Scan History** | Collapsible panel — last 10 scans, click to reload |
| **Severity Filter** | Chips to filter vulnerability list by severity |
| **Export** | Download report as `.json` or `.md` |

---

## 📁 Project Structure

```
baaz/
├── backend/
│   ├── main.py              # API routes + SSE streaming
│   ├── attack_engine.py     # 20 payloads + dual judge
│   ├── target_ai.py         # Mock vulnerable AI for testing
│   ├── database.py          # Async SQLite (aiosqlite)
│   ├── models.py            # Pydantic data models
│   ├── report_generator.py  # Risk scoring + report assembly
│   ├── requirements.txt
│   └── .env                 # GROQ_API_KEY (git-ignored)
└── frontend/
    ├── app/
    │   ├── page.tsx          # Main page — all state + wiring
    │   ├── layout.tsx        # Root HTML + metadata
    │   ├── globals.css       # Dark cyberpunk theme
    │   └── components/
    │       ├── Header.tsx
    │       ├── ScanInput.tsx
    │       ├── HealthCheck.tsx
    │       ├── ScanProgress.tsx
    │       ├── LiveFeed.tsx
    │       ├── SummaryCards.tsx
    │       ├── RiskMeter.tsx
    │       ├── AttackCoverage.tsx
    │       ├── ScanHistory.tsx
    │       ├── SeverityFilterBar.tsx
    │       └── VulnerabilityCard.tsx
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── next.config.js
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/scan` | Start a scan → returns `{scan_id}` |
| `GET` | `/scan/{id}/stream` | SSE stream of live probe events |
| `GET` | `/scan/{id}` | Full scan report (after completion) |
| `GET` | `/scans` | Last 10 scans |
| `GET` | `/ping?url=` | Check target reachability + latency |
| `GET` | `/health` | Server status |

---

## 🛡️ Mock Target AI

`target_ai.py` is a deliberately vulnerable AI chatbot for safe testing. It:
- Randomly leaks a fake system prompt, email list, and API key when attacked
- Has configurable leak probabilities per attack type
- Returns safe refusal responses when defences hold

---

## 🧰 Tech Stack

| Layer | Tool |
|---|---|
| Backend | FastAPI · Python 3.12 · uvicorn |
| Database | aiosqlite (async SQLite) |
| HTTP | httpx (async) |
| LLM | Groq llama3-8b-8192 |
| Frontend | Next.js 14 · React 18 |
| Styling | Tailwind CSS · custom glassmorphism theme |
| Animation | framer-motion |
| Icons | lucide-react |

---

## ⚠️ Disclaimer

Baaz is a **security research and educational tool**. Only scan AI endpoints that you own or have explicit permission to test. Unauthorised scanning may violate terms of service or laws in your jurisdiction.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
<sub>Built with ❤️ by <a href="https://github.com/Dhyan011">Dhyan011</a></sub>
</div>
]]>
