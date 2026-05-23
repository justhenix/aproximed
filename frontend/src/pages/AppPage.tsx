import React, { useEffect, useState } from 'react';
import { healthCheck } from '../lib/api';
import { ImageUploader } from '../components/ImageUploader';
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
    setRecommendedRank(null); // Reset until we compress or fetch info
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
    <div className="animate-in fade-in duration-500 space-y-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Compression Tool</h1>
        <p className="text-gray-600">Upload an X-Ray, select rank-k, and analyze the results.</p>
        
        <div className="mt-3 text-xs text-gray-400 font-mono flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${apiStatus.includes('Online') ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {apiStatus}
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <ImageUploader onImageSelect={handleImageSelect} selectedFileName={imageFile?.name} />
          
          <RankControls 
            rank={rank} 
            onRankChange={setRank} 
            onCompress={handleCompress}
            loading={loading}
            disabled={!imageFile}
            recommendedRank={recommendedRank}
          />
          
          <div className="glass-card p-5 text-sm text-gray-600">
            <h4 className="font-semibold text-gray-900 mb-1">Tip</h4>
            <p>Low rank values may blur fine anatomical structures. Always refer to original images for medical decisions.</p>
          </div>
        </div>
        
        <div className="lg:col-span-8 space-y-6">
          <ImageCompare 
            original={originalPreview} 
            compressed={compressedImage} 
            loading={loading} 
            originalFilename={originalFilename}
          />
          
          <MetricsPanel metrics={metrics} />
        </div>
      </div>
    </div>
  );
};
