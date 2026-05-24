# Deployment Guide (Split Frontend + Backend)

Deploy backend first, frontend second.

## Project A: Frontend (Vercel)

- Root Directory: `frontend`
- Install Command: `bun install`
- Build Command: `bun run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_URL=https://YOUR_BACKEND_VERCEL_URL`

Local run:

```bash
cd frontend
bun install
bun run dev
```

## Project B: Backend API (Vercel)

- Root Directory: `backend`
- Entrypoint: `api/index.py` (exports `app` from FastAPI)
- Vercel config: `backend/vercel.json`
- Environment Variables:
  - `FRONTEND_ORIGIN=https://YOUR_FRONTEND_VERCEL_URL`

Local run:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```txt
GET /health
=> { "status": "ok" }
```

Upload endpoints already use `multipart/form-data`:

- `POST /analyze`
- `POST /compress`

## Required Deploy Order

1. Deploy backend project and copy URL.
2. Set frontend `VITE_API_URL` to backend URL.
3. Deploy frontend project.

## Production Gotchas

- Do not use `localhost` in Vercel env vars.
- If frontend URL changes, update backend `FRONTEND_ORIGIN`.
- Backend uses NumPy + scikit-image + Pillow. Cold start and function limits on Vercel can be tight for heavy image workloads.
- If Vercel limits become issue, move backend to Railway/Render/Fly/VPS, keep same API contract, update frontend `VITE_API_URL`.
