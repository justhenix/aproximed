import base64
import io

import numpy as np
from PIL import Image

def preprocess_image(image: Image.Image, max_dimension: int | None = None) -> np.ndarray:
    grayscale_image = image.convert("L")
    if max_dimension and max_dimension > 0:
        width, height = grayscale_image.size
        longest_side = max(width, height)
        if longest_side > max_dimension:
            scale = max_dimension / longest_side
            next_size = (
                max(1, round(width * scale)),
                max(1, round(height * scale)),
            )
            grayscale_image = grayscale_image.resize(next_size, Image.Resampling.LANCZOS)
    matrix = np.array(grayscale_image, dtype=np.float32)
    return matrix

def _clamp_rank(rank: int, max_rank: int) -> int:
    if rank < 1:
        raise ValueError("rank must be at least 1")
    return min(rank, max_rank)

def decompose_matrix_svd(matrix: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    return np.linalg.svd(matrix, full_matrices=False)

def calculate_singular_values(matrix: np.ndarray) -> np.ndarray:
    return np.linalg.svd(matrix, full_matrices=False, compute_uv=False)

def reconstruct_matrix_svd(U: np.ndarray, S: np.ndarray, Vt: np.ndarray, rank: int) -> np.ndarray:
    rank = _clamp_rank(rank, len(S))
    U_k = U[:, :rank]
    S_k = S[:rank]
    Vt_k = Vt[:rank, :]
    compressed_matrix = (U_k * S_k) @ Vt_k
    compressed_matrix = np.clip(compressed_matrix, 0, 255)
    return compressed_matrix.astype(np.float32)

# Image postprocessing: convert numpy array back to PIL Image
def compress_matrix_svd(matrix: np.ndarray, rank: int) -> np.ndarray:
    U, S, Vt = decompose_matrix_svd(matrix)
    return reconstruct_matrix_svd(U, S, Vt, rank)

# Calculation for average of squared pixel errors (MSE)
def calculate_mse(original: np.ndarray, compressed: np.ndarray) -> float:
    diff = original.astype(np.float32) - compressed.astype(np.float32)
    
    # MSE is calculated as the average of squared differences
    # between the original and compressed images
    mse = np.mean(diff ** 2)
    return float(mse)

# Calculation for Peak Signal-to-Noise Ratio (PSNR)
def calculate_psnr(mse: float, max_val: float = 255.0) -> float:
    if mse == 0:
        return float("inf")
    
    # PSNR is calculated using the formula: PSNR = 20 * log10(MAX_I / sqrt(MSE))
    psnr = 20 * np.log10(max_val / np.sqrt(mse))
    return float(psnr)

# Calculation for compression ratio: original size divided by compressed size
def calculate_compression_ratio(original_size: int, compressed_size: int) -> float:
    if compressed_size <= 0:
        raise ValueError("compressed_size must be greater than 0")
    return float(original_size) / float(compressed_size)

# Retained Energy = (sum of squares of retained singular values) / total energy.
# In SVD image compression, this measures the % of total variance (information) 
# preserved. Because the top singular values capture the most variance, keeping 
# only the top 'rank' values tells us how much image data is retained vs. lost.
def calculate_retained_energy(singular_values: np.ndarray, rank: int) -> float:
    if rank < 1:
        raise ValueError("rank must be at least 1")
    
    if singular_values.size == 0:
        raise ValueError("singular_values array cannot be empty")
    
    max_rank = singular_values.size
    
    if rank > max_rank:
        rank = max_rank
        
    total_energy = np.sum(singular_values ** 2)
    
    if total_energy == 0:
        return 0.0
    
    retained_energy = np.sum(singular_values[:rank] ** 2) / total_energy
    return float(retained_energy)

# Calculate the recommended rank based on the cumulative energy of singular values.
# Preserved for backward compatibility if needed.
def calculate_recommended_rank(singular_values: np.ndarray, target_energy: float = 0.95) -> int:
    if singular_values.size == 0:
        raise ValueError("singular_values array cannot be empty")
    
    if target_energy <= 0 or target_energy > 1:
        raise ValueError("target_energy must between 0 and 1")
    
    energy = singular_values ** 2
    total_energy = np.sum(energy)
    
    if total_energy == 0:
        return 1
    
    cumulative_energy = np.cumsum(energy) / total_energy
    recommended_rank = np.searchsorted(cumulative_energy, target_energy) + 1
    
    return int(recommended_rank)

def calculate_rank_presets(
    matrix: np.ndarray, 
    U: np.ndarray | None,
    S: np.ndarray, 
    Vt: np.ndarray | None,
    is_medical_or_grayscale: bool, 
    ssim_metric=None
) -> dict:
    height, width = matrix.shape
    min_dim = min(height, width)
    max_rank = len(S)
    
    # Presets logic
    small_min = max(16, round(min_dim * 0.03))
    rec_min = max(32, round(min_dim * 0.06))
    hq_min = max(64, round(min_dim * 0.10))
    
    # Quality targets
    small_target = {'energy': 0.9950, 'ssim': 0.90, 'psnr': 28.0}
    
    if is_medical_or_grayscale:
        rec_target = {'energy': 0.9995, 'ssim': 0.97, 'psnr': 35.0}
    else:
        rec_target = {'energy': 0.9990, 'ssim': 0.95, 'psnr': 32.0}
        
    hq_target = {'energy': 0.9998, 'ssim': 0.98, 'psnr': 38.0}
    
    # Pre-calculate energy for all ranks
    energy = S ** 2
    total_energy = np.sum(energy)
    if total_energy == 0:
        return {
            "recommended_rank": 1, "small_rank": 1, "high_quality_rank": 1,
            "recommended_reason": "Zero energy image",
            "target_ssim": rec_target['ssim'], "target_psnr": rec_target['psnr'],
            "target_retained_energy": rec_target['energy'],
            "actual_ssim_at_recommended": None, "actual_psnr_at_recommended": None,
            "retained_energy_at_recommended": 0.0
        }
    
    cumulative_energy = np.cumsum(energy) / total_energy
    pixel_count = max(1, height * width)

    def stats_for_rank(k: int) -> dict:
        k = max(1, min(k, max_rank))
        retained = float(cumulative_energy[k - 1])
        discarded_energy = max(0.0, float(total_energy) * (1.0 - retained))
        mse = discarded_energy / pixel_count
        psnr = float("inf") if mse == 0 else 20 * np.log10(255.0 / np.sqrt(mse))

        return {
            'rank': k,
            'energy': retained,
            'psnr': float(psnr),
            'ssim': None
        }

    def find_best_rank(min_k: int, targets: dict) -> dict:
        target_energy = float(targets['energy'])
        target_psnr = float(targets.get('psnr', 0))

        if target_psnr > 0:
            target_mse = (255.0 ** 2) / (10 ** (target_psnr / 10.0))
            max_discarded_energy = target_mse * pixel_count
            psnr_energy = 1.0 - (max_discarded_energy / float(total_energy))
            target_energy = max(target_energy, min(1.0, max(0.0, psnr_energy)))

        energy_k = int(np.searchsorted(cumulative_energy, target_energy) + 1)
        return stats_for_rank(max(min_k, energy_k))

    small_stats = find_best_rank(small_min, small_target)
    rec_stats = find_best_rank(rec_min, rec_target)
    hq_stats = find_best_rank(hq_min, hq_target)
    
    reason = "Balanced rank chosen from image quality targets."
    if is_medical_or_grayscale:
        reason = "Higher rank is recommended for medical-style grayscale images to preserve fine structures."
        
    def _safe_float(val):
        if val is None: return None
        if np.isnan(val) or np.isinf(val): return None
        return float(val)

    return {
        "recommended_rank": rec_stats['rank'],
        "small_rank": small_stats['rank'],
        "high_quality_rank": hq_stats['rank'],
        "recommended_reason": reason,
        "target_ssim": rec_target['ssim'],
        "target_psnr": rec_target['psnr'],
        "target_retained_energy": rec_target['energy'],
        "actual_ssim_at_recommended": _safe_float(rec_stats['ssim']),
        "actual_psnr_at_recommended": _safe_float(rec_stats['psnr']),
        "retained_energy_at_recommended": _safe_float(rec_stats['energy'])
    }

# Convert a numpy array (grayscale image) to a base64-encoded PNG string
def matrix_to_base64_png(matrix: np.ndarray) -> str:
    png_bytes = matrix_to_png_bytes(matrix)
    base64_str = base64.b64encode(png_bytes).decode("utf-8")
    return base64_str


def matrix_to_png_bytes(matrix: np.ndarray) -> bytes:
    clipped_matrix = np.clip(matrix, 0, 255)
    uint8_matrix = clipped_matrix.astype(np.uint8)

    image = Image.fromarray(uint8_matrix, mode="L")
    # if complains with deprecation warning, use:
    # image = Image.fromarray(uint8_matrix)

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()
