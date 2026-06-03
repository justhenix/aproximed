import React, { useEffect, useState } from 'react';
import { getApiConfigurationError, healthCheck } from '../lib/api';
import { SingleImageMode } from '../components/SingleImageMode';
import { BatchAnalysisMode } from '../components/BatchAnalysisMode';
import { useI18n } from '../i18n/I18nContext';

export const AppPage: React.FC = () => {
  const apiConfigurationError = getApiConfigurationError();
  const [apiStatus, setApiStatus] = useState<string>(() => apiConfigurationError ? "misconfigured" : "checking");
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const { t, language } = useI18n();
  const apiDetail = apiConfigurationError ? t('app.apiMisconfiguredHelp') : (apiStatus === 'offline' ? t('app.apiOfflineHelp') : null);

  useEffect(() => {
    if (apiConfigurationError) {
      return;
    }

    healthCheck().then(data => {
      if (data && (data.status === 'ok' || data.message)) {
        setApiStatus('online');
      } else {
        setApiStatus("offline");
      }
    }).catch(() => {
      setApiStatus("offline");
    });
  }, [apiConfigurationError, language]);

  const getApiStatusText = () => {
    if (apiStatus === 'online') return t('app.apiOnline');
    if (apiStatus === 'misconfigured') return t('app.apiMisconfigured');
    if (apiStatus === 'offline') return t('app.apiOffline');
    return t('app.apiChecking');
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 sm:space-y-8 flex flex-col items-center max-w-6xl mx-auto w-full min-w-0">
      <header className="text-center mb-2 sm:mb-6 w-full px-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-balance">{t('app.title')}</h1>
        <p className="text-sm sm:text-base text-gray-600 text-pretty">{t('app.subtitle')}</p>

        <div className="mx-auto mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm font-medium text-amber-800">
          {t('app.disclaimer')}
        </div>

        <div className="mt-3 text-xs text-gray-500 font-mono flex items-center justify-center gap-2 bg-white/50 inline-flex px-3 py-1 rounded-full border border-gray-100">
          <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'checking' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
          {getApiStatusText()}
        </div>
        {apiDetail && <p className="mt-2 text-xs text-red-600">{apiDetail}</p>}
      </header>

      <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl w-full max-w-sm mx-auto shadow-inner mb-2 gap-1">
        <button
          onClick={() => setMode('single')}
          className={`min-h-11 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${mode === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('app.modeSingle')}
        </button>
        <button
          onClick={() => setMode('batch')}
          className={`min-h-11 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${mode === 'batch' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('app.modeBatch')}
        </button>
      </div>

      {mode === 'single' ? <SingleImageMode /> : <BatchAnalysisMode />}
    </div>
  );
};
