import React from 'react';
import type { CompressionResponse } from '../types/compression';
import { useI18n } from '../i18n/I18nContext';
import type { TranslationKey } from '../i18n/translations';

interface Props {
  metrics: CompressionResponse | null;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const formatRatio = (ratio: number, locale: string) =>
  `${ratio.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;

const formatPercent = (value: number, locale: string) =>
  `${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

const formatDb = (value: number, locale: string) =>
  `${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} dB`;

const formatBytesLocalized = (bytes: number, locale: string) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: index === 0 ? 0 : 2,
    maximumFractionDigits: index === 0 ? 0 : 2,
  });
  return `${formatted} ${units[index]}`;
};

const formatSignedBytes = (bytes: number, locale: string) => {
  if (bytes === 0) return '0 B';
  const prefix = bytes > 0 ? '+' : '-';
  return `${prefix}${formatBytesLocalized(Math.abs(bytes), locale)}`;
};

const getPsnrQualityKey = (psnr: number): TranslationKey => {
  if (psnr < 25) return 'metrics.psnr.low';
  if (psnr < 30) return 'metrics.psnr.moderate';
  if (psnr < 40) return 'metrics.psnr.good';
  return 'metrics.psnr.veryGood';
};

const buildSizeStats = (metrics: CompressionResponse) => {
  const original = metrics.original_size_bytes;
  const compressed = metrics.compressed_size_bytes;

  if (!isFiniteNumber(original) || !isFiniteNumber(compressed)) return null;
  if (original <= 0 || compressed <= 0) return null;

  const sizeChangeBytes = compressed - original;
  const sizeReductionPct = ((original - compressed) / original) * 100;
  const outputRatio = original / compressed;

  return {
    sizeChangeBytes,
    sizeReductionPct,
    outputRatio,
  };
};

