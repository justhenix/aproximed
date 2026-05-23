import React, { useEffect, useState } from 'react';
import { healthCheck } from '../lib/api';
import { SingleImageMode } from '../components/SingleImageMode';
import { BatchAnalysisMode } from '../components/BatchAnalysisMode';

export const AppPage: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>("Checking API...");
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  useEffect(() => {
    healthCheck().then(data => {
      if (data && data.message) {
        setApiStatus(`API Status: Online (${data.message})`);
      } else {
        setApiStatus("API Status: Offline");
      }
    }).catch(() => setApiStatus("API Status: Offline"));
  }, []);

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

      <div className="flex bg-gray-100 p-1 rounded-xl w-full max-w-sm mx-auto shadow-inner mb-2">
        <button 
          onClick={() => setMode('single')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${mode === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Single Image
        </button>
        <button 
          onClick={() => setMode('batch')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${mode === 'batch' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Batch Analysis
        </button>
      </div>

      {mode === 'single' ? <SingleImageMode /> : <BatchAnalysisMode />}
    </div>
  );
};