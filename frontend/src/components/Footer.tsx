import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { useI18n } from '../i18n/I18nContext';

export const Footer: React.FC = () => {
  const location = useLocation();
  const { t } = useI18n();
  const isApp = location.pathname === '/app';

  const handleLinkClick = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isApp) {
    return (
      <footer className="w-full bg-transparent py-5 sm:py-6 text-center text-xs sm:text-sm text-gray-400 font-sans mt-auto border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p>&copy; {new Date().getFullYear()} Aproximed. Kelompok 2</p>
          <div className="flex gap-4 items-center text-xs">
            <Link to="/" className="hover:text-primary transition-colors">{t('footer.home')}</Link>
            <Link to="/docs" className="hover:text-primary transition-colors">{t('footer.docs')}</Link>
            <a
              href="https://github.com/justhenix/aproximed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors p-1"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative w-full bg-[#0f172a] text-white flex flex-col items-center overflow-hidden z-10 font-sans">

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 md:py-16 flex flex-col items-center text-center min-w-0">
        <Link to="/" onClick={() => handleLinkClick('/')} className="mb-4 block">
          <img src={logo} className="h-9 sm:h-10 md:h-12 w-auto brightness-0 invert" alt="Aproximed" />
        </Link>
        <p className="max-w-xl text-gray-400 text-sm sm:text-base mb-7 sm:mb-8 text-pretty px-2">
          {t('footer.description')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 sm:gap-y-2 mb-8 sm:mb-10 w-full max-w-2xl text-sm font-medium">
          <Link to="/" onClick={() => handleLinkClick('/')} className="text-gray-400 hover:text-white transition-colors py-1">{t('footer.home')}</Link>
          <Link to="/app" onClick={() => handleLinkClick('/app')} className="text-gray-400 hover:text-white transition-colors py-1">{t('footer.app')}</Link>
          <Link to="/about" onClick={() => handleLinkClick('/about')} className="text-gray-400 hover:text-white transition-colors py-1">{t('footer.about')}</Link>
          <Link to="/docs" onClick={() => handleLinkClick('/docs')} className="text-gray-400 hover:text-white transition-colors py-1">{t('footer.docs')}</Link>
        </div>

        <div className="pt-5 sm:pt-6 border-t border-gray-800 w-full flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-3 sm:gap-4 text-balance">
          <p>&copy; {new Date().getFullYear()} Aproximed. Kelompok 2</p>
          <a
            href="https://github.com/justhenix/aproximed"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-colors p-1"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <p>{t('footer.educational')}</p>
        </div>
      </div>
    </footer>
  );
};
