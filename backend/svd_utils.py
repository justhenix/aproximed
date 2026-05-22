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
    raise NotImplementedError("compress_matrix_svd not implemented yet")

def calculate_mse(original: np.ndarray, compressed: np.ndarray) -> float:
    raise NotImplementedError("calculate_mse not implemented yet")

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