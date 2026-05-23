import React from 'react';
import { Download } from 'lucide-react';

interface Props {
  original: string | null;
  compressed: string | null;
  loading: boolean;
  originalFilename?: string;
}

export const ImageCompare: React.FC<Props> = ({ original, compressed, loading, originalFilename }) => {
  const handleDownload = () => {
    if (!compressed) return;
    const link = document.createElement('a');
    link.href = compressed;
    
    // Generate filename: compressed_<original_filename_without_extension>.png
    let newFilename = "compressed_image.png";
    if (originalFilename) {
      const parts = originalFilename.split('.');
      if (parts.length > 1) {
        parts.pop(); // remove extension
      }
      const baseName = parts.join('.');
      newFilename = `compressed_${baseName}.png`;
    }
    
    link.download = newFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-card p-4 flex flex-col h-full">
        <h3 className="font-bold text-gray-900 mb-3 text-center">Original Image</h3>
        <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden relative shadow-inner">
          {original ? (
            <img src={original} alt="Original" className="w-full h-full object-contain" />
          ) : (
            <span className="text-sm font-medium">No image uploaded</span>
          )}
        </div>
      </div>
      
      <div className="glass-card p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="font-bold text-gray-900 mx-auto text-center translate-x-3">Compressed Image</h3>
          {compressed && !loading && (
            <button 
              onClick={handleDownload}
              title="Download Compressed PNG"
              className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden relative shadow-inner">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent"></div>
            </div>
          )}
          {compressed ? (
            <img src={compressed} alt="Compressed" className="w-full h-full object-contain" />
          ) : (
            !loading && <span className="text-sm font-medium">Awaiting compression</span>
          )}
        </div>
      </div>
    </div>
  );
};