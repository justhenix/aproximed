import React, { useState, useRef } from 'react';
import type { CompressionResponse } from '../types/compression';

export interface BatchFileStatus {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  metrics?: CompressionResponse;
  error?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const BatchAnalysisMode: React.FC = () => {
  const [batchFiles, setBatchFiles] = useState<BatchFileStatus[]>([]);
  const [batchRank, setBatchRank] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = (files: FileList | File[]) => {
    const newFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending' as const,
    }));
    setBatchFiles((prev) => [...prev, ...newFiles]);
    setBatchError(null);
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
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearQueue = () => {
    setBatchFiles((prev) => {
      prev.forEach(f => URL.revokeObjectURL(f.previewUrl));
      return [];
    });
  };

  const runBatch = async () => {
    if (batchFiles.length === 0) return;
    setIsProcessing(true);
    setBatchError(null);

    const updatedFiles = [...batchFiles];
    // Reset status to pending for retry of failed ones
    updatedFiles.forEach(f => {
      if (f.status === 'failed') f.status = 'pending';
    });
    setBatchFiles([...updatedFiles]);

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'done') continue;

      updatedFiles[i].status = 'processing';
      setBatchFiles([...updatedFiles]);

      try {
        const formData = new FormData();
        formData.append("image", updatedFiles[i].file);
        formData.append("rank", batchRank.toString());

        const response = await fetch("http://localhost:8000/compress", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "Compression failed");
        }

        const data: CompressionResponse = await response.json();
        updatedFiles[i].status = 'done';
        updatedFiles[i].metrics = data;
      } catch (err) {
        updatedFiles[i].status = 'failed';
        updatedFiles[i].error = err instanceof Error ? err.message : "Unknown error";
      }
      setBatchFiles([...updatedFiles]);
    }

    setIsProcessing(false);
  };

  const downloadCSV = () => {
    const headers = ["file_name", "status", "rank_used", "recommended_rank", "svd_energy_retained", "svd_matrix_ratio", "png_output_ratio", "mse", "psnr", "error"];
    
    const rows = batchFiles.map(f => {
      return [
        `"${f.file.name}"`,
        f.status,
        f.metrics?.rank || batchRank,
        f.metrics?.recommended_rank || "",
        f.metrics?.retained_energy ? (f.metrics.retained_energy * 100).toFixed(2) + '%' : "",
        f.metrics?.svd_compression_ratio ? (f.metrics.svd_compression_ratio * 100).toFixed(2) + '%' : "",
        f.metrics?.png_output_ratio ? (f.metrics.png_output_ratio * 100).toFixed(2) + '%' : "",
        f.metrics?.mse?.toFixed(4) || "",
        f.metrics?.psnr?.toFixed(2) || "",
        `"${f.error || ""}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "aproximed-batch-results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const successfulCount = batchFiles.filter(f => f.status === 'done').length;
  const failedCount = batchFiles.filter(f => f.status === 'failed').length;
  
  const avgPsnr = successfulCount > 0 
    ? (batchFiles.reduce((acc, f) => acc + (f.metrics?.psnr || 0), 0) / successfulCount).toFixed(2) 
    : 0;
  const avgMse = successfulCount > 0 
    ? (batchFiles.reduce((acc, f) => acc + (f.metrics?.mse || 0), 0) / successfulCount).toFixed(4) 
    : 0;
  const avgEnergy = successfulCount > 0
    ? (batchFiles.reduce((acc, f) => acc + (f.metrics?.retained_energy || 0), 0) / successfulCount * 100).toFixed(2)
    : 0;
  const avgRatio = successfulCount > 0
    ? (batchFiles.reduce((acc, f) => acc + (f.metrics?.png_output_ratio || 0), 0) / successfulCount * 100).toFixed(2)
    : 0;

  return (
    <div className="w-full flex flex-col items-center space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      
      {batchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm flex items-center gap-3 w-full max-w-3xl">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {batchError}
        </div>
      )}

      {/* Upload Area */}
      <div className="w-full max-w-4xl">
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
            <p className="text-lg font-bold text-gray-800">Add multiple images for batch analysis</p>
            <p className="text-sm mt-1">PNG, JPG up to 10MB per file</p>
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
      </div>

      {batchFiles.length > 0 && (
        <div className="w-full max-w-6xl space-y-6">
          
          <div className="glass-card p-6 border border-gray-100 shadow-sm rounded-2xl bg-white/80">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Batch Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Select a shared rank-k for all {batchFiles.length} images.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex-1 md:w-48">
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
                <button 
                  onClick={runBatch}
                  disabled={isProcessing || batchFiles.length === 0}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isProcessing ? 'Processing...' : 'Run Batch Analysis'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-gray-100">
              <div className="flex gap-4 text-sm flex-wrap items-center">
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <span className="text-gray-500">Total:</span> <span className="font-semibold text-gray-900">{batchFiles.length}</span>
                </div>
                <div className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 text-green-700">
                  <span>Success:</span> <span className="font-semibold">{successfulCount}</span>
                </div>
                {failedCount > 0 && (
                  <div className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 text-red-700">
                    <span>Failed:</span> <span className="font-semibold">{failedCount}</span>
                  </div>
                )}
                {successfulCount > 0 && (
                  <div className="flex gap-2">
                    <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700">
                      <span>Avg PSNR:</span> <span className="font-semibold">{avgPsnr} dB</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700">
                      <span>Avg MSE:</span> <span className="font-semibold">{avgMse}</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700">
                      <span>Avg Energy:</span> <span className="font-semibold">{avgEnergy}%</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700">
                      <span>Avg Ratio:</span> <span className="font-semibold">{avgRatio}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={clearQueue}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Clear Queue
                </button>
                {successfulCount > 0 && (
                  <button 
                    onClick={downloadCSV}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">File</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Size</th>
                    <th className="px-4 py-3 font-medium text-right">PSNR</th>
                    <th className="px-4 py-3 font-medium text-right">MSE</th>
                    <th className="px-4 py-3 font-medium text-right">Energy</th>
                    <th className="px-4 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {batchFiles.map((fileStatus) => (
                    <tr key={fileStatus.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <img src={fileStatus.previewUrl} alt="preview" className="w-full h-full object-cover" />
                          </div>
                          <span className="truncate max-w-[150px]" title={fileStatus.file.name}>
                            {fileStatus.file.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {fileStatus.status === 'pending' && <span className="text-gray-500">Pending</span>}
                        {fileStatus.status === 'processing' && <span className="text-blue-500 flex items-center gap-1"><span className="animate-pulse">●</span> Processing</span>}
                        {fileStatus.status === 'done' && <span className="text-green-600">Complete</span>}
                        {fileStatus.status === 'failed' && <span className="text-red-500" title={fileStatus.error}>Failed</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                        {formatFileSize(fileStatus.file.size)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 font-mono">
                        {fileStatus.metrics?.psnr?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 font-mono">
                        {fileStatus.metrics?.mse?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {fileStatus.metrics?.retained_energy ? `${(fileStatus.metrics.retained_energy * 100).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => removeFile(fileStatus.id)}
                          disabled={isProcessing}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Remove file"
                        >
                          <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};
