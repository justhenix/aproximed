import React from 'react';
import type { CompressionMetrics } from '../App';

interface Props {
  metrics: CompressionMetrics | null;
}

export const MetricsPanel: React.FC<Props> = ({ metrics }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">Compression Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Rank Used / Recommended</p>
          <p className="text-xl font-bold font-mono">
            {metrics ? `${metrics.rank} / ${metrics.recommended_rank}` : "-"}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">SVD Energy Retained</p>
          <p className="text-xl font-bold font-mono">
            {metrics ? `${(metrics.retained_energy * 100).toFixed(2)}%` : "-"}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">SVD Matrix Ratio</p>
          <p className="text-xl font-bold font-mono">
            {metrics ? `${metrics.svd_compression_ratio.toFixed(2)}x` : "-"}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">PNG Output Ratio</p>
          <p className="text-xl font-bold font-mono">
            {metrics ? `${metrics.png_output_ratio.toFixed(2)}x` : "-"}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-100 col-span-2 md:col-span-4">
          <p className="text-sm text-gray-500 mb-1">MSE / PSNR</p>
          <div className="font-bold font-mono flex gap-6">
            {metrics ? (
              <>
                <span>{metrics.mse.toFixed(2)}</span>
                <span>{metrics.psnr.toFixed(2)} dB</span>
              </>
            ) : "-"}
          </div>
        </div>
      </div>
    </div>
  );
};