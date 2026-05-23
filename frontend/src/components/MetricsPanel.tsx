import React from 'react';
import type { CompressionMetrics } from './SingleImageMode';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  metrics: CompressionMetrics | null;
}

export const MetricsPanel: React.FC<Props> = ({ metrics }) => {
  const { t, language } = useI18n();

  return (
    <div className="glass-card p-6 mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {t('metrics.title')}
      </h3>

      {metrics && metrics.png_output_ratio < 1 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />      
          </svg>
          <div className="text-sm">
            <p className="font-bold">Warning</p>
            <p>{language === 'id' ? 'Output PNG lebih besar dari file yang diunggah. Hal ini dapat terjadi karena kompresi matriks SVD dan kompresi byte PNG berbeda.' : 'PNG output is larger than the uploaded file. This can happen because SVD matrix compression and PNG byte compression are different.'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

        <MetricCard
          title={t('metrics.rankUsedRecommended')}
          value={metrics ? `${metrics.rank} / ${metrics.recommended_rank}` : "-"}
          helper={language === 'id' ? 'Rank k dipilih vs direkomendasikan.' : 'Rank k chosen vs recommended.'}
        />

        <MetricCard
          title={t('metrics.energyRetained')}
          value={metrics ? `${(metrics.retained_energy * 100).toFixed(2)}%` : "-"}
          helper={language === 'id' ? 'Energi yang dipertahankan oleh nilai singular yang dipilih. Tidak sama dengan kualitas visual.' : 'Energy preserved by selected singular values. Not the same as visual quality.'}
        />

        <MetricCard
          title={t('metrics.svdMatrixRatio')}
          value={metrics ? `${metrics.svd_compression_ratio.toFixed(2)}x` : "-"}
          helper={language === 'id' ? 'Estimasi teoretis penyimpanan matriks low-rank.' : 'Theoretical low-rank matrix storage estimate.'}
        />

        <MetricCard
          title={t('metrics.pngOutputRatio')}
          value={metrics ? `${metrics.png_output_ratio.toFixed(2)}x` : "-"}
          helper={language === 'id' ? 'Perbandingan ukuran byte PNG yang di-encode aktual.' : 'Actual encoded PNG byte-size comparison.'}
        />

        <div className="sm:col-span-2 md:col-span-4 p-4 bg-white/60 rounded-2xl border border-gray-100 mt-2">   
          <p className="text-sm font-semibold text-gray-700 mb-1">{t('metrics.msePsnr')}</p>
          <div className="font-bold font-mono text-xl flex flex-wrap gap-x-8 gap-y-2 text-primary">
            {metrics ? (
              <>
                <span>{metrics.mse.toFixed(2)} <span className="text-sm text-gray-500 font-sans font-normal ml-1">MSE</span></span>
                <span>{metrics.psnr.toFixed(2)} <span className="text-sm text-gray-500 font-sans font-normal ml-1">dB</span></span>
              </>
            ) : "-"}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {language === 'id' ? 'Metrik kesalahan menunjukkan keakuratan rekonstruksi visual.' : 'Error metrics indicating visual reconstruction accuracy.'}
          </p>
        </div>

      </div>
    </div>
  );
};

const MetricCard = ({ title, value, helper }: { title: string, value: string, helper: string }) => (
  <div className="p-4 bg-white/60 rounded-2xl border border-gray-100 flex flex-col justify-between">
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-2xl font-bold font-mono text-primary mb-3">{value}</p>
    </div>
    <p className="text-[10px] text-gray-500 leading-tight">{helper}</p>
  </div>
);