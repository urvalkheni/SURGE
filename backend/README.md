# SURGE FastAPI backend

This service provides the server-only integration boundary for Supabase and Open-Meteo. It never sends operational commands to SCADA, batteries, or grid assets; recommendations remain records for people to acknowledge.

## Run locally

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` for authenticated persistence endpoints. Configure `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in the Next.js app to use it. Without a reachable backend, the frontend preserves its clearly labelled deterministic demo fallback.
