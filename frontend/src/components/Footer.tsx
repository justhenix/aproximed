import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';

export const Footer: React.FC = () => {
  const location = useLocation();

  const handleLinkClick = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative w-full bg-[#0f172a] text-white flex flex-col items-center overflow-hidden z-10 font-sans">

      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-12 md:py-16 flex flex-col items-center text-center">
        <Link to="/" onClick={() => handleLinkClick('/')} className="mb-4 block">
          <img src={logo} className="h-10 md:h-12 w-auto brightness-0 invert" alt="Aproximed" />
        </Link>
        <p className="max-w-xl text-gray-400 text-base mb-8">
          Exploring the boundaries of mathematical precision in medical image compression through Singular Value Decomposition.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 w-full max-w-2xl text-sm font-medium">
          <Link to="/" onClick={() => handleLinkClick('/')} className="text-gray-400 hover:text-white transition-colors">Home</Link>
          <Link to="/app" onClick={() => handleLinkClick('/app')} className="text-gray-400 hover:text-white transition-colors">Compression App</Link>
          <Link to="/about" onClick={() => handleLinkClick('/about')} className="text-gray-400 hover:text-white transition-colors">About Project</Link>
          <Link to="/docs" onClick={() => handleLinkClick('/docs')} className="text-gray-400 hover:text-white transition-colors">Documentation</Link>
        </div>

        <div className="pt-6 border-t border-gray-800 w-full flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Aproximed. Kelompok 2</p>
          <p>Built for educational purposes.</p>
        </div>
      </div>
    </footer>
  );
};
