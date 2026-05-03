# Team Task Manager (Railway-ready)

## Backend

- Path: `backend`
- Stack: Flask + SQLAlchemy + PostgreSQL
- Auth: Session cookies (no JWT)
- Run locally:
  - `cd backend`
  - `pip install -r requirements.txt`
  - `set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team_task_manager`
  - `python app.py`
- Railway start command is provided via `backend/Procfile` (`gunicorn app:app`).

## Frontend

- Path: `frontend`
- Stack: React (Vite) + Tailwind CSS + Axios
- Axios is configured with `withCredentials: true`.
- Run locally:
  - `cd frontend`
  - `npm install`
  - `npm run dev`

## Environment variables

- Backend:
  - `DATABASE_URL`
  - `SECRET_KEY`
  - `CORS_ORIGINS` (comma-separated, e.g. `http://localhost:5173`)
  - `SESSION_COOKIE_SECURE` (`True` in production on Railway)
  - `SESSION_COOKIE_SAMESITE` (`None` for cross-site cookie usage if needed)
- Frontend:
  - `VITE_API_URL` (e.g. `https://your-backend.up.railway.app/api`)
