import React from 'react';

interface Props {
  rank: number;
  onRankChange: (rank: number) => void;
  onCompress: () => void;
  loading: boolean;
  disabled: boolean;
}

export const RankControls: React.FC<Props> = ({ rank, onRankChange, onCompress, loading, disabled }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Compression Rank (k)</h3>
      <div className="flex items-center gap-4">
        <input 
          type="range" 
          min="1" 
          max="200" 
          value={rank}
          onChange={(e) => onRankChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={loading}
        />
        <span className="font-mono text-lg font-bold w-12 text-center">{rank}</span>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Lower rank = smaller file size, lower quality. Higher rank = larger file size, better quality.
      </p>
      <div className="mt-4 flex justify-end">
        <button 
          onClick={onCompress}
          disabled={disabled || loading}
          className={`px-6 py-2 font-medium rounded transition ${
            disabled || loading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? 'Compressing...' : 'Compress Image'}
        </button>
      </div>
    </div>
  );
};