from __future__ import annotations

import base64
import csv
import io
import os
import re
import time
import zipfile
from pathlib import PurePosixPath
from typing import Any

import numpy as np
import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

try:
    from skimage.metrics import structural_similarity as structural_similarity_metric
except Exception:  # pragma: no cover - optional runtime fallback
    structural_similarity_metric = None

from svd_utils import (
    calculate_compression_ratio,
    calculate_mse,
    calculate_psnr,
    calculate_recommended_rank,
    calculate_rank_presets,
    calculate_retained_energy,
    compress_matrix_svd,
    matrix_to_png_bytes,
    preprocess_image,
)

app = FastAPI(title="Aproximed API")

SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}

def _is_image_grayscale(img: Image.Image) -> bool:
    if img.mode in ("L", "1", "I", "LA", "I;16", "F"):
        return True
    try:
        img_rgb = img.convert("RGB")
        img_rgb.thumbnail((128, 128))
        arr = np.array(img_rgb, dtype=np.int32)
        rg_diff = np.mean(np.abs(arr[:,:,0] - arr[:,:,1]))
        rb_diff = np.mean(np.abs(arr[:,:,0] - arr[:,:,2]))
        gb_diff = np.mean(np.abs(arr[:,:,1] - arr[:,:,2]))
        return bool((rg_diff + rb_diff + gb_diff) < 5.0)
    except Exception:
        return False

def get_allowed_origins() -> list[str]:
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "")

    for origin in frontend_origin.split(","):
        clean_origin = origin.strip()
        if clean_origin and clean_origin not in origins:
            origins.append(clean_origin)

    return origins


# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _sanitize_filename_stem(value: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9._-]+", "_", value.strip())
    safe = safe.strip("._-")
    return safe or "image"


def _is_supported_image_filename(filename: str) -> bool:
    extension = PurePosixPath(filename).suffix.lower()
    return extension in SUPPORTED_IMAGE_EXTENSIONS


def _safe_float_or_none(value: float | np.floating[Any] | None) -> float | None:
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if not np.isfinite(number):
        return None
    return number


def _compress_image_bytes(image_bytes: bytes, filename: str, rank: int) -> tuple[dict[str, Any], bytes]:
    started = time.perf_counter()

    if not image_bytes:
        raise ValueError("Image file is empty")

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            original_width, original_height = img.size
            original_format = (img.format or "UNKNOWN").upper()
            is_gray = _is_image_grayscale(img)
            matrix = preprocess_image(img)
    except UnidentifiedImageError as exc:
        raise ValueError("Unsupported or invalid image file") from exc

    max_rank = min(matrix.shape)
    safe_rank = max(1, min(int(rank), max_rank))
    compressed_matrix = compress_matrix_svd(matrix, safe_rank)

    U, singular_values, Vt = np.linalg.svd(matrix, full_matrices=False)
    mse = calculate_mse(matrix, compressed_matrix)
    psnr = calculate_psnr(mse)
    retained_energy = calculate_retained_energy(singular_values, safe_rank)
    
    presets = calculate_rank_presets(
        matrix, U, singular_values, Vt, 
        is_medical_or_grayscale=is_gray, 
        ssim_metric=structural_similarity_metric
    )
    recommended_rank = presets["recommended_rank"]

    ssim: float | None = None
    if structural_similarity_metric is not None:
        try:
            ssim = _safe_float_or_none(
                structural_similarity_metric(
                    matrix.astype(np.float32),
                    compressed_matrix.astype(np.float32),
                    data_range=255.0,
                )
            )
        except Exception:
            ssim = None

    compressed_png_bytes = matrix_to_png_bytes(compressed_matrix)
    compressed_image_base64 = base64.b64encode(compressed_png_bytes).decode("utf-8")

    original_size = len(image_bytes)
    compressed_size = len(compressed_png_bytes)
    bytes_saved = original_size - compressed_size
    size_reduction_pct = ((bytes_saved / original_size) * 100) if original_size > 0 else None

    height, width = matrix.shape
    svd_compression_ratio = (height * width) / (safe_rank * (height + width + 1))
    png_output_ratio = (
        calculate_compression_ratio(original_size, compressed_size) if compressed_size > 0 else None
    )
    elapsed_ms = (time.perf_counter() - started) * 1000

    payload = {
        "message": "compression successful",
        "filename": filename,
        "rank": safe_rank,
        "recommended_rank": recommended_rank,
        "small_rank": presets["small_rank"],
        "high_quality_rank": presets["high_quality_rank"],
        "recommended_reason": presets["recommended_reason"],
        "target_ssim": presets["target_ssim"],
        "target_psnr": presets["target_psnr"],
        "target_retained_energy": presets["target_retained_energy"],
        "actual_ssim_at_recommended": presets["actual_ssim_at_recommended"],
        "actual_psnr_at_recommended": presets["actual_psnr_at_recommended"],
        "retained_energy_at_recommended": presets["retained_energy_at_recommended"],
        "mse": _safe_float_or_none(mse),
        "psnr": _safe_float_or_none(psnr),
        "ssim": ssim,
        "svd_compression_ratio": _safe_float_or_none(svd_compression_ratio),
        "png_output_ratio": _safe_float_or_none(png_output_ratio),
        "compression_ratio": _safe_float_or_none(png_output_ratio),  # backward compat
        "retained_energy": _safe_float_or_none(retained_energy),
        "compressed_image_base64": compressed_image_base64,
        "compressed_mime_type": "image/png",
        "original_format": original_format,
        "compressed_format": "PNG",
        "original_width": int(original_width),
        "original_height": int(original_height),
        "compressed_width": int(width),
        "compressed_height": int(height),
        "original_size_bytes": int(original_size),
        "compressed_size_bytes": int(compressed_size),
        "bytes_saved": int(bytes_saved),
        "size_reduction_pct": _safe_float_or_none(size_reduction_pct),
        "processing_time_ms": _safe_float_or_none(elapsed_ms),
    }
    return payload, compressed_png_bytes


