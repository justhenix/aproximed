import React, { useRef, useState } from 'react';
import { RankControls } from './RankControls';
import { ImageCompare, type CompareImageMeta } from './ImageCompare';
import { MetricsPanel } from './MetricsPanel';
import { analyzeImage, compressImage } from '../lib/api';
import type { CompressionResponse } from '../types/compression';
import { useI18n } from '../i18n/I18nContext';

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const detectFileFormat = (file: File) => {
  if (file.type.includes('/')) {
    return file.type.split('/')[1].toUpperCase();
  }

  const ext = file.name.split('.').pop();
  return ext ? ext.toUpperCase() : 'UNKNOWN';
};

const readImageDimensions = (file: File): Promise<{ width: number; height: number } | null> =>
  new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });

export const SingleImageMode: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('');
  const [originalMeta, setOriginalMeta] = useState<CompareImageMeta | null>(null);

  const [rank, setRank] = useState<number>(50);
  const [recommendedRank, setRecommendedRank] = useState<number | null>(null);
  const [maxRank, setMaxRank] = useState<number>(200);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const clearSelection = () => {
    if (originalPreview) {
      URL.revokeObjectURL(originalPreview);
    }
    setImageFile(null);
    setOriginalPreview(null);
    setOriginalFilename('');
    setOriginalMeta(null);
    setCompressedImage(null);
    setCompressionResult(null);
  };

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t('single.errorNotImage'));
      return;
    }

    if (originalPreview) {
      URL.revokeObjectURL(originalPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setOriginalPreview(previewUrl);
    setOriginalFilename(file.name);
    setOriginalMeta({
      sizeBytes: file.size,
      format: detectFileFormat(file),
    });
    setCompressedImage(null);
    setCompressionResult(null);
    setError(null);
    setRecommendedRank(null);
    setMaxRank(200);

    const dims = await readImageDimensions(file);
    if (dims) {
      setOriginalMeta((prev) => ({
        ...(prev || {}),
        width: dims.width,
        height: dims.height,
      }));
    }

    setIsAnalyzing(true);
    try {
      const data = await analyzeImage(file);
      setRecommendedRank(data.recommended_rank);
      if (data.max_rank) setMaxRank(data.max_rank);
      setRank(data.recommended_rank);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCompress = async () => {
    if (!imageFile) {
      setError(t('single.errorSelectImage'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await compressImage(imageFile, rank);
      const mimeType = data.compressed_mime_type || 'image/png';
      setCompressedImage(`data:${mimeType};base64,${data.compressed_image_base64}`);
      setCompressionResult(data);
      setRecommendedRank(data.recommended_rank);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const resolvedOriginalMeta: CompareImageMeta | null = imageFile
    ? {
        width: originalMeta?.width ?? compressionResult?.original_width ?? null,
        height: originalMeta?.height ?? compressionResult?.original_height ?? null,
        sizeBytes: originalMeta?.sizeBytes ?? compressionResult?.original_size_bytes ?? imageFile.size,
        format: originalMeta?.format ?? compressionResult?.original_format ?? detectFileFormat(imageFile),
      }
    : null;

  const compressedMeta: CompareImageMeta | null = compressionResult
    ? {
        width: compressionResult.compressed_width ?? null,
        height: compressionResult.compressed_height ?? null,
        sizeBytes: compressionResult.compressed_size_bytes ?? null,
        format: compressionResult.compressed_format ?? null,
      }
    : null;

  return (
    <div className="w-full flex flex-col items-center space-y-8 max-w-6xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm flex items-center gap-3 w-full max-w-3xl animate-in slide-in-from-top-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {!imageFile ? (
        <div className="w-full max-w-3xl">
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center bg-white cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-75 ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="text-gray-500 mb-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-800">{t('single.uploadTitle')}</p>
              <p className="text-sm mt-2">{t('single.uploadSubtitle')}</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleImageSelect(e.target.files[0]);
                }
              }}
            />
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md">
              {t('single.selectImage')}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-full max-w-3xl space-y-6">
            <div className="glass-card p-4 flex items-center justify-between border border-gray-100 shadow-sm rounded-2xl bg-white/80">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  {originalPreview && <img src={originalPreview} alt="Preview" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 truncate max-w-50 md:max-w-xs">{originalFilename}</h3>
                  <p className="text-xs text-gray-500">{formatFileSize(imageFile.size)}</p>
                </div>
              </div>

              <button
                onClick={clearSelection}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
              >
                {t('single.changeImage')}
              </button>
            </div>

            <RankControls
              rank={rank}
              onRankChange={setRank}
              onCompress={handleCompress}
              loading={loading}
              disabled={!imageFile}
              recommendedRank={recommendedRank}
              maxRank={maxRank}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {(loading || compressedImage) && (
            <div className="w-full max-w-5xl space-y-6 animate-in fade-in pt-4 border-t border-gray-100">
              <ImageCompare
                original={originalPreview}
                compressed={compressedImage}
                loading={loading}
                originalFilename={originalFilename}
                originalMeta={resolvedOriginalMeta}
                compressedMeta={compressedMeta}
              />

              {compressionResult && <MetricsPanel metrics={compressionResult} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
