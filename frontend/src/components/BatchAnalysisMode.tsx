import React, { useMemo, useRef, useState } from 'react';
import { compressBatchImages } from '../lib/api';
import type { BatchImageCompressionResponse, BatchImageResult } from '../types/compression';
import { useI18n } from '../i18n/I18nContext';
import type { TranslationKey } from '../i18n/translations';

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface BatchFileStatus {
  id: string;
  file: File;
  previewUrl: string;
}

const formatFileSize = (bytes?: number | null) => {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '-';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const absoluteBytes = Math.abs(bytes);
  const index = Math.min(Math.floor(Math.log(absoluteBytes) / Math.log(1024)), units.length - 1);
  const value = absoluteBytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

const formatSignedFileSize = (bytes?: number | null) => {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '-';
  if (bytes === 0) return '0 B';
  const prefix = bytes > 0 ? '+' : '-';
  return `${prefix}${formatFileSize(bytes)}`;
};

const formatPercent = (value?: number | null) =>
  typeof value === 'number' ? `${value.toFixed(2)}%` : '-';

const formatRatio = (value?: number | null) =>
  typeof value === 'number' ? `${value.toFixed(2)}x` : '-';

const formatNumber = (value?: number | null, digits = 2) =>
  typeof value === 'number' ? value.toFixed(digits) : '-';

const getSavingsTone = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value === 0) return 'text-gray-800';
  return value > 0 ? 'text-blue-700' : 'text-amber-700';
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const downloadBase64File = (base64: string, mimeType: string, filename: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  downloadBlob(new Blob([bytes], { type: mimeType }), filename);
};

const renderStatus = (status: BatchImageResult['status'], t: (key: TranslationKey) => string) => {
  if (status === 'done') {
    return <span className="text-green-600 font-semibold">{t('batch.status.done')}</span>;
  }
  if (status === 'skipped') {
    return <span className="text-amber-600 font-semibold">{t('batch.status.skipped')}</span>;
  }
  return <span className="text-red-600 font-semibold">{t('batch.status.failed')}</span>;
};

const renderRankMode = (
  mode: BatchImageResult['rank_mode'],
  t: (key: TranslationKey) => string,
) => {
  if (mode === 'adaptive') return t('batch.mode.adaptive');
  if (mode === 'manual') return t('batch.mode.manual');
  return '-';
};

