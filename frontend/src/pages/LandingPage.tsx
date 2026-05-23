import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, SlidersHorizontal, Image as ImageIcon, Activity } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export const LandingPage: React.FC = () => {
  const { t } = useI18n();

  const previewXrayLabels = {
    patientId: t('preview.dicomPatient'),
    study: t('preview.dicomStudy'),
    matrixDim: t('preview.dicomMatrix'),
    format: t('preview.dicomFormat'),
    originalTag: t('preview.originalTag'),
    status: t('preview.dicomStatus')
  };

  const spectrumLabels = {
    rankHeader: t('preview.rankChip'),
    axisStart: t('preview.sparklineAxisZero'),
    axisRank: t('preview.sparklineAxisRank'),
    axisEnd: t('preview.sparklineAxisMax'),
    matrixU: t('preview.svdU'),
    matrixSigma: t('preview.svdSigma'),
    matrixVt: t('preview.svdVt'),
    matrixMultiply: t('preview.svdMultiply')
  };

  return (
    <div className="flex flex-col gap-12 md:gap-16 lg:gap-20 animate-in fade-in duration-700 font-sans">
      
      {/* Hero Section with Matrix Grid Background */}
      <section className="relative flex flex-col items-center justify-center text-center py-12 md:py-16 lg:py-[10vh]">
        {/* Subtle Matrix Grid Background */}
        <div className="absolute inset-0 -z-10 opacity-40 mask-[radial-gradient(ellipse_at_center,white_80%,transparent)] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, rgba(0, 87, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 87, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-[0.98]">
          {t('landing.titleLine1')} <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
            {t('landing.titleLine2')}
          </span>
        </h1>

        {/* Supporting text */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-semibold">
          {t('landing.subtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/app" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-white font-extrabold hover:bg-[#0046CC] hover:shadow-[0_8px_24px_rgba(0,87,255,0.25)] hover:-translate-y-0.5 transition-all duration-300"
          >
            {t('landing.tryCompression')}
          </Link>
          <Link 
            to="/docs" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-slate-700 font-extrabold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs transition-all duration-300"
          >
            {t('landing.readMethod')}
          </Link>
        </div>
        
        <p className="mt-8 text-xs text-slate-400 font-mono">
          {t('landing.disclaimer')}
        </p>
      </section>

      {/* SVD Reconstruction Preview Panel */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                {t('preview.title')}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{t('preview.caseInfo')}</p>
            </div>
            <div className="flex gap-2 font-mono">
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-bold">{t('preview.rankChip')}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold">{t('preview.retainedEnergy')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left Image Viewport */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{t('preview.original')}</span>
              <div className="aspect-square w-full max-w-45 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs">
                <ChestXRaySVG isOriginal={true} labels={previewXrayLabels} />
              </div>
            </div>

            {/* Middle Decay Graph */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-xs font-bold text-slate-500">{t('preview.decomposition')}</span>
                <span className="text-[10px] text-slate-400 font-semibold leading-tight hidden sm:block">
                  {t('preview.decompositionCaption')}
                </span>
              </div>
              <div className="aspect-square w-full max-w-45 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 p-3 flex flex-col justify-center shadow-xs">
                <SpectrumDecompositionSVG labels={spectrumLabels} equation={t('preview.decompositionEquation')} />
              </div>
            </div>

            {/* Right Image Viewport */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{t('preview.reconstructed')}</span>
              <div className="aspect-square w-full max-w-45 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs relative">
                <div className="w-full h-full blur-[1px] contrast-[1.03]">
                  <ChestXRaySVG isOriginal={false} labels={previewXrayLabels} />
                </div>
                <div className="absolute bottom-2 right-2 text-[8px] bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-bold font-mono">
                  {t('preview.reconTag')}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center font-sans">
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('preview.peakSnr')}</div>
              <div className="text-sm font-extrabold text-slate-900">{t('preview.peakSnrValue')}</div>
            </div>
            <div className="space-y-0.5 border-x border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('preview.ssim')}</div>
              <div className="text-sm font-extrabold text-slate-900">{t('preview.ssimValue')}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('preview.compressionRatio')}</div>
              <div className="text-sm font-extrabold text-slate-900">{t('preview.compressionRatioValue')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard 
          icon={<Upload className="w-6 h-6 text-primary" />}
          title={t('landing.features.uploadTitle')}
          description={t('landing.features.uploadDesc')}
        />
        <FeatureCard 
          icon={<SlidersHorizontal className="w-6 h-6 text-primary" />}
          title={t('landing.features.rankTitle')}
          description={t('landing.features.rankDesc')}
        />
        <FeatureCard 
          icon={<ImageIcon className="w-6 h-6 text-primary" />}
          title={t('landing.features.compareTitle')}
          description={t('landing.features.compareDesc')}
        />
        <FeatureCard 
          icon={<Activity className="w-6 h-6 text-primary" />}
          title={t('landing.features.metricsTitle')}
          description={t('landing.features.metricsDesc')}
        />
      </section>

      {/* Flow Section */}
      <section className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Subtle engineering dot grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(#0057FF 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px'
          }}></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-black mb-10 text-center text-slate-900">{t('landing.howItWorks')}</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <FlowStep number="1" title={t('landing.flow.step1.title')} desc={t('landing.flow.step1.desc')} />
            <FlowArrow />
            <FlowStep number="2" title={t('landing.flow.step2.title')} desc={t('landing.flow.step2.desc')} />
            <FlowArrow />
            <FlowStep number="3" title={t('landing.flow.step3.title')} desc={t('landing.flow.step3.desc')} />
            <FlowArrow />
            <FlowStep number="4" title={t('landing.flow.step4.title')} desc={t('landing.flow.step4.desc')} />
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
    <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-600 leading-relaxed font-semibold">{description}</p>
  </div>
);

const FlowStep = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
  <div className="flex-1 w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-primary/30 transition-colors">
    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
      {number}
    </div>
    <h4 className="font-black text-slate-900 mb-1">{title}</h4>
    <p className="text-xs text-slate-500 font-semibold">{desc}</p>
  </div>
);

const FlowArrow = () => (
  <div className="hidden md:flex text-slate-300">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  </div>
);

type XrayLabels = {
  patientId: string;
  study: string;
  matrixDim: string;
  format: string;
  originalTag: string;
  status: string;
};

type SpectrumLabels = {
  rankHeader: string;
  axisStart: string;
  axisRank: string;
  axisEnd: string;
  matrixU: string;
  matrixSigma: string;
  matrixVt: string;
  matrixMultiply: string;
};

const ChestXRaySVG: React.FC<{ isOriginal?: boolean; labels: XrayLabels }> = ({
  isOriginal = false,
  labels
}) => (
  <svg className="w-full h-full bg-slate-950 text-slate-400 p-2.5 font-mono text-[9px] select-none" viewBox="0 0 200 200">
    {/* Dark background is default. Add grid lines / crosshair */}
    <path d="M 10 100 H 190 M 100 10 V 190" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />
    
    {/* DICOM Info overlay */}
    <text x="10" y="16" fill="rgba(255,255,255,0.4)" fontSize="7" fontWeight="bold">{labels.patientId}</text>
    <text x="10" y="24" fill="rgba(255,255,255,0.3)" fontSize="6">{labels.study}</text>
    <text x="150" y="16" fill="rgba(255,255,255,0.3)" fontSize="6">{labels.matrixDim}</text>
    <text x="150" y="24" fill="rgba(255,255,255,0.3)" fontSize="6">{labels.format}</text>
    
    {/* Spine (vertebrae representation) */}
    <rect x="96" y="32" width="8" height="132" rx="2" fill="rgba(255,255,255,0.12)" />
    <path d="M 96 45 H 104 M 96 60 H 104 M 96 75 H 104 M 96 90 H 104 M 96 105 H 104 M 96 120 H 104 M 96 135 H 104 M 96 150 H 104" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
    
    {/* Ribs (curved paths, left and right) */}
    {/* Left side ribs */}
    <path d="M 94 48 Q 55 52 38 72" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 94 65 Q 50 70 32 95" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 94 82 Q 45 90 28 118" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 94 100 Q 42 110 28 140" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 94 118 Q 42 130 32 155" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Right side ribs */}
    <path d="M 106 48 Q 145 52 162 72" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 106 65 Q 150 70 168 95" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 106 82 Q 155 90 172 118" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 106 100 Q 158 110 172 140" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 106 118 Q 158 130 168 155" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Collarbones (Clavicles) */}
    <path d="M 96 38 Q 65 32 36 40" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M 104 38 Q 135 32 164 40" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3.5" strokeLinecap="round" />

    {/* Lung cavity outlines (dark spaces) */}
    <path d="M 48 50 C 35 65 28 105 30 135 C 44 140 65 135 85 125 C 88 95 85 65 80 54 C 70 48 58 48 48 50 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <path d="M 152 50 C 165 65 172 105 170 135 C 156 140 135 135 115 125 C 112 95 115 65 120 54 C 130 48 142 48 152 50 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

    {/* Heart silhouette (soft white mass in lower center-left) */}
    <path d="M 88 85 C 88 120 68 130 96 138 C 106 138 112 130 112 115 C 112 95 95 85 88 85 Z" fill="rgba(255,255,255,0.16)" />

    {/* Diaphragm outline */}
    <path d="M 28 144 Q 60 134 90 142 Q 130 134 172 146" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    
    {/* Diagnostic Crosshairs in corners */}
    <path d="M 8 35 H 12 V 31 M 192 35 H 188 V 31 M 8 165 H 12 V 169 M 192 165 H 188 V 169" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    
    {/* Outer scale tick lines */}
    <line x1="195" y1="50" x2="198" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <line x1="195" y1="100" x2="198" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <line x1="195" y1="150" x2="198" y2="150" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <line x1="195" y1="75" x2="197" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <line x1="195" y1="125" x2="197" y2="125" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

    {/* Label indicator */}
    {isOriginal && (
      <text x="145" y="188" fill="#0057FF" fontSize="7.5" fontWeight="bold" letterSpacing="0.5">{labels.originalTag}</text>
    )}
    
    {/* Status Overlay */}
    <text x="10" y="188" fill="rgba(255,255,255,0.25)" fontSize="6">{labels.status}</text>
  </svg>
);

const SpectrumDecompositionSVG: React.FC<{ labels: SpectrumLabels; equation?: string }> = ({
  labels,
  equation
}) => (
  <div className="w-full h-full bg-slate-950 text-slate-300 p-2 font-mono text-[8px] flex flex-col justify-between select-none">
    <div className="space-y-1">
      <div className="text-center font-bold text-blue-400 border-b border-slate-900 pb-1">{labels.rankHeader}</div>
      {equation && (
        <div className="text-center text-[9px] text-slate-400 font-semibold">
          {equation}
        </div>
      )}

      {/* Sparkline Decay Curve */}
      <div className="h-16 my-1 relative">
        <svg className="w-full h-full text-slate-500 opacity-80" viewBox="0 0 160 80" fill="none">
        {/* Horizontal grid lines */}
        <line x1="15" y1="70" x2="150" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <line x1="15" y1="40" x2="150" y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="15" y1="10" x2="150" y2="10" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        
        {/* Mathematical S-curve representing exponential decay of singular values */}
        <path d="M 15 10 C 25 35, 35 60, 50 65 T 150 70" stroke="#0057FF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        
        {/* Truncation border at i = 50 (represented at x=55) */}
        <line x1="55" y1="10" x2="55" y2="70" stroke="#00B8FF" strokeWidth="1" strokeDasharray="3,3" />
        
        {/* Area under the curve to indicate energy representation */}
        <path d="M 15 10 C 25 35, 35 60, 50 65 L 55 65.5 L 55 70 L 15 70 Z" fill="rgba(0, 87, 255, 0.12)" />
        
        {/* Dot on the truncation point */}
        <circle cx="55" cy="65.5" r="3" fill="#00B8FF" />
        
        {/* Axes labels */}
        <text x="12" y="77" fill="rgba(255,255,255,0.3)" fontSize="6">{labels.axisStart}</text>
        <text x="50" y="77" fill="#00B8FF" fontSize="6">{labels.axisRank}</text>
        <text x="142" y="77" fill="rgba(255,255,255,0.3)" fontSize="6">{labels.axisEnd}</text>
        </svg>
      </div>
    </div>

    {/* Matrix blocks visually */}
    <div className="border-t border-slate-900 pt-1.5 flex items-center justify-between text-center px-1">
      <div className="flex flex-col items-center">
        <div className="w-7 h-5 rounded border border-slate-800 bg-slate-900/60 flex items-center justify-center font-bold text-[7px] text-slate-400">{labels.matrixU}</div>
      </div>
      <span className="text-slate-650 font-bold text-[7px] select-none">{labels.matrixMultiply}</span>
      <div className="flex flex-col items-center">
        <div className="w-7 h-5 rounded border border-blue-900/40 bg-blue-950/20 flex items-center justify-center font-bold text-[7px] text-blue-400">{labels.matrixSigma}</div>
      </div>
      <span className="text-slate-650 font-bold text-[7px] select-none">{labels.matrixMultiply}</span>
      <div className="flex flex-col items-center">
        <div className="w-7 h-5 rounded border border-slate-800 bg-slate-900/60 flex items-center justify-center font-bold text-[7px] text-slate-400">{labels.matrixVt}</div>
      </div>
    </div>
  </div>
);