const MetricCard = ({
  title,
  value,
  helper,
  valueClassName = 'text-primary',
}: {
  title: React.ReactNode;
  value: React.ReactNode;
  helper: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="p-4 bg-white/60 rounded-2xl border border-gray-100 flex flex-col justify-between min-w-0">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-700 mb-1 wrap-break-word">{title}</p>
      <p className={`text-xl sm:text-2xl font-bold font-mono mb-3 wrap-break-word ${valueClassName}`}>{value}</p>
    </div>
    <div className="text-[10px] text-gray-500 leading-tight wrap-break-word">{helper}</div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{children}</p>
);

const SingularValueChart = ({
  values,
  rank,
  maxRank,
  t,
}: {
  values?: number[];
  rank: number;
  maxRank?: number;
  t: (key: TranslationKey) => string;
}) => {
  if (!values || values.length === 0) return null;

  const safeMaxRank = Math.max(1, maxRank ?? values.length);
  const rankIndex = Math.min(values.length - 1, Math.max(0, Math.round((rank / safeMaxRank) * (values.length - 1))));

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 min-w-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle>{t('metrics.singularVisualTitle')}</SectionTitle>
        <span className="text-xs font-mono font-bold text-blue-700">k = {rank}</span>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <div className="flex h-32 gap-2">
          {/* Y-Axis */}
          <div className="flex flex-col justify-between text-[10px] text-gray-400 font-mono py-1 pb-4">
            <span>100%</span>
            <span>0%</span>
          </div>
          
          {/* Chart area */}
          <div className="relative flex-1 flex items-end gap-0.5 rounded-xl border-l border-b border-gray-300/50 bg-white/70 p-1">
            {values.map((value, index) => {
              const visualValue = Math.pow(value, 0.25);
              const height = `${Math.max(2, Math.min(100, visualValue * 100))}%`;
              const isKept = index <= rankIndex;
              const currentRank = Math.max(1, Math.round((index / Math.max(1, values.length - 1)) * safeMaxRank));
              
              return (
                <div
                  key={`${value}-${index}`}
                  className="group relative flex-1 h-full flex items-end"
                >
                  <div
                    className={`w-full rounded-t-sm transition-colors duration-300 ${isKept ? 'bg-blue-600 group-hover:bg-blue-400' : 'bg-gray-200 group-hover:bg-gray-400'}`}
                    style={{ height }}
                  />
                  {/* Custom Tooltip */}
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 left-1/2 -translate-x-1/2">
                    <div className="bg-gray-900/90 text-white text-[10px] font-mono rounded px-2 py-1 whitespace-nowrap shadow-md">
                      k={currentRank}
                      <br />
                      val={(value * 100).toFixed(1)}%
                    </div>
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900/90" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-Axis */}
        <div className="flex justify-between text-[10px] text-gray-400 font-mono pl-8 pr-1">
          <span>k=1</span>
          <span>k={safeMaxRank}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center text-xs font-semibold text-gray-700">
        <div className="rounded-lg border border-gray-200 bg-white px-2 py-2 font-mono">A</div>
        <span className="text-gray-400">{'->'}</span>
        <div className="rounded-lg border border-blue-200 bg-white px-2 py-2 font-mono">U<sub>k</sub> Σ<sub>k</sub> V<sub>k</sub><sup>T</sup></div>
        <span className="text-gray-400">{'->'}</span>
        <div className="rounded-lg border border-emerald-200 bg-white px-2 py-2 font-mono">A<sub>k</sub></div>
      </div>
      <div className="mt-3 grid gap-2 rounded-xl border border-blue-100 bg-white/70 p-3 text-[11px] leading-snug text-gray-600 sm:grid-cols-3">
        <p>
          <span className="font-bold text-gray-800">{t('metrics.singularBarLabel')}: </span>
          {t('metrics.singularBarDesc')}
        </p>
        <p>
          <span className="font-bold text-blue-700">{t('metrics.singularKeptLabel')}: </span>
          {t('metrics.singularKeptDesc')}
        </p>
        <p>
          <span className="font-bold text-gray-800">{t('metrics.singularFlowLabel')}: </span>
          {t('metrics.singularFlowDesc')}
        </p>
      </div>
    </section>
  );
};

export const MetricsPanel: React.FC<Props> = ({ metrics }) => {
  const { t, language } = useI18n();

  if (!metrics) return null;

  const locale = language === 'id' ? 'id-ID' : 'en-US';
  const sizeStats = buildSizeStats(metrics);
  const pngOutputRatioValue =
    isFiniteNumber(metrics.png_output_ratio)
      ? metrics.png_output_ratio
      : isFiniteNumber(metrics.compression_ratio)
        ? metrics.compression_ratio
        : sizeStats?.outputRatio ?? null;
  const svdMatrixRatioValue = isFiniteNumber(metrics.svd_compression_ratio)
    ? metrics.svd_compression_ratio
    : null;
  const ssimAvailable = isFiniteNumber(metrics.ssim);
  const processingMsAvailable = isFiniteNumber(metrics.processing_time_ms);
  const retainedEnergyValue = isFiniteNumber(metrics.retained_energy)
    ? formatPercent(metrics.retained_energy * 100, locale)
    : 'N/A';
  const mseValue = isFiniteNumber(metrics.mse) ? metrics.mse.toFixed(2) : 'N/A';
  const psnrValue = isFiniteNumber(metrics.psnr)
    ? `${formatDb(metrics.psnr, locale)} · ${t(getPsnrQualityKey(metrics.psnr))}`
    : 'N/A';
  const pngOutputLarger = pngOutputRatioValue !== null && pngOutputRatioValue < 1;
  const sizeChangeValue = sizeStats ? formatSignedBytes(sizeStats.sizeChangeBytes, locale) : null;
  const sizeChangeTone =
    sizeStats && sizeStats.sizeChangeBytes > 0
      ? 'text-amber-700'
      : sizeStats && sizeStats.sizeChangeBytes < 0
        ? 'text-emerald-600'
        : 'text-gray-800';

  return (
    <div className="glass-card p-4 sm:p-6 mt-4 sm:mt-6 min-w-0">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {t('metrics.title')}
      </h3>

      <div className="space-y-5 sm:space-y-6">
        <SingularValueChart
          values={metrics.singular_values_preview}
          rank={metrics.rank}
          maxRank={metrics.max_rank}
          t={t}
        />

        <section>
          <SectionTitle>{t('metrics.coreSection')}</SectionTitle>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              title="MSE"
              value={mseValue}
              helper={t('metrics.mseHelper')}
            />

            <MetricCard
              title="PSNR"
              value={psnrValue}
              helper={t('metrics.psnrHelper')}
            />

            {ssimAvailable && (
              <MetricCard
                title="SSIM"
                value={metrics.ssim!.toFixed(4)}
                helper={t('metrics.ssimHelper')}
              />
            )}

            <MetricCard
              title={t('metrics.energyRetained')}
              value={retainedEnergyValue}
              helper={t('metrics.energyHelper')}
            />
          </div>
        </section>

        <section>
          <SectionTitle>{t('metrics.compressionSection')}</SectionTitle>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              title={t('metrics.svdMatrixRatio')}
              value={svdMatrixRatioValue !== null ? formatRatio(svdMatrixRatioValue, locale) : 'N/A'}
              helper={t('metrics.svdMatrixHelper')}
            />

            <MetricCard
              title={t('metrics.pngOutputRatio')}
              value={pngOutputRatioValue !== null ? formatRatio(pngOutputRatioValue, locale) : 'N/A'}
              helper={
                <div className="space-y-2">
                  <p>{t('metrics.pngOutputHelper')}</p>
                  {pngOutputLarger && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium leading-snug text-amber-700">
                      {t('metrics.largerOutputBody')}
                    </p>
                  )}
                </div>
              }
            />

            <MetricCard
              title={t('metrics.sizeChangeTitle')}
              value={sizeChangeValue ?? 'N/A'}
              valueClassName={sizeChangeTone}
              helper={t('metrics.sizeChangeHelper')}
            />

            <MetricCard
              title={t('metrics.processingTitle')}
              value={processingMsAvailable ? `${metrics.processing_time_ms!.toFixed(0)} ms` : 'N/A'}
              helper={t('metrics.processingHelper')}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
