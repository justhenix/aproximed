import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, SlidersHorizontal, Image as ImageIcon, Activity } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="text-center pt-12 md:pt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Prototype v1.0
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
          SVD-Based <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
            X-Ray Image Compression
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
          Explore how rank-k Singular Value Decomposition affects X-Ray image quality, compression ratio, and reconstruction metrics.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/app" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-[#0046CC] hover:shadow-[0_8px_20px_rgba(0,87,255,0.3)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Try Compression
          </Link>
          <Link 
            to="/docs" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-gray-700 font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
          >
            Read the Method
          </Link>
        </div>
        
        <p className="mt-8 text-xs text-gray-400">
          This prototype is for compression analysis only, not medical diagnosis.
        </p>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard 
          icon={<Upload className="w-6 h-6 text-primary" />}
          title="Upload X-Ray"
          description="Support for standard image formats used in radiography previews."
        />
        <FeatureCard 
          icon={<SlidersHorizontal className="w-6 h-6 text-primary" />}
          title="Adjust Rank-k"
          description="Control the exact number of singular values retained for compression."
        />
        <FeatureCard 
          icon={<ImageIcon className="w-6 h-6 text-primary" />}
          title="Visual Compare"
          description="Side-by-side comparison of original and reconstructed image quality."
        />
        <FeatureCard 
          icon={<Activity className="w-6 h-6 text-primary" />}
          title="Read Metrics"
          description="Analyze MSE, PSNR, SVD Energy, and actual PNG output ratios."
        />
      </section>

      {/* Flow Section */}
      <section className="bg-white/40 border border-white/60 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-linear-to-br from-secondary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-linear-to-tr from-primary/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">How It Works</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <FlowStep number="1" title="Image Matrix" desc="Image loaded as an m × n matrix" />
            <FlowArrow />
            <FlowStep number="2" title="SVD" desc="Factored into U, Σ, Vᵀ" />
            <FlowArrow />
            <FlowStep number="3" title="Rank-k" desc="Truncated to top k singular values" />
            <FlowArrow />
            <FlowStep number="4" title="Metrics" desc="Reconstructed and analyzed" />
          </div>
        </div>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="glass-card p-6 flex flex-col items-start text-left">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const FlowStep = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
  <div className="flex-1 w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-primary/30 transition-colors">
    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
      {number}
    </div>
    <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
    <p className="text-xs text-gray-500">{desc}</p>
  </div>
);

const FlowArrow = () => (
  <div className="hidden md:flex text-gray-300">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  </div>
);
