import React from 'react';
import type { CompressionResponse } from '../types/compression';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  metrics: CompressionResponse | null;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

const formatRatio = (ratio: number) => `${ratio.toFixed(2)}x`;
const formatPercent = (value: number) => `${value.toFixed(2)}%`;
const formatDb = (value: number) => (Number.isFinite(value) ? `${value.toFixed(2)} dB` : '∞ dB');

export const MetricsPanel: React.FC<Props> = ({ metrics }) => {
  const { t, language } = useI18n();

  if (!metrics) return null;

  const sizeReduction = typeof metrics.size_reduction_pct === 'number' ? metrics.size_reduction_pct : null;
  const bytesSaved = typeof metrics.bytes_saved === 'number' ? metrics.bytes_saved : null;
  const compressionRatio =
    typeof metrics.compression_ratio === 'number'
      ? metrics.compression_ratio
      : typeof metrics.png_output_ratio === 'number'
        ? metrics.png_output_ratio
        : null;

  const ssimAvailable = typeof metrics.ssim === 'number';
  const processingMsAvailable = typeof metrics.processing_time_ms === 'number';

  return (
    <div className="glass-card p-6 mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {t('metrics.title')}
      </h3>

      {metrics.png_output_ratio < 1 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm">
            <p className="font-bold">Warning</p>
            <p>{language === 'id' ? 'Output PNG lebih besar dari file asli. Wajar untuk sebagian gambar.' : 'PNG output is larger than original file. This can happen for some images.'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title={t('metrics.rankUsedRecommended')}
          value={`${metrics.rank} / ${metrics.recommended_rank}`}
          helper={language === 'id' ? 'Rank dipakai vs rekomendasi.' : 'Rank used vs recommended.'}
        />

        <MetricCard
          title={t('metrics.energyRetained')}
          value={formatPercent(metrics.retained_energy * 100)}
          helper={language === 'id' ? 'Varians SVD yang dipertahankan.' : 'Retained SVD variance.'}
        />

        {compressionRatio !== null && (
          <MetricCard
            title={language === 'id' ? 'Rasio Kompresi' : 'Compression Ratio'}
            value={formatRatio(compressionRatio)}
            helper={language === 'id' ? 'Ukuran asli dibanding ukuran terkompresi.' : 'Original size divided by compressed size.'}
          />
        )}

        {sizeReduction !== null && bytesSaved !== null && (
          <MetricCard
            title={language === 'id' ? 'Penghematan Ukuran' : 'Size Reduction'}
            value={formatPercent(sizeReduction)}
            helper={language === 'id' ? `${formatBytes(bytesSaved)} lebih kecil.` : `${formatBytes(bytesSaved)} saved.`}
          />
        )}

        {processingMsAvailable && (
          <MetricCard
            title={language === 'id' ? 'Waktu Proses' : 'Processing Time'}
            value={`${metrics.processing_time_ms!.toFixed(0)} ms`}
            helper={language === 'id' ? 'Waktu kompresi backend.' : 'Backend compression duration.'}
          />
        )}

        {ssimAvailable && (
          <MetricCard
            title="SSIM"
            value={metrics.ssim!.toFixed(4)}
            helper={language === 'id' ? 'Kemiripan struktural (0-1).' : 'Structural similarity score (0-1).'}
          />
        )}

        <div className="sm:col-span-2 md:col-span-4 p-4 bg-white/60 rounded-2xl border border-gray-100 mt-2">
          <p className="text-sm font-semibold text-gray-700 mb-1">{t('metrics.msePsnr')}</p>
          <div className="font-bold font-mono text-xl flex flex-wrap gap-x-8 gap-y-2 text-primary">
            <span>{metrics.mse.toFixed(2)} <span className="text-sm text-gray-500 font-sans font-normal ml-1">MSE</span></span>
            <span>{formatDb(metrics.psnr)} <span className="text-sm text-gray-500 font-sans font-normal ml-1">PSNR</span></span>
            {ssimAvailable && (
              <span>{metrics.ssim!.toFixed(4)} <span className="text-sm text-gray-500 font-sans font-normal ml-1">SSIM</span></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, helper }: { title: string; value: string; helper: string }) => (
  <div className="p-4 bg-white/60 rounded-2xl border border-gray-100 flex flex-col justify-between">
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-2xl font-bold font-mono text-primary mb-3">{value}</p>
    </div>
    <p className="text-[10px] text-gray-500 leading-tight">{helper}</p>
  </div>
);
