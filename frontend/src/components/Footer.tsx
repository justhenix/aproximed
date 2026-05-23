import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full min-h-screen bg-[#0f172a] text-white flex flex-col justify-end overflow-hidden z-10">

      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-20 lg:py-32 flex flex-col items-center text-center">
        <Link to="/" className="mb-6 block">
          <img src="/logo.svg" className="h-10 md:h-14 w-auto brightness-0 invert" alt="Aproximed" />
        </Link>
        <p className="max-w-xl text-gray-400 text-lg mb-12">
          Exploring the boundaries of mathematical precision in medical image compression through Singular Value Decomposition.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 w-full max-w-2xl text-sm font-medium">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
          <Link to="/app" className="text-gray-400 hover:text-white transition-colors">Compression App</Link>
          <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Project</Link>
          <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link>
        </div>

        <div className="pt-8 border-t border-gray-800 w-full flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Aproximed Research. Prototype only.</p>
          <p>Built for educational purposes.</p>
        </div>
      </div>
    </footer>
  );
};
