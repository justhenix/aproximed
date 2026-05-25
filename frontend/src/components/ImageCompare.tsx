import React from 'react';
import { Download } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

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

export const ImageCompare: React.FC<Props> = ({
  original,
  compressed,
  loading,
  originalFilename,
  originalMeta,
  compressedMeta,
}) => {
  const { t, language } = useI18n();

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
            <img src={original} alt="Original" className="w-full h-full object-contain" />
          ) : (
            <span className="text-sm font-medium px-2 text-center">{language === 'id' ? 'Tidak ada gambar yang diunggah' : 'No image uploaded'}</span>
          )}
        </div>
        <div className="mt-3">
          <MetaRow
            label={language === 'id' ? 'Resolusi' : 'Resolution'}
            value={formatDimensions(originalMeta?.width, originalMeta?.height)}
          />
          <MetaRow
            label={language === 'id' ? 'Ukuran File' : 'File Size'}
            value={formatFileSize(originalMeta?.sizeBytes)}
          />
          <MetaRow
            label={language === 'id' ? 'Format' : 'Format'}
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
              title={language === 'id' ? 'Unduh gambar terkompresi' : 'Download compressed image'}
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
            <img src={compressed} alt="Compressed" className="w-full h-full object-contain" />
          ) : (
            !loading && <span className="text-sm font-medium px-2 text-center">{t('compare.awaitingCompression')}</span>
          )}
        </div>
        <div className="mt-3">
          <MetaRow
            label={language === 'id' ? 'Resolusi' : 'Resolution'}
            value={formatDimensions(compressedMeta?.width, compressedMeta?.height)}
          />
          <MetaRow
            label={language === 'id' ? 'Ukuran File' : 'File Size'}
            value={formatFileSize(compressedMeta?.sizeBytes)}
          />
          <MetaRow
            label={language === 'id' ? 'Format' : 'Format'}
            value={compressedMeta?.format || '-'}
          />
        </div>
      </div>
    </div>
  );
};
