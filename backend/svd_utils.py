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
    
    if rank < 1:
        raise ValueError("rank must be at least 1")
    
    if rank > max_rank:
        rank = max_rank
        
    U, S, Vt = np.linalg.svd(matrix, full_matrices=False)
    
    U_k = U[:, :rank]
    S_k = S[:rank]
    Vt_k = Vt[:rank, :]
    
    compressed_matrix = (U_k * S_k) @ Vt_k
    compressed_matrix = np.clip(compressed_matrix, 0, 255)
    
    return compressed_matrix.astype(np.float32)

# Calculation for average of squared pixel errors (MSE)
def calculate_mse(original: np.ndarray, compressed: np.ndarray) -> float:
    diff = original.astype(np.float32) - compressed.astype(np.float32)
    mse = np.mean(diff ** 2)
    return float(mse)

def calculate_psnr(mse: float, max_val: float = 255.0) -> float:
    raise NotImplementedError("calculate_psnr not implemented yet")

def calculate_compression_ratio(original_size: int, compressed_size: int) -> float:
    raise NotImplementedError("calculate_compression_ratio not implemented yet")

def calculate_retained_energy(singular_values: np.ndarray, rank: int) -> float:
    raise NotImplementedError("calculate_retained_energy not implemented yet")

def calculate_recommended_rank(singular_values: np.ndarray, target_energy: float = 0.95) -> int:
    raise NotImplementedError("calculate_recommended_rank not implemented yet")

def matrix_to_base64_png(matrix: np.ndarray) -> str:
    raise NotImplementedError("matrix_to_base64_png not implemented yet")