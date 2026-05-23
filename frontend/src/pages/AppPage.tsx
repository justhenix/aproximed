import React, { useEffect, useState, useRef } from 'react';
import { healthCheck } from '../lib/api';
import { RankControls } from '../components/RankControls';
import { ImageCompare } from '../components/ImageCompare';
import { MetricsPanel } from '../components/MetricsPanel';

export interface CompressionMetrics {
  rank: number;
  recommended_rank: number;
  mse: number;
  psnr: number;
  svd_compression_ratio: number;
  png_output_ratio: number;
  retained_energy: number;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const AppPage: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>("Checking API...");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('');
  
  const [rank, setRank] = useState<number>(50);
  const [recommendedRank, setRecommendedRank] = useState<number | null>(null);
  
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<CompressionMetrics | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    healthCheck().then(data => {
      if (data && data.message) {
        setApiStatus(`API Status: Online (${data.message})`);
      } else {
        setApiStatus("API Status: Offline");
      }
    }).catch(() => setApiStatus("API Status: Offline"));
  }, []);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setOriginalPreview(URL.createObjectURL(file));
    setOriginalFilename(file.name);
    setCompressedImage(null);
    setMetrics(null);
    setError(null);
    setRecommendedRank(null);
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
      setError("Please select an image first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("rank", rank.toString());
      
      const response = await fetch("http://localhost:8000/compress", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Compression failed");
      }
      
      const data = await response.json();
      setCompressedImage(`data:image/png;base64,${data.compressed_image_base64}`);
      
      setRecommendedRank(data.recommended_rank);
      setMetrics({
        rank: data.rank,
        recommended_rank: data.recommended_rank,
        mse: data.mse,
        psnr: data.psnr,
        svd_compression_ratio: data.svd_compression_ratio,
        png_output_ratio: data.png_output_ratio,
        retained_energy: data.retained_energy,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 flex flex-col items-center max-w-6xl mx-auto">
      <header className="text-center mb-6 w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Compression Tool</h1>
        <p className="text-gray-600">Upload an X-Ray image, choose rank-k, and analyze reconstruction quality.</p>
        
        <div className="mt-3 text-xs text-gray-500 font-mono flex items-center justify-center gap-2 bg-white/50 inline-flex px-3 py-1 rounded-full border border-gray-100">
          <div className={`w-2 h-2 rounded-full ${apiStatus.includes('Online') ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {apiStatus}
        </div>
      </header>

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
            className={`border-2 border-dashed rounded-2xl p-12 text-center bg-white cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[300px] ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
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
              <p className="text-xl font-bold text-gray-800">Click to upload or drag and drop</p>
              <p className="text-sm mt-2">PNG, JPG up to 10MB</p>
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
              Select X-Ray Image
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
                  <h3 className="font-semibold text-gray-900 truncate max-w-[200px] md:max-w-xs">{originalFilename}</h3>
                  <p className="text-xs text-gray-500">{formatFileSize(imageFile.size)}</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setImageFile(null);
                  setOriginalPreview(null);
                  setCompressedImage(null);
                  setMetrics(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
              >
                Change Image
              </button>
            </div>
            
            <RankControls 
              rank={rank} 
              onRankChange={setRank} 
              onCompress={handleCompress}
              loading={loading}
              disabled={!imageFile}
              recommendedRank={recommendedRank}
            />
          </div>

          {(loading || compressedImage) && (
            <div className="w-full max-w-5xl space-y-6 animate-in fade-in pt-4 border-t border-gray-100">
              <ImageCompare 
                original={originalPreview} 
                compressed={compressedImage} 
                loading={loading} 
                originalFilename={originalFilename}
              />
              
              {metrics && <MetricsPanel metrics={metrics} />}
            </div>
          )}
          
        </div>
      )}
    </div>
  );
};
