import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { TranslationKey } from '../i18n/translations';

export type PresetKey = 'small' | 'recommended' | 'high';
const PRESETS: PresetKey[] = ['small', 'recommended', 'high'];
const PRESET_NOTE_KEYS: Record<PresetKey, TranslationKey> = {
  small: 'rank.presetSmallNote',
  recommended: 'rank.presetRecommendedNote',
  high: 'rank.presetHighNote',
};
const PRESET_LABEL_KEYS: Record<PresetKey, TranslationKey> = {
  small: 'rank.smallSize',
  recommended: 'rank.recommended',
  high: 'rank.highQuality',
};

interface Props {
  rank: number;
  onRankChange: (rank: number) => void;
  onPresetSelect: (preset: PresetKey, rank: number) => void;
  onCompress: () => void;
  loading: boolean;
  disabled: boolean;
  recommendedRank?: number | null;
  recommendedReason?: string | null;
  selectedPreset: PresetKey | null;
  isGrayscale?: boolean;
  maxRank?: number;
  isAnalyzing?: boolean;
}

const resolvePresetRanks = (recommendedRank: number, maxRank: number) => ({
  small: Math.max(1, Math.floor(recommendedRank * 0.5)),
  recommended: recommendedRank,
  high: Math.min(Math.max(1, maxRank), Math.ceil(recommendedRank * 1.5)),
});

const resolveRankReason = (
  reason: string | null | undefined,
  t: (key: TranslationKey) => string,
) => {
  if (!reason) return t('rank.whyBody');

  const normalized = reason.trim().toLowerCase();
  if (normalized === 'balanced rank chosen from image quality targets.') return t('rank.reasonStandard');
  if (normalized === 'higher rank is recommended for medical-style grayscale images to preserve fine structures.') {
    return t('rank.reasonMedical');
  }
  if (normalized === 'adaptive rank selected per image from quality targets.') return t('rank.reasonAdaptive');
  if (normalized === 'zero energy image') return t('rank.reasonZeroEnergy');

  return reason;
};

const hasUsefulRankReason = (reason: string | null | undefined) => {
  if (!reason) return false;

  const normalized = reason.trim().toLowerCase();
  return normalized !== 'balanced rank chosen from image quality targets.';
};

export const RankControls: React.FC<Props> = ({
  rank,
  onRankChange,
  onPresetSelect,
  onCompress,
  loading,
  disabled,
  recommendedRank,
  recommendedReason,
  selectedPreset,
  maxRank = 200,
  isAnalyzing = false,
}) => {
  const { t } = useI18n();
  const [showInfo, setShowInfo] = useState(false);

  const presetRanks = recommendedRank ? resolvePresetRanks(recommendedRank, maxRank) : null;
  const controlsDisabled = loading || isAnalyzing;
  const isLowQuality = recommendedRank ? rank < Math.max(1, Math.floor(recommendedRank * 0.7)) : false;
  const isHighQuality = recommendedRank ? rank >= Math.max(1, Math.floor(recommendedRank * 1.2)) : false;

  const hint = selectedPreset
    ? t(PRESET_NOTE_KEYS[selectedPreset])
    : t('rank.helper');
  const showRankReason = hasUsefulRankReason(recommendedReason);

  const presetButtonClass = (preset: PresetKey) => {
    const base = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50';
    return selectedPreset === preset
      ? `${base} bg-primary text-white shadow-sm`
      : `${base} bg-gray-100 text-gray-600 hover:bg-gray-200`;
  };

  return (
    <div className="glass-card p-4 sm:p-5 space-y-4 relative min-w-0">
      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
          <div className="flex items-center gap-2 text-primary font-medium bg-white px-4 py-2 rounded-full shadow-lg border border-primary/10">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            {t('rank.analyzing')}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-bold text-gray-900">{t('rank.title')}</h3>
            <button onClick={() => setShowInfo(!showInfo)} className="text-gray-400 hover:text-primary transition-colors text-xs underline whitespace-nowrap">
                {t('rank.whatIs')}
            </button>
        </div>
        <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md text-sm whitespace-nowrap">{t('rank.currentRank')} {rank}</span>
      </div>

      {showInfo && (
        <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 wrap-break-word">
          {t('rank.whatIsBody')}
        </p>
      )}

      <input
        type="range"
        min="1"
        max={maxRank}
        value={rank}
        onChange={(e) => onRankChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        disabled={controlsDisabled}
      />

      {recommendedRank !== null && recommendedRank !== undefined && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => presetRanks && onPresetSelect(p, presetRanks[p])}
                className={presetButtonClass(p)}
                disabled={controlsDisabled}
              >
                {t(PRESET_LABEL_KEYS[p])}
              </button>
            ))}
          </div>

          {showRankReason && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2 text-xs text-blue-900">
              <p className="font-bold">{t('rank.whyTitle')}</p>
              <p className="mt-1 leading-snug">
                {resolveRankReason(recommendedReason, t)}
              </p>
            </div>
          )}
        </>
      )}

      <div className="flex items-start justify-between gap-2 min-h-6">
        <p className="text-xs text-gray-500 min-w-0 wrap-break-word flex-1">{hint}</p>
        {isLowQuality && <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded shrink-0">{t('rank.blurWarningChip')}</span>}
        {isHighQuality && <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded shrink-0">{t('rank.safeDetailChip')}</span>}
      </div>

      <button
        onClick={onCompress}
        disabled={disabled || controlsDisabled}
        className="w-full py-3 min-h-11 font-bold rounded-xl transition-all bg-linear-to-r from-primary to-secondary text-white hover:opacity-90 disabled:opacity-40"
      >
        {loading ? (
            <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                {t('single.compressing')}
            </span>
        ) : t('single.compressImage')}
      </button>
    </div>
  );
};
