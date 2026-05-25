import React from 'react';
import type { CompressionResponse } from '../types/compression';
import { useI18n } from '../i18n/I18nContext';

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

const getPsnrQuality = (psnr: number, language: 'en' | 'id') => {
  if (psnr < 25) return language === 'id' ? 'Kualitas rendah' : 'Low quality';
  if (psnr < 30) return language === 'id' ? 'Kualitas sedang' : 'Moderate quality';
  if (psnr < 40) return language === 'id' ? 'Kualitas baik' : 'Good quality';
  return language === 'id' ? 'Kualitas sangat baik' : 'Very good quality';
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
    ? `${formatDb(metrics.psnr, locale)} · ${getPsnrQuality(metrics.psnr, language)}`
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
        <section>
          <SectionTitle>{t('metrics.coreSection')}</SectionTitle>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              title="MSE"
              value={mseValue}
              helper={language === 'id' ? 'Rata-rata error kuadrat piksel.' : 'Average squared pixel error.'}
            />

            <MetricCard
              title="PSNR"
              value={psnrValue}
              helper={language === 'id' ? 'Semakin tinggi biasanya semakin baik.' : 'Higher is usually better.'}
            />

            {ssimAvailable && (
              <MetricCard
                title="SSIM"
                value={metrics.ssim!.toFixed(4)}
                helper={language === 'id' ? 'Kemiripan struktural (0-1).' : 'Structural similarity score (0-1).'}
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
              title={language === 'id' ? 'Perubahan Ukuran' : 'Size Change'}
              value={sizeChangeValue ?? 'N/A'}
              valueClassName={sizeChangeTone}
              helper={
                language === 'id'
                  ? 'Positif = output lebih besar. Negatif = output lebih kecil.'
                  : 'Positive means larger output. Negative means smaller output.'
              }
            />

            <MetricCard
              title={language === 'id' ? 'Waktu Proses' : 'Processing Time'}
              value={processingMsAvailable ? `${metrics.processing_time_ms!.toFixed(0)} ms` : 'N/A'}
              helper={t('metrics.processingHelper')}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
