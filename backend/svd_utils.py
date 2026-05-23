import numpy as np
from PIL import Image
import io
import base64

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
    raise NotImplementedError("calculate_compression_ratio not implemented yet")

def calculate_retained_energy(singular_values: np.ndarray, rank: int) -> float:
    raise NotImplementedError("calculate_retained_energy not implemented yet")

def calculate_recommended_rank(singular_values: np.ndarray, target_energy: float = 0.95) -> int:
    raise NotImplementedError("calculate_recommended_rank not implemented yet")

def matrix_to_base64_png(matrix: np.ndarray) -> str:
    raise NotImplementedError("matrix_to_base64_png not implemented yet")