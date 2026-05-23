# Aproximed

Aproximed is an educational web prototype for exploring **SVD-based X-Ray image compression**.

Users can upload an X-ray image, choose a rank-k value, reconstruct the compressed image, and inspect image quality metrics such as MSE, PSNR, retained SVD energy, SVD matrix ratio, and PNG output ratio.

This project is built for compression analysis and learning purposes only. It is **not intended for medical diagnosis**.

## Features

- Single-image X-ray compression using Singular Value Decomposition
- Rank-k control with recommended rank analysis
- Original vs reconstructed image comparison
- Compression quality metrics:
  - MSE
  - PSNR
  - Retained SVD energy
  - SVD matrix ratio
  - PNG output ratio
- Batch analysis mode for multiple images
- CSV export for batch results
- EN/ID language toggle
- Responsive React frontend with a clean UI

## Tech Stack

### Frontend

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Bun

### Backend

- Python 3.12
- FastAPI
- NumPy
- Pillow
- Scikit-Image

## Project Structure

```txt
aproximed/
  backend/
    main.py
    requirements.txt
    svd_utils.py

  frontend/
    src/
      components/
      pages/
      layouts/
      i18n/
      types/
```

## How It Works

A grayscale X-ray image is represented as a matrix `A`.

The backend applies Singular Value Decomposition:

```txt
A = U Sigma V^T
```

Then only the top `k` singular values are retained:

```txt
A_k = U_k Sigma_k V_k^T
```

A lower rank value usually gives stronger compression, but it may remove fine image details. A higher rank value preserves more structure, but the compression becomes weaker.

## How to Run Locally

This project uses a separate frontend and backend.  
It is recommended to use two active terminals.

### 1. Run the Backend

Open the first terminal:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run at:

```txt
http://localhost:8000
```

### 2. Run the Frontend

Open the second terminal:

```bash
cd frontend
bun install
bun run dev
```

The frontend will run at:

```txt
http://localhost:5173
```

## API Endpoints

### Health Check

```txt
GET /
```

Checks whether the backend API is running.

### Analyze Image

```txt
POST /analyze
```

Analyzes the uploaded image and returns the recommended rank.

### Compress Image

```txt
POST /compress
```

Compresses the uploaded image using the selected rank-k value and returns the reconstructed image with compression metrics.

## Notes

Aproximed is a mathematical and educational prototype.  
It demonstrates how low-rank matrix approximation affects X-ray image reconstruction quality.

This project does not replace clinical image compression standards, medical software, or diagnostic workflows.

## Credit

Created by Gamma Rasyad | L0125013 | 2026