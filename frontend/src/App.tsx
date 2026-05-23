import { useEffect, useState } from 'react';
import { healthCheck } from './lib/api';
import { ImageUploader } from './components/ImageUploader';
import { RankControls } from './components/RankControls';
import { ImageCompare } from './components/ImageCompare';
import { MetricsPanel } from './components/MetricsPanel';

export interface CompressionMetrics {
  rank: number;
  recommended_rank: number;
  mse: number;
  psnr: number;
  compression_ratio: number;
  retained_energy: number;
}

function App() {
  const [apiStatus, setApiStatus] = useState<string>("Checking API...");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  
  const [rank, setRank] = useState<number>(50);
  
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
    setCompressedImage(null);
    setMetrics(null);
    setError(null);
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
      setMetrics({
        rank: data.rank,
        recommended_rank: data.recommended_rank,
        mse: data.mse,
        psnr: data.psnr,
        compression_ratio: data.compression_ratio,
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Aproximed</h1>
          <h2 className="text-xl text-gray-600">SVD-Based X-Ray Image Compression</h2>
          
          <div className="mt-4 inline-block bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded text-sm">
            <span className="font-semibold">Note:</span> This prototype demonstrates SVD-based image compression only. It is not used for medical diagnosis.
          </div>
          
          <div className="mt-2 text-xs text-gray-500 font-mono">
            {apiStatus}
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <ImageUploader onImageSelect={handleImageSelect} selectedFileName={imageFile?.name} />
              <RankControls 
                rank={rank} 
                onRankChange={setRank} 
                onCompress={handleCompress}
                loading={loading}
                disabled={!imageFile}
              />
            </div>
            
            <div className="lg:col-span-2">
              <ImageCompare original={originalPreview} compressed={compressedImage} loading={loading} />
            </div>
          </div>
          
          <MetricsPanel metrics={metrics} />
        </main>

      </div>
    </div>
  );
}

export default App;