import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="grow pt-28 pb-16 px-4 md:px-8 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
