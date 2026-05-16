import React from 'react';

export const ImageCompare: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
        <h3 className="font-semibold mb-2">Original Image</h3>
        <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400 border border-gray-200">
          No image uploaded
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
        <h3 className="font-semibold mb-2">Compressed Image</h3>
        <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400 border border-gray-200">
          Awaiting compression
        </div>
      </div>
    </div>
  );
};