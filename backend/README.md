# SURGE FastAPI backend

The Vite frontend uses the root [`app.py`](../app.py) API because it exposes the `/states`, `/cities`, `/forecast/hybrid`, `/metrics`, and dispatch routes used by the dashboard. The `backend/app/main.py` service is a separate authenticated API and does not provide those legacy dashboard routes.

## Run locally

```bash
cd ..
python -m venv backend/.venv
backend/.venv/bin/pip install -r requirements.txt
backend/.venv/bin/python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The frontend is started separately:

```bash
cd frontend
npm run dev
```

It is available at `http://localhost:5173`, and the backend health/API is available at `http://localhost:8000`.
