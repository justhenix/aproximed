import type { BatchImageCompressionResponse, CompressionResponse } from '../types/compression';

const LOCAL_API_URL = "http://localhost:8000";
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL =
  configuredApiUrl || (import.meta.env.DEV ? LOCAL_API_URL : "");

const buildApiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error("API URL not configured. Set VITE_API_URL.");
  }
  return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
};

interface AnalyzeResponse {
  filename: string;
  recommended_rank: number;
  small_rank?: number;
  high_quality_rank?: number;
  recommended_reason?: string;
  max_rank: number;
  target_ssim?: number | null;
  target_psnr?: number | null;
  target_retained_energy?: number | null;
  actual_ssim_at_recommended?: number | null;
  actual_psnr_at_recommended?: number | null;
  retained_energy_at_recommended?: number | null;
  is_grayscale?: boolean;
}

export const healthCheck = async () => {
  try {
    const response = await fetch(buildApiUrl("/health"));
    return await response.json();
  } catch {
    return null;
  }
};

export const analyzeImage = async (file: File): Promise<AnalyzeResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(buildApiUrl("/analyze"), {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String(data.detail)
        : "Image analysis failed";
    throw new Error(detail);
  }

  if (
    !data ||
    typeof data !== "object" ||
    !("recommended_rank" in data) ||
    !("max_rank" in data)
  ) {
    throw new Error("Invalid response from analysis API");
  }

  return data as AnalyzeResponse;
};

export const compressImage = async (file: File, rank: number): Promise<CompressionResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("rank", rank.toString());

  const response = await fetch(buildApiUrl("/compress"), {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String(data.detail)
        : "Compression failed";
    throw new Error(detail);
  }

  if (!data || typeof data !== "object" || !("compressed_image_base64" in data)) {
    throw new Error("Invalid response from compression API");
  }

  return data as CompressionResponse;
};

export const compressBatchImages = async (
  imageFiles: File[],
  rank: number,
  includeCompressedZip = true,
  includeAllResultsZip = true,
): Promise<BatchImageCompressionResponse> => {
  if (imageFiles.length === 0) {
    throw new Error("No images selected for batch compression");
  }

  const formData = new FormData();
  imageFiles.forEach((file) => {
    formData.append("images", file);
  });
  formData.append("rank", rank.toString());
  formData.append("include_report_csv", "true");
  formData.append("include_compressed_zip", includeCompressedZip ? "true" : "false");
  formData.append("include_all_results_zip", includeAllResultsZip ? "true" : "false");

  const response = await fetch(buildApiUrl("/batch/images"), {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String(data.detail)
        : "Batch compression failed";
    throw new Error(detail);
  }

  if (
    !data ||
    typeof data !== "object" ||
    !("per_image_results" in data) ||
    !("total_files" in data)
  ) {
    throw new Error("Invalid response from batch compression API");
  }

  return data as BatchImageCompressionResponse;
};
