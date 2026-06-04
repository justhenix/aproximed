# Aproximed

Aproximed is a web prototype for **SVD-based X-ray image compression**. Upload image → choose rank-k or use recommended rank → compare original vs reconstructed image → inspect compression metrics.

> Educational prototype only. Not for medical diagnosis.

## Features

- Single-image compression with rank-k control
- Recommended rank analysis
- Batch image compression
- Metrics: MSE, PSNR, SSIM, retained SVD energy, SVD ratio, PNG output ratio, size reduction
- Batch CSV report + compressed images ZIP
- EN/ID interface

## Stack

**Frontend:** Vite, React, TypeScript, Tailwind CSS, React Router, Bun  
**Backend:** FastAPI, Python, NumPy, Pillow, scikit-image, Uvicorn

## Run Locally

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs at `http://localhost:8000`.

Frontend:

```bash
cd frontend
bun install
bun run dev
```

Runs at `http://localhost:5173`.

For deployed frontend, set:

```env
VITE_API_URL=https://your-backend-url
```

Local dev defaults to `http://localhost:8000`.

## API

<details>
<summary>Endpoints</summary>

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | API status message |
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Analyze image + recommend rank |
| `POST` | `/compress` | Compress one image |
| `POST` | `/batch/images` | Compress multiple uploaded images |

`/analyze` accepts form-data `image`.

`/compress` accepts form-data `image` + `rank`.

`/batch/images` accepts form-data `images` + `rank`, with optional `include_report_csv`, `include_compressed_zip`, and `include_all_results_zip`.

</details>

## Input Rules

Supported images: `.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.tif`, `.tiff`.

Max upload size: `10 MB` per image.

Backend max SVD processing dimension defaults to `1024`, configurable with:

```env
MAX_SVD_DIMENSION=1024
```

## Project Structure

```txt
aproximed/
  backend/   FastAPI API + SVD utilities
  frontend/  React frontend
```

## Build Frontend

```bash
cd frontend
bun run build
```

## Notes

- Compressed output format = PNG.
- `rank <= 0` enables backend adaptive rank mode.
- CSV/ZIP are generated outputs for batch compression, not upload inputs.

## Acknowledgement

X-ray images provided by the [NIH Clinical Center](https://www.kaggle.com/datasets/nih-chest-xrays/data)

Dataset Citation: Wang X, Peng Y, Lu L, Lu Z, Bagheri M, Summers RM. "ChestX-ray8: Hospital-scale Chest X-ray Database and Benchmarks on Weakly-Supervised Classification and Localization of Common Thorax Diseases." IEEE CVPR 2017.
