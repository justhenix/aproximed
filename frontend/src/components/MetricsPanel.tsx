import React from 'react';

export const MetricsPanel: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">Compression Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Original Size</p>
          <p className="text-xl font-bold font-mono">- KB</p>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Compressed Size</p>
          <p className="text-xl font-bold font-mono">- KB</p>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Compression Ratio</p>
          <p className="text-xl font-bold font-mono">-</p>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">PSNR</p>
          <p className="text-xl font-bold font-mono">- dB</p>
        </div>
      </div>
    </div>
  );
};