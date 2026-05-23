import React from 'react';
import { useI18n } from '../i18n/I18nContext';

export const DocsPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('docs.title')}</h1>
        <p className="text-lg text-gray-600">
          {t('docs.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-1">
          <div className="sticky top-28 glass-card p-6">
            <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">{t('docs.contents')}</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#matrix" className="hover:text-primary transition-colors">{t('docs.matrix.nav')}</a></li>
              <li><a href="#svd" className="hover:text-primary transition-colors">{t('docs.svd.nav')}</a></li>
              <li><a href="#rank-k" className="hover:text-primary transition-colors">{t('docs.rank.nav')}</a></li>
              <li><a href="#metrics" className="hover:text-primary transition-colors">{t('docs.metrics.nav')}</a></li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-10">
          
          <section id="matrix" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('docs.matrix.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <span dangerouslySetInnerHTML={{ __html: t('docs.matrix.desc').replace('m × n', '<span class="font-mono">m × n</span>').replace(' A.', ' <span class="font-mono font-bold">A</span>.').replace('A(i,j)', '<span class="font-mono">A(i,j)</span>').replace(' i ', ' <span class="font-mono">i</span> ').replace(' j.', ' <span class="font-mono">j</span>.') }} />
            </p>
          </section>

          <section id="svd" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('docs.svd.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <span dangerouslySetInnerHTML={{ __html: t('docs.svd.desc').replace(' A ', ' <span class="font-mono font-bold">A</span> ') }} />
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center font-mono text-xl text-gray-800 my-6 shadow-inner">
              A = U Σ Vᵀ
            </div>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li><span dangerouslySetInnerHTML={{ __html: t('docs.svd.u').replace('U:', '<strong>U</strong>:').replace('m × m', '<span class="font-mono">m × m</span>') }} /></li>
              <li><span dangerouslySetInnerHTML={{ __html: t('docs.svd.sigma').replace('Σ:', '<strong>Σ</strong>:').replace('m × n', '<span class="font-mono">m × n</span>') }} /></li>
              <li><span dangerouslySetInnerHTML={{ __html: t('docs.svd.v').replace('Vᵀ:', '<strong>Vᵀ</strong>:').replace('n × n', '<span class="font-mono">n × n</span>') }} /></li>
            </ul>
          </section>

          <section id="rank-k" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('docs.rank.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <span dangerouslySetInnerHTML={{ __html: t('docs.rank.desc1').replace(' k ', ' <strong>k</strong> ') }} />
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center font-mono text-xl text-gray-800 my-6 shadow-inner">
              Aₖ = Uₖ Σₖ Vₖᵀ
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t('docs.rank.desc2')}
            </p>
          </section>

          <section id="metrics" className="scroll-mt-32 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">{t('docs.metrics.title')}</h2>
            
            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">{t('docs.metrics.mse.title')}</h3>
              <p className="text-sm text-gray-600 mb-2">{t('docs.metrics.mse.desc')}</p>
            </div>

            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">{t('docs.metrics.psnr.title')}</h3>
              <p className="text-sm text-gray-600 mb-2">{t('docs.metrics.psnr.desc')}</p>
            </div>

            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">{t('docs.metrics.svdRatio.title')}</h3>
              <p className="text-sm text-gray-600 mb-2">{t('docs.metrics.svdRatio.desc')}</p>
              <div className="bg-white rounded px-4 py-2 font-mono text-sm inline-block border border-gray-100">
                Ratio = (m × n) / (k × (m + n + 1))
              </div>
            </div>

            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">{t('docs.metrics.pngRatio.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('docs.metrics.pngRatio.desc')}
              </p>
            </div>
            
            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">{t('docs.metrics.energy.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('docs.metrics.energy.desc')}
              </p>
            </div>
            
          </section>

        </div>
      </div>
    </div>
  );
};
