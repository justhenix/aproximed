export interface CompressionResponse {
  compressed_image_base64: string;
  rank: number;
  recommended_rank: number;
  mse: number;
  psnr: number;
  ssim?: number | null;
  svd_compression_ratio: number;
  png_output_ratio: number;
  compression_ratio?: number;
  retained_energy: number;
  compressed_mime_type?: string;
  original_format?: string;
  compressed_format?: string;
  original_width?: number;
  original_height?: number;
  compressed_width?: number;
  compressed_height?: number;
  original_size_bytes?: number;
  compressed_size_bytes?: number;
  bytes_saved?: number;
  size_reduction_pct?: number;
  processing_time_ms?: number;
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
