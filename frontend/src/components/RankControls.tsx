import React from 'react';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  rank: number;
  onRankChange: (rank: number) => void;
  onCompress: () => void;
  loading: boolean;
  disabled: boolean;
  recommendedRank?: number | null;
  maxRank?: number;
  isAnalyzing?: boolean;
}

export const RankControls: React.FC<Props> = ({ rank, onRankChange, onCompress, loading, disabled, recommendedRank, maxRank = 200, isAnalyzing = false }) => {
  const { t, language } = useI18n();
  const handlePreset = (type: 'recommended' | 'low' | 'high') => {
    if (!recommendedRank) return;
    switch (type) {
      case 'recommended':
        onRankChange(recommendedRank);
        break;
      case 'low':
        onRankChange(Math.max(1, Math.floor(recommendedRank * 0.5)));
        break;
      case 'high':
        onRankChange(Math.min(maxRank, Math.ceil(recommendedRank * 1.5)));
        break;
    }
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-primary font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-primary/10">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('rank.analyzing')}
          </div>
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t('rank.title')}</h3>
      <p className="text-sm text-gray-600 mb-4">{t('rank.helper')}</p>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="range"
          min="1"
          max={maxRank}
          value={rank}
          onChange={(e) => onRankChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          disabled={loading || isAnalyzing}
        />
        <span className="font-mono text-lg font-bold w-12 text-center text-primary bg-primary/10 rounded py-1">{rank}</span>
      </div>

      {recommendedRank && (
        <div className="mb-5 grid grid-cols-3 gap-2 text-xs font-medium">
          <button
            onClick={() => handlePreset('low')}
            className="px-2 py-1.5 rounded border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {language === 'id' ? 'Ukuran Kecil' : 'Low Size'}
          </button>
          <button
            onClick={() => handlePreset('recommended')}
            className="px-2 py-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"    
          >
            {t('rank.recommended')}
          </button>
          <button
            onClick={() => handlePreset('high')}
            className="px-2 py-1.5 rounded border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {language === 'id' ? 'Kualitas Tinggi' : 'High Quality'}
          </button>
        </div>
      )}

      {rank < (recommendedRank || 0) * 0.7 && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">{t('rank.lowerRankHint')}</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={onCompress}
          disabled={disabled || loading}
          className={`w-full py-3 font-bold rounded-xl transition-all duration-300 ${
            disabled || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-linear-to-r from-primary to-secondary text-white hover:shadow-lg hover:-translate-y-0.5'    
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('single.compressing')}
            </span>
          ) : t('single.compressImage')}
        </button>
      </div>
    </div>
  );
};