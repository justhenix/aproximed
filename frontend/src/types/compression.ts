export interface CompressionResponse {
  compressed_image_base64: string;
  rank: number;
  rank_mode?: 'manual' | 'adaptive';
  rank_reason?: string | null;
  recommended_rank: number;
  small_rank?: number | null;
  high_quality_rank?: number | null;
  recommended_reason?: string | null;
  target_ssim?: number | null;
  target_psnr?: number | null;
  target_retained_energy?: number | null;
  actual_ssim_at_recommended?: number | null;
  actual_psnr_at_recommended?: number | null;
  retained_energy_at_recommended?: number | null;
  is_grayscale?: boolean | null;
  mse: number | null;
  psnr: number | null;
  ssim?: number | null;
  svd_compression_ratio: number | null;
  png_output_ratio: number | null;
  compression_ratio?: number | null;
  retained_energy: number | null;
  singular_values_preview?: number[];
  max_rank?: number;
  compressed_mime_type?: string;
  original_format?: string;
  compressed_format?: string;
  original_width?: number;
  original_height?: number;
  compressed_width?: number;
  compressed_height?: number;
  original_size_bytes?: number | null;
  compressed_size_bytes?: number | null;
  bytes_saved?: number | null;
  size_reduction_pct?: number | null;
  processing_time_ms?: number | null;
}

export interface BatchSkippedFile {
  filename: string;
  reason: string;
}

export type BatchImageStatus = 'done' | 'failed' | 'skipped';

export interface BatchImageResult {
  filename: string;
  status: BatchImageStatus;
  original_size_bytes: number | null;
  compressed_size_bytes: number | null;
  bytes_saved: number | null;
  size_reduction_pct: number | null;
  compression_ratio: number | null;
  original_width: number | null;
  original_height: number | null;
  compressed_width: number | null;
  compressed_height: number | null;
  compressed_format: string | null;
  rank: number | null;
  rank_mode: 'manual' | 'adaptive' | null;
  recommended_rank: number | null;
  retained_energy: number | null;
  psnr: number | null;
  ssim: number | null;
  processing_time_ms: number | null;
  error: string | null;
}

export interface BatchImageCompressionResponse {
  total_files: number;
  success_count: number;
  failed_count: number;
  skipped_count: number;
  skipped_files: BatchSkippedFile[];
  per_image_results: BatchImageResult[];
  report_csv_base64?: string;
  report_filename?: string;
  compressed_images_zip_base64?: string;
  compressed_images_zip_filename?: string;
  all_results_zip_base64?: string;
  all_results_zip_filename?: string;
}