export const BatchAnalysisMode: React.FC = () => {
  const [batchFiles, setBatchFiles] = useState<BatchFileStatus[]>([]);
  const [batchRank, setBatchRank] = useState<number>(50);
  const [useAdaptiveRank, setUseAdaptiveRank] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<BatchImageCompressionResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const handleFilesSelect = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    let hasInvalidFiles = false;
    let hasOversizedFiles = false;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        hasInvalidFiles = true;
      } else if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        hasOversizedFiles = true;
      } else {
        validFiles.push(file);
      }
    });

    if (hasInvalidFiles || hasOversizedFiles) {
      const messages = [
        hasInvalidFiles ? t('single.errorNotImage') : null,
        hasOversizedFiles ? t('single.errorTooLarge') : null,
      ].filter(Boolean);
      setBatchError(messages.join(' '));
    } else {
      setBatchError(null);
    }

    if (validFiles.length === 0) return;

    const newFiles = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setBatchFiles((prev) => [...prev, ...newFiles]);
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
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setBatchFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearQueue = () => {
    setBatchFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      return [];
    });
    setBatchResult(null);
    setBatchError(null);
  };

  const runBatch = async () => {
    if (batchFiles.length === 0) return;

    setIsProcessing(true);
    setBatchError(null);
    setBatchResult(null);

    try {
      const response = await compressBatchImages(
        batchFiles.map((item) => item.file),
        batchRank,
        true,
        true,
        useAdaptiveRank,
      );
      setBatchResult(response);
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : t('batch.errorCompressionFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const doneCount = batchResult?.success_count ?? 0;
  const failedCount = batchResult?.failed_count ?? 0;
  const skippedCount = batchResult?.skipped_count ?? 0;
  const successfulResults = useMemo(
    () => batchResult?.per_image_results.filter((item) => item.status === 'done') ?? [],
    [batchResult],
  );
  const averagePsnr = useMemo(() => {
    const values = successfulResults
      .map((item) => item.psnr)
      .filter((value): value is number => typeof value === 'number');
    if (values.length === 0) return null;
    return values.reduce((total, value) => total + value, 0) / values.length;
  }, [successfulResults]);
  const averageReduction = useMemo(() => {
    const values = successfulResults
      .map((item) => item.size_reduction_pct)
      .filter((value): value is number => typeof value === 'number');
    if (values.length === 0) return null;
    return values.reduce((total, value) => total + value, 0) / values.length;
  }, [successfulResults]);

  return (
    <div className="w-full flex flex-col items-center space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 min-w-0">
      {batchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm flex items-start gap-3 w-full max-w-5xl">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="min-w-0 wrap-break-word">{batchError}</span>
        </div>
      )}

      <div className="w-full max-w-6xl space-y-5 sm:space-y-6 min-w-0">
        <div className="glass-card p-4 sm:p-6 border border-gray-100 shadow-sm rounded-2xl bg-white/80 min-w-0">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-balance">{t('batch.adaptiveTitle')}</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 text-pretty">
              {t('batch.adaptiveDesc')}
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center bg-white cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-w-0 ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="text-gray-500 mb-3 sm:mb-4 flex flex-col items-center w-full min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-800 text-balance px-1">{t('batch.uploadTitle')}</p>
              <p className="text-xs sm:text-sm mt-1 text-pretty px-1">{t('batch.uploadSubtitle')}</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFilesSelect(e.target.files);
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            />
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
            <div className="w-full md:max-w-sm min-w-0">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <input
                  type="checkbox"
                  checked={useAdaptiveRank}
                  onChange={(e) => setUseAdaptiveRank(e.target.checked)}
                  disabled={isProcessing}
                  className="h-4 w-4 accent-primary"
                />
                {t('batch.adaptiveToggle')}
              </label>
              <label className={`text-sm font-medium block mb-1.5 ${useAdaptiveRank ? 'text-gray-400' : 'text-gray-700'}`}>
                {t('batch.manualRank')} k = {batchRank}
              </label>
              <input
                type="range"
                min={1}
                max={200}
                value={batchRank}
                onChange={(e) => setBatchRank(Number(e.target.value))}
                disabled={isProcessing || useAdaptiveRank}
                className="w-full accent-primary disabled:opacity-40"
              />
              <p className="mt-1 text-xs text-gray-500">
                {useAdaptiveRank
                  ? t('batch.adaptiveHint')
                  : t('batch.manualHint')}
              </p>
            </div>
            <div className="grid grid-cols-2 md:flex md:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={runBatch}
                disabled={isProcessing || batchFiles.length === 0}
                className="col-span-2 md:col-span-1 px-6 py-2.5 min-h-11 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isProcessing ? t('batch.processing') : t('batch.runButton')}
              </button>
              <button
                onClick={clearQueue}
                disabled={isProcessing}
                className="col-span-2 md:col-span-1 px-4 py-2.5 min-h-11 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {t('batch.clearQueue')}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <span className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 whitespace-nowrap">{t('batch.total')}: {batchFiles.length}</span>
            {batchResult && (
              <>
                <span className="bg-green-50 px-3 py-1 rounded-lg border border-green-200 text-green-700 whitespace-nowrap">{t('batch.success')}: {doneCount}</span>
                <span className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 text-blue-700 whitespace-nowrap">
                    {useAdaptiveRank ? t('batch.rankAdaptive') : `${t('rank.currentRank')} ${batchRank}`}
                </span>
                {failedCount > 0 && (
                  <span className="bg-red-50 px-3 py-1 rounded-lg border border-red-200 text-red-700 whitespace-nowrap">{t('batch.failed')}: {failedCount}</span>
                )}
                {skippedCount > 0 && (
                  <span className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 text-amber-700 whitespace-nowrap">
                    {t('batch.status.skipped')}: {skippedCount}
                  </span>
                )}
              </>
            )}
          </div>

          {batchFiles.length > 0 && (
            <div className="mt-4 overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-gray-500 bg-gray-50 uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2">{t('batch.table.file')}</th>
                    <th className="px-3 py-2 text-right">{t('batch.table.size')}</th>
                    <th className="px-3 py-2 text-right">{t('batch.table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {batchFiles.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-900">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <img src={item.previewUrl} alt={t('compare.originalAlt')} className="w-full h-full object-cover" />
                          </div>
                          <span className="truncate max-w-40 sm:max-w-xs" title={item.file.name}>{item.file.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600 whitespace-nowrap">{formatFileSize(item.file.size)}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeFile(item.id)}
                          disabled={isProcessing}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-2 -m-2"
                          title={t('batch.removeFile')}
                        >
                          <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {batchResult && (
          <div className="glass-card p-4 sm:p-6 border border-gray-100 shadow-sm rounded-2xl bg-white/80 space-y-4 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">{t('batch.completed')}</p>
                <p className="mt-1 text-xl font-mono font-bold text-gray-900">{doneCount}/{batchResult.total_files}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">{t('batch.avgPsnr')}</p>
                <p className="mt-1 text-xl font-mono font-bold text-blue-700">{averagePsnr !== null ? averagePsnr.toFixed(2) : '-'}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">{t('batch.avgReduction')}</p>
                <p className={`mt-1 text-xl font-mono font-bold ${getSavingsTone(averageReduction)}`}>{averageReduction !== null ? `${averageReduction.toFixed(2)}%` : '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2">
              {batchResult.report_csv_base64 && batchResult.report_filename && (
                <button
                  onClick={() =>
                    downloadBase64File(
                      batchResult.report_csv_base64!,
                      'text/csv;charset=utf-8',
                      batchResult.report_filename!,
                    )
                  }
                  className="px-3 py-2 min-h-11 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                >
                  {t('batch.downloadCsv')}
                </button>
              )}

              {batchResult.compressed_images_zip_base64 && batchResult.compressed_images_zip_filename && (
                <button
                  onClick={() =>
                    downloadBase64File(
                      batchResult.compressed_images_zip_base64!,
                      'application/zip',
                      batchResult.compressed_images_zip_filename!,
                    )
                  }
                  className="px-3 py-2 min-h-11 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                >
                  {t('batch.downloadCompressedZip')}
                </button>
              )}

              {batchResult.all_results_zip_base64 && batchResult.all_results_zip_filename && (
                <button
                  onClick={() =>
                    downloadBase64File(
                      batchResult.all_results_zip_base64!,
                      'application/zip',
                      batchResult.all_results_zip_filename!,
                    )
                  }
                  className="px-4 py-2.5 min-h-11 text-xs sm:text-sm font-bold text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md shadow-blue-600/20"
                >
                  {t('batch.downloadAllZip')}
                </button>
              )}
            </div>

            {/* Mobile result card */}
            <div className="md:hidden space-y-3">
              {batchResult.per_image_results.map((item, index) => (
                <div
                  key={`${item.filename}-${item.status}-${index}-mobile`}
                  className="rounded-xl border border-gray-100 bg-white/80 p-4 space-y-3 min-w-0"
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm wrap-break-word min-w-0 flex-1" title={item.filename}>{item.filename}</p>
                    <div className="shrink-0 text-xs">{renderStatus(item.status, t)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{t('batch.table.original')}</div>
                      <div className="font-mono text-gray-800 truncate">{formatFileSize(item.original_size_bytes)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{t('batch.table.compressed')}</div>
                      <div className="font-mono text-gray-800 truncate">{formatFileSize(item.compressed_size_bytes)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{t('batch.table.saved')}</div>
                      <div className={`font-mono font-semibold truncate ${getSavingsTone(item.bytes_saved)}`}>{formatSignedFileSize(item.bytes_saved)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{t('batch.table.reduction')}</div>
                      <div className={`font-mono font-semibold truncate ${getSavingsTone(item.size_reduction_pct)}`}>{formatPercent(item.size_reduction_pct)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{t('batch.table.ratio')}</div>
                      <div className="font-mono text-gray-800 truncate">{formatRatio(item.compression_ratio)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">k</div>
                      <div className="font-mono text-gray-800 truncate">{item.rank ?? '-'}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{t('batch.table.mode')}</div>
                      <div className="font-mono text-gray-800 truncate">{renderRankMode(item.rank_mode, t)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{t('batch.table.energy')}</div>
                      <div className="font-mono text-gray-800 truncate">{typeof item.retained_energy === 'number' ? `${(item.retained_energy * 100).toFixed(2)}%` : '-'}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">PSNR</div>
                      <div className="font-mono text-gray-800 truncate">{formatNumber(item.psnr, 2)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">SSIM</div>
                      <div className="font-mono text-gray-800 truncate">{formatNumber(item.ssim, 4)}</div>
                    </div>
                  </div>
                  {item.error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-1.5 wrap-break-word">{item.error}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-gray-500 bg-gray-50 uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2">{t('batch.table.filename')}</th>
                    <th className="px-3 py-2">{t('batch.table.status')}</th>
                    <th className="px-3 py-2 text-right">{t('batch.table.original')}</th>
                    <th className="px-3 py-2 text-right">{t('batch.table.compressed')}</th>
                    <th className="px-3 py-2 text-right">{t('batch.table.saved')}</th>
                    <th className="px-3 py-2 text-right">{t('batch.table.reduction')}</th>
                    <th className="px-3 py-2 text-right">{t('batch.table.ratio')}</th>
                    <th className="px-3 py-2 text-right">k</th>
                    <th className="px-3 py-2 text-right">{t('batch.table.recommendedShort')}</th>
                    <th className="px-3 py-2">{t('batch.table.mode')}</th>
                    <th className="px-3 py-2 text-right">{t('batch.table.energy')}</th>
                    <th className="px-3 py-2 text-right">PSNR</th>
                    <th className="px-3 py-2 text-right">SSIM</th>
                    <th className="px-3 py-2">{t('batch.table.error')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {batchResult.per_image_results.map((item, index) => (
                    <tr key={`${item.filename}-${item.status}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-900">{item.filename}</td>
                      <td className="px-3 py-2">{renderStatus(item.status, t)}</td>
                      <td className="px-3 py-2 text-right">{formatFileSize(item.original_size_bytes)}</td>
                      <td className="px-3 py-2 text-right">{formatFileSize(item.compressed_size_bytes)}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${getSavingsTone(item.bytes_saved)}`}>{formatSignedFileSize(item.bytes_saved)}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${getSavingsTone(item.size_reduction_pct)}`}>{formatPercent(item.size_reduction_pct)}</td>
                      <td className="px-3 py-2 text-right">{formatRatio(item.compression_ratio)}</td>
                      <td className="px-3 py-2 text-right">{item.rank ?? '-'}</td>
                      <td className="px-3 py-2 text-right">{item.recommended_rank ?? '-'}</td>
                      <td className="px-3 py-2">{renderRankMode(item.rank_mode, t)}</td>
                      <td className="px-3 py-2 text-right">{typeof item.retained_energy === 'number' ? `${(item.retained_energy * 100).toFixed(2)}%` : '-'}</td>
                      <td className="px-3 py-2 text-right">{formatNumber(item.psnr, 2)}</td>
                      <td className="px-3 py-2 text-right">{formatNumber(item.ssim, 4)}</td>
                      <td className="px-3 py-2 text-red-600">{item.error || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {batchResult.skipped_files.length > 0 && (
              <details className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-amber-800">
                  {t('batch.skippedFiles')} ({batchResult.skipped_files.length})
                </summary>
                <div className="mt-2 text-xs text-amber-900 space-y-1 wrap-break-word">
                  {batchResult.skipped_files.map((item) => (
                    <p key={`${item.filename}-${item.reason}`}>{item.filename} - {item.reason}</p>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
