export interface CompressionResponse {
  compressed_image_base64: string;
  rank: number;
  recommended_rank: number;
  mse: number;
  psnr: number;
  svd_compression_ratio: number;
  png_output_ratio: number;
  retained_energy: number;
}
