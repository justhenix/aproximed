import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { useI18n } from '../i18n/I18nContext';
import type { TranslationKey } from '../i18n/translations';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { key: TranslationKey; path: string }[] = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.app', path: '/app' },
    { key: 'nav.about', path: '/about' },
    { key: 'nav.docs', path: '/docs' },
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-0 transition-all duration-500 ${isScrolled ? 'px-4 md:px-8' : 'px-0'}`}>
      <nav
        className={`flex flex-col w-full gap-2 transition-all duration-500 ${
          isScrolled
            ? 'max-w-6xl mx-auto glass px-3 sm:px-6 py-2.5 sm:py-3 rounded-b-2xl border-x border-b'
            : 'max-w-6xl mx-auto bg-white/0 px-4 sm:px-6 md:px-8 py-3 sm:py-5 border border-transparent'
        }`}
      >
        <div className="flex items-center justify-between w-full gap-2">
          <NavLink to="/" onClick={() => {
            setIsMenuOpen(false);
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }} className="flex items-center shrink-0">
            <img src={logo} className="h-7 sm:h-8 w-auto" alt="Aproximed" />
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <NavLink
                  key={link.key}
                  to={link.path}
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (location.pathname === link.path) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={({ isActive: routerActive }) => `
                    px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
                    ${(routerActive || isActive)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-100'}
                  `}
                >
                  {t(link.key)}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full p-0.5 sm:p-1 text-[10px] sm:text-xs font-bold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-3 py-1 rounded-full transition-colors min-h-7 sm:min-h-0 ${
                  language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-1.5 sm:px-3 py-1 rounded-full transition-colors min-h-7 sm:min-h-0 ${
                  language === 'id' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ID
              </button>
            </div>
            <NavLink
              to="/app"
              onClick={() => {
                setIsMenuOpen(false);
                if (location.pathname === '/app') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="hidden md:flex px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-primary text-white text-[11px] sm:text-sm font-extrabold hover:bg-[#0046CC] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 items-center gap-2 whitespace-nowrap"
            >
              {t('nav.openApp')}
            </NavLink>

            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="md:hidden p-2.5 rounded-xl border border-slate-200 bg-white/90 text-slate-700 hover:text-primary hover:border-primary/40 hover:bg-white transition"
            >
              <span className="sr-only">{t('nav.menu')}</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {isMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden w-full rounded-2xl bg-white/95 border border-slate-200 p-3 shadow-lg">
            <div className="grid gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <NavLink
                    key={link.key}
                    to={link.path}
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (location.pathname === link.path) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={({ isActive: routerActive }) => `
                      px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200
                      ${(routerActive || isActive)
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-700 hover:text-primary hover:bg-gray-100'}
                    `}
                  >
                    {t(link.key)}
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center bg-gray-100 rounded-full p-0.5 text-[10px] font-bold">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-full transition-colors min-h-7 ${
                    language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-2 py-1 rounded-full transition-colors min-h-7 ${
                    language === 'id' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ID
                </button>
              </div>
              <NavLink
                to="/app"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (location.pathname === '/app') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 rounded-full bg-primary text-white text-xs font-extrabold hover:bg-[#0046CC] transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
              >
                {t('nav.openApp')}
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
