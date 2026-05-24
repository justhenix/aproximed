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