def _build_report_csv(
    per_image_results: list[dict[str, Any]],
    skipped_files: list[dict[str, str]],
) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "filename",
            "status",
            "original_size_bytes",
            "compressed_size_bytes",
            "bytes_saved",
            "reduction_percent",
            "compression_ratio",
            "original_width",
            "original_height",
            "compressed_width",
            "compressed_height",
            "output_format",
            "rank_k",
            "retained_energy_percent",
            "psnr",
            "ssim",
            "processing_time_ms",
            "error",
        ]
    )

    for row in per_image_results:
        retained_energy_percent = row.get("retained_energy")
        if isinstance(retained_energy_percent, (int, float)):
            retained_energy_percent = float(retained_energy_percent) * 100.0

        writer.writerow(
            [
                row.get("filename", row.get("zip_filename", "")),
                row.get("status", ""),
                row.get("original_size_bytes", ""),
                row.get("compressed_size_bytes", ""),
                row.get("bytes_saved", ""),
                row.get("size_reduction_pct", ""),
                row.get("compression_ratio", ""),
                row.get("original_width", ""),
                row.get("original_height", ""),
                row.get("compressed_width", ""),
                row.get("compressed_height", ""),
                row.get("compressed_format", row.get("output_format", "")),
                row.get("rank", row.get("rank_k", "")),
                retained_energy_percent if retained_energy_percent is not None else "",
                row.get("psnr", ""),
                row.get("ssim", ""),
                row.get("processing_time_ms", ""),
                row.get("error", ""),
            ]
        )

    if skipped_files:
        writer.writerow([])
        writer.writerow(["skipped_files"])
        writer.writerow(["filename", "reason"])
        for item in skipped_files:
            writer.writerow([item.get("filename", ""), item.get("reason", "")])

    return output.getvalue()


def _build_compressed_name(original_name: str, used_names: set[str]) -> str:
    original_stem = _sanitize_filename_stem(PurePosixPath(original_name).stem)
    candidate = f"{original_stem}_compressed.png"
    suffix = 2

    while candidate.lower() in used_names:
        candidate = f"{original_stem}_compressed_{suffix}.png"
        suffix += 1

    used_names.add(candidate.lower())
    return candidate


def _build_zip_base64(members: list[tuple[str, bytes]]) -> str:
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as archive:
        for file_name, file_bytes in members:
            archive.writestr(file_name, file_bytes)
    return base64.b64encode(zip_buffer.getvalue()).decode("utf-8")


