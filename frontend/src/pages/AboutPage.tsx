import React from 'react';
import { useI18n } from '../i18n/I18nContext';

export const AboutPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-500 space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('about.title')}</h1>
        <p className="text-lg text-gray-600">
          {t('about.subtitle')}
        </p>
      </header>

      <section className="glass-card p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">{t('about.whatIs.title')}</h2>
          <p className="text-gray-700 leading-relaxed">
            {t('about.whatIs.desc1')} <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-pink-600 font-mono">{t('about.whatIs.matrix')}</code>
            {t('about.whatIs.desc2')}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">{t('about.whyMatters.title')}</h2>
          <p className="text-gray-700 leading-relaxed">
            {t('about.whyMatters.desc')}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">{t('about.sdg.title')}</h2>
          <p className="text-gray-700 leading-relaxed">
            {t('about.sdg.desc')}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
          <h2 className="text-lg font-bold text-orange-800 mb-2">{t('about.limitations.title')}</h2>
          <p className="text-orange-700 text-sm leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: t('about.limitations.desc').replace('not intended for clinical medical diagnosis', '<strong>not intended for clinical medical diagnosis</strong>').replace('tidak ditujukan untuk diagnosis medis klinis', '<strong>tidak ditujukan untuk diagnosis medis klinis</strong>') }} />
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">{t('about.future.title')}</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li><span dangerouslySetInnerHTML={{ __html: t('about.future.patch').replace(/^([^:]+:)/, '<strong>$1</strong>') }} /></li>
            <li><span dangerouslySetInnerHTML={{ __html: t('about.future.cluster').replace(/^([^:]+:)/, '<strong>$1</strong>') }} /></li>
            <li><span dangerouslySetInnerHTML={{ __html: t('about.future.roi').replace(/^([^:]+:)/, '<strong>$1</strong>') }} /></li>
          </ul>
        </div>
      </section>
    </div>
  );
};
