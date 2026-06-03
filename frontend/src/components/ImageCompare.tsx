import React from 'react';
import { Download } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import type { TranslationKey } from '../i18n/translations';

export interface CompareImageMeta {
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  format?: string | null;
}

interface Props {
  original: string | null;
  compressed: string | null;
  loading: boolean;
  originalFilename?: string;
  originalMeta?: CompareImageMeta | null;
  compressedMeta?: CompareImageMeta | null;
}

const formatFileSize = (bytes?: number | null) => {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '-';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

const formatDimensions = (width?: number | null, height?: number | null) => {
  if (!width || !height) return '-';
  return `${width} × ${height}`;
};

const buildDownloadFileName = (originalFilename?: string, compressedFormat?: string | null) => {
  const extension = (compressedFormat || 'png').toLowerCase();
  if (!originalFilename) return `compressed_image.${extension}`;

  const parts = originalFilename.split('.');
  if (parts.length > 1) parts.pop();
  const stem = parts.join('.') || 'image';
  return `compressed_${stem}.${extension}`;
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 py-2">
    <span className="font-medium text-gray-500">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

const SizeComparisonStrip = ({
  originalBytes,
  compressedBytes,
  t,
}: {
  originalBytes?: number | null;
  compressedBytes?: number | null;
  t: (key: TranslationKey) => string;
}) => {
  if (typeof originalBytes !== 'number' || typeof compressedBytes !== 'number' || originalBytes <= 0 || compressedBytes <= 0) {
    return null;
  }

  const largest = Math.max(originalBytes, compressedBytes);
  const originalPct = Math.max(4, (originalBytes / largest) * 100);
  const compressedPct = Math.max(4, (compressedBytes / largest) * 100);
  const savedPct = ((originalBytes - compressedBytes) / originalBytes) * 100;
  const isLarger = compressedBytes > originalBytes;

  return (
    <div className="md:col-span-2 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-sm font-bold text-gray-900">
          {t('compare.sizeVisualTitle')}
        </h4>
        <span className={`text-xs font-bold ${isLarger ? 'text-amber-700' : 'text-emerald-700'}`}>
          {isLarger
            ? `${t('compare.outputLargerPrefix')} ${Math.abs(savedPct).toFixed(1)}%`
            : `${savedPct.toFixed(1)}% ${t('compare.savedSuffix')}`}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-gray-500">
            <span>{t('compare.originalLabel')}</span>
            <span>{formatFileSize(originalBytes)}</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100">
            <div className="h-3 rounded-full bg-gray-500" style={{ width: `${originalPct}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-gray-500">
            <span>{t('compare.outputLabel')}</span>
            <span>{formatFileSize(compressedBytes)}</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100">
            <div className={`h-3 rounded-full ${isLarger ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${compressedPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImageCompare: React.FC<Props> = ({
  original,
  compressed,
  loading,
  originalFilename,
  originalMeta,
  compressedMeta,
}) => {
  const { t } = useI18n();

  const handleDownload = () => {
    if (!compressed) return;
    const link = document.createElement('a');
    link.href = compressed;
    link.download = buildDownloadFileName(originalFilename, compressedMeta?.format);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0">
      <div className="glass-card p-4 flex flex-col h-full min-w-0">
        <h3 className="font-bold text-gray-900 mb-3 text-center">{t('compare.original')}</h3>
        <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden relative shadow-inner">
          {original ? (
            <img src={original} alt={t('compare.originalAlt')} className="w-full h-full object-contain" />
          ) : (
            <span className="text-sm font-medium px-2 text-center">{t('compare.noImage')}</span>
          )}
        </div>
        <div className="mt-3">
          <MetaRow
            label={t('compare.resolution')}
            value={formatDimensions(originalMeta?.width, originalMeta?.height)}
          />
          <MetaRow
            label={t('compare.fileSize')}
            value={formatFileSize(originalMeta?.sizeBytes)}
          />
          <MetaRow
            label={t('compare.format')}
            value={originalMeta?.format || '-'}
          />
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col h-full min-w-0">
        <div className="flex items-center justify-between mb-3 px-1 gap-2">
          <h3 className="font-bold text-gray-900 text-center flex-1 min-w-0 truncate">{t('compare.compressed')}</h3>
          {compressed && !loading && (
            <button
              onClick={handleDownload}
              title={t('compare.downloadCompressed')}
              className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden relative shadow-inner">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent"></div>
            </div>
          )}
          {compressed ? (
            <img src={compressed} alt={t('compare.compressedAlt')} className="w-full h-full object-contain" />
          ) : (
            !loading && <span className="text-sm font-medium px-2 text-center">{t('compare.awaitingCompression')}</span>
          )}
        </div>
        <div className="mt-3">
          <MetaRow
            label={t('compare.resolution')}
            value={formatDimensions(compressedMeta?.width, compressedMeta?.height)}
          />
          <MetaRow
            label={t('compare.fileSize')}
            value={formatFileSize(compressedMeta?.sizeBytes)}
          />
          <MetaRow
            label={t('compare.format')}
            value={compressedMeta?.format || '-'}
          />
        </div>
      </div>

      <SizeComparisonStrip
        originalBytes={originalMeta?.sizeBytes}
        compressedBytes={compressedMeta?.sizeBytes}
        t={t}
      />
    </div>
  );
};
