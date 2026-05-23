import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'App', path: '/app' },
    { name: 'About', path: '/about' },
    { name: 'Docs', path: '/docs' },
  ];

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${
        isScrolled ? 'pt-4 px-4' : 'pt-0 px-0'
      }`}
    >
      <nav 
        className={`flex items-center justify-between w-full transition-all duration-500 ${
          isScrolled 
            ? 'max-w-4xl mx-auto glass px-6 py-3 rounded-full' 
            : 'max-w-6xl mx-auto bg-white/0 px-6 md:px-8 py-5 border border-white/0'
        }`}
      >
        <NavLink to="/" className="flex items-center">
          <img src={logo} className="h-8 w-auto" alt="Aproximed" />
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <NavLink
                key={link.name}
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
                {link.name}
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center">
          <NavLink 
            to="/app"
            onClick={() => {
              if (location.pathname === '/app') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-extrabold hover:bg-[#0046CC] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            Open App
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