async def _run_direct_batch_compression(
    images: list[UploadFile],
    rank: int,
    include_report_csv: bool = True,
    include_compressed_zip: bool = True,
    include_all_results_zip: bool = False,
) -> dict[str, Any]:
    if not images:
        raise ValueError("At least one image file is required")

    per_image_results: list[dict[str, Any]] = []
    skipped_files: list[dict[str, str]] = []
    compressed_members: list[tuple[str, bytes]] = []
    compressed_used_names: set[str] = set()

    for index, image in enumerate(images, start=1):
        filename = (image.filename or f"image_{index}.bin").strip() or f"image_{index}.bin"

        if not _is_supported_image_filename(filename):
            skipped_files.append({"filename": filename, "reason": "unsupported_type"})
            per_image_results.append(
                {
                    "filename": filename,
                    "status": "skipped",
                    "original_size_bytes": None,
                    "compressed_size_bytes": None,
                    "bytes_saved": None,
                    "size_reduction_pct": None,
                    "compression_ratio": None,
                    "original_width": None,
                    "original_height": None,
                    "compressed_width": None,
                    "compressed_height": None,
                    "compressed_format": None,
                    "rank": None,
                    "retained_energy": None,
                    "psnr": None,
                    "ssim": None,
                    "processing_time_ms": None,
                    "error": "Unsupported image type",
                }
            )
            continue

        try:
            image_bytes = await image.read()
            compressed_payload, compressed_png_bytes = _compress_image_bytes(
                image_bytes=image_bytes,
                filename=filename,
                rank=rank,
            )

            per_image_results.append(
                {
                    "filename": filename,
                    "status": "done",
                    "original_size_bytes": compressed_payload["original_size_bytes"],
                    "compressed_size_bytes": compressed_payload["compressed_size_bytes"],
                    "bytes_saved": compressed_payload["bytes_saved"],
                    "size_reduction_pct": compressed_payload["size_reduction_pct"],
                    "compression_ratio": compressed_payload["compression_ratio"],
                    "original_width": compressed_payload["original_width"],
                    "original_height": compressed_payload["original_height"],
                    "compressed_width": compressed_payload["compressed_width"],
                    "compressed_height": compressed_payload["compressed_height"],
                    "compressed_format": compressed_payload["compressed_format"],
                    "rank": compressed_payload["rank"],
                    "retained_energy": compressed_payload["retained_energy"],
                    "psnr": compressed_payload["psnr"],
                    "ssim": compressed_payload.get("ssim"),
                    "processing_time_ms": compressed_payload["processing_time_ms"],
                    "error": None,
                }
            )

            zip_name = _build_compressed_name(filename, compressed_used_names)
            compressed_members.append((f"compressed/{zip_name}", compressed_png_bytes))
        except Exception as exc:
            per_image_results.append(
                {
                    "filename": filename,
                    "status": "failed",
                    "original_size_bytes": None,
                    "compressed_size_bytes": None,
                    "bytes_saved": None,
                    "size_reduction_pct": None,
                    "compression_ratio": None,
                    "original_width": None,
                    "original_height": None,
                    "compressed_width": None,
                    "compressed_height": None,
                    "compressed_format": None,
                    "rank": None,
                    "retained_energy": None,
                    "psnr": None,
                    "ssim": None,
                    "processing_time_ms": None,
                    "error": str(exc),
                }
            )

    report_csv_text = _build_report_csv(
        per_image_results=per_image_results,
        skipped_files=skipped_files,
    )
    report_bytes = report_csv_text.encode("utf-8")

    success_count = sum(1 for item in per_image_results if item.get("status") == "done")
    failed_count = sum(1 for item in per_image_results if item.get("status") == "failed")
    skipped_count = sum(1 for item in per_image_results if item.get("status") == "skipped")

    response: dict[str, Any] = {
        "total_files": len(images),
        "success_count": success_count,
        "failed_count": failed_count,
        "skipped_count": skipped_count,
        "skipped_files": skipped_files,
        "per_image_results": per_image_results,
    }

    if include_report_csv:
        response["report_csv_base64"] = base64.b64encode(report_bytes).decode("utf-8")
        response["report_filename"] = "report.csv"

    if include_compressed_zip and compressed_members:
        response["compressed_images_zip_base64"] = _build_zip_base64(compressed_members)
        response["compressed_images_zip_filename"] = "compressed-images.zip"

    if include_all_results_zip:
        all_results_members: list[tuple[str, bytes]] = [("report.csv", report_bytes)]
        all_results_members.extend(compressed_members)
        response["all_results_zip_base64"] = _build_zip_base64(all_results_members)
        response["all_results_zip_filename"] = "batch-results.zip"

    return response


@app.get("/")
def health_check() -> dict[str, str]:
    return {"message": "Aproximed API is running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_image(image: UploadFile = File(...)) -> dict[str, Any]:
    try:
        image_bytes = await image.read()
        with Image.open(io.BytesIO(image_bytes)) as img:
            is_gray = _is_image_grayscale(img)
            matrix = preprocess_image(img)

        max_rank = min(matrix.shape)
        U, singular_values, Vt = np.linalg.svd(matrix, full_matrices=False)
        
        presets = calculate_rank_presets(
            matrix, U, singular_values, Vt, 
            is_medical_or_grayscale=is_gray, 
            ssim_metric=structural_similarity_metric
        )

        return {
            "filename": image.filename,
            "recommended_rank": presets["recommended_rank"],
            "small_rank": presets["small_rank"],
            "high_quality_rank": presets["high_quality_rank"],
            "recommended_reason": presets["recommended_reason"],
            "max_rank": max_rank,
            "target_ssim": presets["target_ssim"],
            "target_psnr": presets["target_psnr"],
            "target_retained_energy": presets["target_retained_energy"],
            "actual_ssim_at_recommended": presets["actual_ssim_at_recommended"],
            "actual_psnr_at_recommended": presets["actual_psnr_at_recommended"],
            "retained_energy_at_recommended": presets["retained_energy_at_recommended"],
            "is_grayscale": is_gray
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/compress")
async def compress_image(image: UploadFile = File(...), rank: int = Form(...)) -> dict[str, Any]:
    try:
        image_bytes = await image.read()
        filename = image.filename or "uploaded_image"
        payload, _ = _compress_image_bytes(image_bytes=image_bytes, filename=filename, rank=rank)
        return payload
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/batch/images")
async def compress_batch_uploaded_images(
    images: list[UploadFile] = File(...),
    rank: int = Form(...),
    include_report_csv: bool = Form(True),
    include_compressed_zip: bool = Form(True),
    include_all_results_zip: bool = Form(False),
) -> dict[str, Any]:
    try:
        return await _run_direct_batch_compression(
            images=images,
            rank=rank,
            include_report_csv=include_report_csv,
            include_compressed_zip=include_compressed_zip,
            include_all_results_zip=include_all_results_zip,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
