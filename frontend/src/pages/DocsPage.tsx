import React from 'react';
import { useI18n } from '../i18n/I18nContext';

type InlineToken = {
  match: string;
  text: string;
  className?: string;
  strong?: boolean;
};

const renderInlineTokens = (text: string, tokens: InlineToken[]) => {
  const sortedTokens = [...tokens].sort((a, b) => b.match.length - a.match.length);
  const nodes: React.ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    const token = sortedTokens.find((item) => text.startsWith(item.match, index));

    if (!token) {
      nodes.push(text[index]);
      index += 1;
      continue;
    }

    const leadingSpace = token.match.match(/^\s*/)?.[0] ?? '';
    const trailingSpace = token.match.match(/\s*$/)?.[0] ?? '';
    const element = (
      <span className={token.className} key={`${token.match}-${index}`}>
        {token.strong ? <strong>{token.text}</strong> : token.text}
      </span>
    );

    nodes.push(leadingSpace, element, trailingSpace);
    index += token.match.length;
  }

  return nodes;
};

const emphasizePrefix = (text: string) => {
  const separatorIndex = text.indexOf(':');
  if (separatorIndex === -1) return text;

  return (
    <>
      <strong>{text.slice(0, separatorIndex + 1)}</strong>
      {text.slice(separatorIndex + 1)}
    </>
  );
};

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
              {renderInlineTokens(t('docs.matrix.desc'), [
                { match: 'm × n', text: 'm × n', className: 'font-mono' },
                { match: 'A(i,j)', text: 'A(i,j)', className: 'font-mono' },
                { match: ' A.', text: 'A.', className: 'font-mono font-bold' },
                { match: ' i ', text: 'i', className: 'font-mono' },
                { match: ' j.', text: 'j.', className: 'font-mono' },
              ])}
            </p>
          </section>

          <section id="svd" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('docs.svd.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {renderInlineTokens(t('docs.svd.desc'), [
                { match: ' A ', text: 'A', className: 'font-mono font-bold' },
              ])}
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center font-mono text-xl text-gray-800 my-6 shadow-inner">
              A = U Σ Vᵀ
            </div>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>{emphasizePrefix(t('docs.svd.u'))}</li>
              <li>{emphasizePrefix(t('docs.svd.sigma'))}</li>
              <li>{emphasizePrefix(t('docs.svd.v'))}</li>
            </ul>
          </section>

          <section id="rank-k" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('docs.rank.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {renderInlineTokens(t('docs.rank.desc1'), [
                { match: ' k ', text: 'k', strong: true },
              ])}
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
                {t('docs.metrics.ratioFormulaLabel')} = (m × n) / (k × (m + n + 1))
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
