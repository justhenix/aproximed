# Aproximed
Implementasi Kompresi Citra X-Ray Berbasis Singular Value Decomposition.

This prototype demonstrates SVD-based image compression only. It is not used for medical diagnosis.

## Current Project Status
The project is initialized with a basic FastAPI backend, a React + Tailwind CSS v4 frontend, and a simple placeholder UI.
The actual SVD image compression algorithms in `svd_utils.py` are stubs returning `NotImplementedError`.

## Tech Stack
- Frontend: Vite + React + TypeScript + Tailwind CSS v4
- Backend: Python 3.12 + FastAPI + NumPy + Pillow
- Package Manager: Bun

## Folder Structure
```
aproximed/
  backend/            # FastAPI python backend
  frontend/           # React frontend
  sample_images/      # Folder for X-Ray sample images
```

## Setup & Run

### Backend
Open a PowerShell terminal and run:
```powershell
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
Open another PowerShell terminal and run:
```powershell
cd frontend
bun install
bun run dev
```

## License
MIT License

---
Made by Gamma Rasyad (L0125013 UNS Informatics '2025)

