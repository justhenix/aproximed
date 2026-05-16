import { useEffect, useState } from 'react';
import { healthCheck } from './lib/api';
import { ImageUploader } from './components/ImageUploader';
import { RankControls } from './components/RankControls';
import { ImageCompare } from './components/ImageCompare';
import { MetricsPanel } from './components/MetricsPanel';

function App() {
  const [apiStatus, setApiStatus] = useState<string>("Checking API...");

  useEffect(() => {
    healthCheck().then(data => {
      if (data && data.message) {
        setApiStatus(`API Status: Online (${data.message})`);
      } else {
        setApiStatus("API Status: Offline");
      }
    });
  }, []);

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <ImageUploader />
              <RankControls />
            </div>
            
            <div className="lg:col-span-2">
              <ImageCompare />
            </div>
          </div>
          
          <MetricsPanel />
        </main>

      </div>
    </div>
  );
}

export default App;