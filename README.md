# OrbitCheck

A web app that scores whether Starlink satellite internet is right for you based on your location, existing connectivity, budget, and usage habits. Answer 7 questions and get a personalized suitability score, provider comparison, and interactive coverage map.

**Live app:** [orbitcheck.vercel.app](https://orbitcheck.vercel.app)

---

## What It Does

- **7-step form** — collects ZIP code, area type, current connection, primary use case, household size, budget, and available providers
- **Scoring algorithm** — weighs 6 factors (location, coverage gap, budget, latency sensitivity, provider quality, household size) to produce a 0–100 suitability score
- **Verdict** — Yes / Consider It / Not Recommended, with a written explanation
- **Provider breakdown** — compares Starlink against your local ISPs on speed, latency, price, and reliability
- **Interactive map** — Leaflet map with dark tiles, provider pins, and coverage radius circles
- **Shareable results** — every result gets a unique URL (e.g. `/results/a3f9b2`) that anyone can open
- **FCC data integration** — backend queries the FCC Broadband Data API for real ISP availability at your ZIP code

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Plain CSS** — no Tailwind; full design system in `globals.css`
- **Leaflet.js** — interactive map with Carto dark tiles (dynamic import, SSR disabled)
- **Deployed on Vercel**

### Backend
- **Python FastAPI** — REST API with CORS middleware
- **httpx** — async FCC Broadband Data API client
- **SQLite** — stores results for shareable URLs (stdlib `sqlite3`, no ORM)
- **Pydantic** — request/response validation
- **Deployed on Railway** via `uvicorn`

### Standalone Version
- `orbitcheck.html` — fully self-contained single-file version of the app (no server required, open directly in browser)

---

## Project Structure

```
├── frontend/                        # Next.js app (Vercel)
│   ├── app/
│   │   ├── layout.tsx               # Global layout, cursor, scroll reveal
│   │   ├── page.tsx                 # Hero + How It Works (server component)
│   │   ├── tool/page.tsx            # 7-step form (client component)
│   │   └── results/[id]/page.tsx    # Results page (client, fetches backend)
│   ├── components/
│   │   ├── OrbitMap.tsx             # Leaflet map (dynamic, ssr: false)
│   │   ├── ScoreGauge.tsx           # Animated score count-up
│   │   ├── ProviderCard.tsx         # Provider result card
│   │   └── ComparisonTable.tsx      # Full provider comparison table
│   ├── lib/
│   │   ├── scoring.ts               # Scoring algorithm (TypeScript)
│   │   ├── api.ts                   # Fetch wrappers for backend
│   │   └── data.ts                  # Provider data, ZIP coords, type colors
│   └── styles/
│       └── globals.css              # Full design system
├── backend/                         # FastAPI app (Railway)
│   ├── main.py                      # Routes: POST /analyze, GET /results/{id}
│   ├── scoring.py                   # Scoring algorithm (Python)
│   ├── fcc_api.py                   # FCC Broadband API client
│   ├── models.py                    # Pydantic request/response models
│   ├── db.py                        # SQLite result storage
│   └── requirements.txt
└── orbitcheck.html                  # Standalone single-file version
```
