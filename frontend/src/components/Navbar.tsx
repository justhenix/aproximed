import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { useI18n } from '../i18n/I18nContext';
import type { TranslationKey } from '../i18n/translations';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
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
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-0 px-0 transition-all duration-500">
      <nav 
        className={`flex items-center justify-between w-full transition-all duration-500 ${
          isScrolled 
            ? 'max-w-4xl mx-auto glass px-6 py-3 rounded-b-2xl border-x border-b' 
            : 'max-w-6xl mx-auto bg-white/0 px-6 md:px-8 py-5 border border-transparent'
        }`}
      >
        <NavLink to="/" onClick={() => {
          if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }} className="flex items-center">
          <img src={logo} className="h-8 w-auto" alt="Aproximed" />
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <NavLink
                key={link.key}
                to={link.path}
                onClick={() => {
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

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-full p-1 text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full transition-colors ${
                language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('id')}
              className={`px-3 py-1 rounded-full transition-colors ${
                language === 'id' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ID
            </button>
          </div>
          <NavLink 
            to="/app"
            onClick={() => {
              if (location.pathname === '/app') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-extrabold hover:bg-[#0046CC] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            {t('nav.openApp')}
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
