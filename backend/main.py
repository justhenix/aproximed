from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import base64
from PIL import Image
import numpy as np

from svd_utils import (
    preprocess_image,
    compress_matrix_svd,
    calculate_mse,
    calculate_psnr,
    calculate_compression_ratio,
    calculate_retained_energy,
    calculate_recommended_rank,
    matrix_to_base64_png
)

app = FastAPI(title="Aproximed API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"message": "Aproximed API is running"}

@app.post("/analyze")
async def analyze_image(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        img = Image.open(io.BytesIO(image_bytes))
        matrix = preprocess_image(img)
        
        max_rank = min(matrix.shape)
        # Compute SVD to get singular values
        _, S, _ = np.linalg.svd(matrix, full_matrices=False)
        recommended_rank = calculate_recommended_rank(S, target_energy=0.999)
        
        return {
            "filename": image.filename,
            "recommended_rank": recommended_rank,
            "max_rank": max_rank
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/compress")
async def compress_image(image: UploadFile = File(...), rank: int = Form(...)):
    try:
        # Read image bytes and get original size
        image_bytes = await image.read()
        original_size = len(image_bytes)
        
        # Open image and preprocess
        img = Image.open(io.BytesIO(image_bytes))
        matrix = preprocess_image(img)
        
        # Clamp rank safely
        max_rank = min(matrix.shape)
        safe_rank = max(1, min(rank, max_rank))
        
        # Compress matrix
        compressed_matrix = compress_matrix_svd(matrix, safe_rank)
        
        # Compute SVD singular values for metrics
        U, S, Vt = np.linalg.svd(matrix, full_matrices=False)
        
        # Compute metrics
        mse = calculate_mse(matrix, compressed_matrix)
        psnr = calculate_psnr(mse)
        retained_energy = calculate_retained_energy(S, safe_rank)
        # Use 99.9% energy threshold — more conservative for X-ray images than 95%
        recommended_rank = calculate_recommended_rank(S, target_energy=0.999)

        # Convert compressed matrix to base64 PNG
        compressed_image_base64 = matrix_to_base64_png(compressed_matrix)

        height, width = matrix.shape
        # Theoretical SVD matrix storage ratio:
        # original stores height*width values; rank-k SVD stores k*(height+width+1)
        svd_compression_ratio = (height * width) / (safe_rank * (height + width + 1))

        # Practical PNG output ratio: uploaded file bytes vs decoded compressed PNG bytes
        compressed_size = len(base64.b64decode(compressed_image_base64))
        png_output_ratio = calculate_compression_ratio(original_size, compressed_size)

        return {
            "message": "compression successful",
            "filename": image.filename,
            "rank": safe_rank,
            "recommended_rank": recommended_rank,
            "mse": mse,
            "psnr": psnr,
            "svd_compression_ratio": svd_compression_ratio,
            "png_output_ratio": png_output_ratio,
            "compression_ratio": png_output_ratio,  # backward compat
            "retained_energy": retained_energy,
            "compressed_image_base64": compressed_image_base64
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)