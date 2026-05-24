import type { CompressionResponse } from '../types/compression';

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
  max_rank: number;
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
