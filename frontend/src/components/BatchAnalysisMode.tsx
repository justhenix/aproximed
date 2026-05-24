import React, { useRef, useState } from 'react';
import { compressBatchImages } from '../lib/api';
import type { BatchImageCompressionResponse, BatchImageResult } from '../types/compression';
import { useI18n } from '../i18n/I18nContext';

export interface BatchFileStatus {
  id: string;
  file: File;
  previewUrl: string;
}

const formatFileSize = (bytes?: number | null) => {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '-';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

const formatPercent = (value?: number | null) =>
  typeof value === 'number' ? `${value.toFixed(2)}%` : '-';

const formatRatio = (value?: number | null) =>
  typeof value === 'number' ? `${value.toFixed(2)}x` : '-';

const formatNumber = (value?: number | null, digits = 2) =>
  typeof value === 'number' ? value.toFixed(digits) : '-';

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

const renderStatus = (status: BatchImageResult['status'], language: 'en' | 'id') => {
  if (status === 'done') {
    return <span className="text-green-600 font-semibold">{language === 'id' ? 'Selesai' : 'Done'}</span>;
  }
  if (status === 'skipped') {
    return <span className="text-amber-600 font-semibold">{language === 'id' ? 'Skip' : 'Skipped'}</span>;
  }
  return <span className="text-red-600 font-semibold">{language === 'id' ? 'Gagal' : 'Failed'}</span>;
};

export const BatchAnalysisMode: React.FC = () => {
  const [batchFiles, setBatchFiles] = useState<BatchFileStatus[]>([]);
  const [batchRank, setBatchRank] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<BatchImageCompressionResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useI18n();

  const handleFilesSelect = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    let hasInvalidFiles = false;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      } else {
        hasInvalidFiles = true;
      }
    });

    if (hasInvalidFiles) {
      setBatchError(t('single.errorNotImage'));
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
      );
      setBatchResult(response);
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : 'Batch compression failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const doneCount = batchResult?.success_count ?? 0;
  const failedCount = batchResult?.failed_count ?? 0;
  const skippedCount = batchResult?.skipped_count ?? 0;

  return (
    <div className="w-full flex flex-col items-center space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      {batchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm flex items-center gap-3 w-full max-w-5xl">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {batchError}
        </div>
      )}

      <div className="w-full max-w-6xl space-y-6">
        <div className="glass-card p-6 border border-gray-100 shadow-sm rounded-2xl bg-white/80">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{language === 'id' ? 'Batch Manual (Gambar)' : 'Manual Batch (Images)'}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'id'
                ? 'Unggah banyak gambar, lalu unduh hasil kompresi sebagai ZIP dan laporan CSV.'
                : 'Upload many images, then download compressed ZIP and CSV report.'}
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center bg-white cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="text-gray-500 mb-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-800">{t('batch.uploadTitle')}</p>
              <p className="text-sm mt-1">{t('batch.uploadSubtitle')}</p>
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

          <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="w-full md:max-w-sm">
              <label className="text-sm font-medium text-gray-700 block mb-1">Rank k = {batchRank}</label>
              <input
                type="range"
                min={1}
                max={200}
                value={batchRank}
                onChange={(e) => setBatchRank(Number(e.target.value))}
                disabled={isProcessing}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={runBatch}
                disabled={isProcessing || batchFiles.length === 0}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isProcessing ? t('batch.processing') : (language === 'id' ? 'Jalankan Batch' : 'Run Batch')}
              </button>
              <button
                onClick={clearQueue}
                disabled={isProcessing}
                className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
              >
                {t('batch.clearQueue')}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm flex-wrap">
            <span className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">{t('batch.total')}: {batchFiles.length}</span>
            {batchResult && (
              <>
                <span className="bg-green-50 px-3 py-1 rounded-lg border border-green-200 text-green-700">{t('batch.success')}: {doneCount}</span>
                {failedCount > 0 && (
                  <span className="bg-red-50 px-3 py-1 rounded-lg border border-red-200 text-red-700">{t('batch.failed')}: {failedCount}</span>
                )}
                {skippedCount > 0 && (
                  <span className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 text-amber-700">
                    {language === 'id' ? 'Skip' : 'Skipped'}: {skippedCount}
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
                    <th className="px-3 py-2 text-right">{language === 'id' ? 'Ukuran' : 'Size'}</th>
                    <th className="px-3 py-2 text-right">{language === 'id' ? 'Aksi' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {batchFiles.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                          </div>
                          <span className="truncate max-w-40" title={item.file.name}>{item.file.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">{formatFileSize(item.file.size)}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeFile(item.id)}
                          disabled={isProcessing}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title={language === 'id' ? 'Hapus file' : 'Remove file'}
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
          <div className="glass-card p-6 border border-gray-100 shadow-sm rounded-2xl bg-white/80 space-y-4">
            <div className="flex flex-wrap gap-2">
              {batchResult.report_csv_base64 && batchResult.report_filename && (
                <button
                  onClick={() =>
                    downloadBase64File(
                      batchResult.report_csv_base64!,
                      'text/csv;charset=utf-8',
                      batchResult.report_filename!,
                    )
                  }
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                >
                  {language === 'id' ? 'Download CSV Report' : 'Download CSV Report'}
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
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                >
                  {language === 'id' ? 'Download ZIP Gambar Terkompresi' : 'Download Compressed Images ZIP'}
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
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                >
                  {language === 'id' ? 'Download All Results ZIP' : 'Download All Results ZIP'}
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-gray-500 bg-gray-50 uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2">{language === 'id' ? 'Filename' : 'Filename'}</th>
                    <th className="px-3 py-2">{t('batch.table.status')}</th>
                    <th className="px-3 py-2 text-right">{language === 'id' ? 'Asli' : 'Original'}</th>
                    <th className="px-3 py-2 text-right">{language === 'id' ? 'Kompresi' : 'Compressed'}</th>
                    <th className="px-3 py-2 text-right">{language === 'id' ? 'Hemat' : 'Bytes Saved'}</th>
                    <th className="px-3 py-2 text-right">{language === 'id' ? 'Reduksi' : 'Reduction %'}</th>
                    <th className="px-3 py-2 text-right">{language === 'id' ? 'Rasio' : 'Ratio'}</th>
                    <th className="px-3 py-2 text-right">k</th>
                    <th className="px-3 py-2 text-right">{language === 'id' ? 'Energi' : 'Energy'}</th>
                    <th className="px-3 py-2 text-right">PSNR</th>
                    <th className="px-3 py-2 text-right">SSIM</th>
                    <th className="px-3 py-2">{language === 'id' ? 'Error' : 'Error'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {batchResult.per_image_results.map((item, index) => (
                    <tr key={`${item.filename}-${item.status}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-900">{item.filename}</td>
                      <td className="px-3 py-2">{renderStatus(item.status, language)}</td>
                      <td className="px-3 py-2 text-right">{formatFileSize(item.original_size_bytes)}</td>
                      <td className="px-3 py-2 text-right">{formatFileSize(item.compressed_size_bytes)}</td>
                      <td className="px-3 py-2 text-right">{formatFileSize(item.bytes_saved)}</td>
                      <td className="px-3 py-2 text-right">{formatPercent(item.size_reduction_pct)}</td>
                      <td className="px-3 py-2 text-right">{formatRatio(item.compression_ratio)}</td>
                      <td className="px-3 py-2 text-right">{item.rank ?? '-'}</td>
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
                  {language === 'id' ? 'File di-skip' : 'Skipped Files'} ({batchResult.skipped_files.length})
                </summary>
                <div className="mt-2 text-xs text-amber-900 space-y-1">
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
