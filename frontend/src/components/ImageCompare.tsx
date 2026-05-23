import React from 'react';

interface Props {
  original: string | null;
  compressed: string | null;
  loading: boolean;
}

export const ImageCompare: React.FC<Props> = ({ original, compressed, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
        <h3 className="font-semibold mb-2">Original Image</h3>
        <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden">
          {original ? (
            <img src={original} alt="Original" className="w-full h-full object-contain" />
          ) : (
            "No image uploaded"
          )}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
        <h3 className="font-semibold mb-2">Compressed Image</h3>
        <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}
          {compressed ? (
            <img src={compressed} alt="Compressed" className="w-full h-full object-contain" />
          ) : (
            !loading && "Awaiting compression"
          )}
        </div>
      </div>
    </div>
  );
};