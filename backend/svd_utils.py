import base64
import io

import numpy as np
from PIL import Image

# Image preprocessing: convert to grayscale and to numpy array
def preprocess_image(image: Image.Image) -> np.ndarray:
    grayscale_image = image.convert("L")
    matrix = np.array(grayscale_image, dtype=np.float32)
    return matrix

# Image postprocessing: convert numpy array back to PIL Image
def compress_matrix_svd(matrix: np.ndarray, rank: int) -> np.ndarray:
    max_rank = min(matrix.shape)
    
    # Ensure the rank is within valid bounds
    if rank < 1:
        raise ValueError("rank must be at least 1")
    
    # If the specified rank exceeds the maximum possible rank,
    # set it to the maximum
    if rank > max_rank:
        rank = max_rank
    
    # Perform Singular Value Decomposition (SVD) on the input matrix    
    U, S, Vt = np.linalg.svd(matrix, full_matrices=False)
    
    # Retain only the top 'rank' singular values and corresponding vectors
    U_k = U[:, :rank]
    S_k = S[:rank]
    Vt_k = Vt[:rank, :]
    
    # Reconstruct the compressed matrix using the retained components
    compressed_matrix = (U_k * S_k) @ Vt_k
    compressed_matrix = np.clip(compressed_matrix, 0, 255)
    
    return compressed_matrix.astype(np.float32)

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
    U: np.ndarray, 
    S: np.ndarray, 
    Vt: np.ndarray, 
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
    
    def test_rank(k: int) -> dict:
        k = max(1, min(k, max_rank))
        U_k = U[:, :k]
        S_k = S[:k]
        Vt_k = Vt[:k, :]
        comp = (U_k * S_k) @ Vt_k
        comp = np.clip(comp, 0, 255).astype(np.float32)
        
        diff = matrix.astype(np.float32) - comp
        mse = np.mean(diff ** 2)
        psnr = float("inf") if mse == 0 else 20 * np.log10(255.0 / np.sqrt(mse))
        
        ssim = None
        if ssim_metric:
            try:
                # Safe fallback if metric fails
                ssim = float(ssim_metric(matrix.astype(np.float32), comp, data_range=255.0))
            except Exception:
                pass
                
        return {
            'rank': k,
            'energy': float(cumulative_energy[k-1]),
            'psnr': float(psnr),
            'ssim': ssim
        }

    def find_best_rank(min_k: int, targets: dict) -> dict:
        # Check energy first as it's fast
        energy_k = int(np.searchsorted(cumulative_energy, targets['energy']) + 1)
        start_k = max(min_k, energy_k)
        
        step = max(1, round(max_rank * 0.02))
        best_stats = None
        
        # Test ranks
        for k in range(start_k, max_rank + 1, step):
            stats = test_rank(k)
            best_stats = stats
            
            if stats['energy'] < targets['energy']:
                continue
            if stats['ssim'] is not None and stats['ssim'] < targets['ssim']:
                continue
            if stats['psnr'] < targets.get('psnr', 0):
                continue
            
            return stats
            
        return best_stats or test_rank(max_rank)

    small_stats = find_best_rank(small_min, small_target)
    rec_stats = find_best_rank(rec_min, rec_target)
    hq_stats = find_best_rank(hq_min, hq_target)
    
    reason = "Standard heuristic applied."
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
