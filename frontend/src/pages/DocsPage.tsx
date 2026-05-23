import React from 'react';

export const DocsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Methodology & Metrics</h1>
        <p className="text-lg text-gray-600">
          Understanding the math behind SVD-based image compression.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-1">
          <div className="sticky top-28 glass-card p-6">
            <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Contents</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#matrix" className="hover:text-primary transition-colors">Image as Matrix</a></li>
              <li><a href="#svd" className="hover:text-primary transition-colors">Singular Value Decomposition</a></li>
              <li><a href="#rank-k" className="hover:text-primary transition-colors">Rank-k Approximation</a></li>
              <li><a href="#metrics" className="hover:text-primary transition-colors">Compression Metrics</a></li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-10">
          
          <section id="matrix" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Image as a Matrix</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A grayscale X-Ray image of resolution <span className="font-mono">m × n</span> can be represented as a mathematical matrix <span className="font-mono font-bold">A</span>. 
              Each entry <span className="font-mono">A(i,j)</span> represents the pixel intensity (0 to 255) at row <span className="font-mono">i</span> and column <span className="font-mono">j</span>.
            </p>
          </section>

          <section id="svd" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Singular Value Decomposition (SVD)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              SVD factors the image matrix <span className="font-mono font-bold">A</span> into three distinct matrices:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center font-mono text-xl text-gray-800 my-6 shadow-inner">
              A = U Σ Vᵀ
            </div>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li><strong>U</strong>: an <span className="font-mono">m × m</span> orthogonal matrix of left singular vectors.</li>
              <li><strong>Σ</strong>: an <span className="font-mono">m × n</span> diagonal matrix of singular values (sorted in descending order).</li>
              <li><strong>Vᵀ</strong>: an <span className="font-mono">n × n</span> orthogonal matrix of right singular vectors.</li>
            </ul>
          </section>

          <section id="rank-k" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rank-k Approximation</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The diagonal entries of Σ are the singular values. The first few singular values carry most of the "energy" (structural information) of the image. By keeping only the top <strong>k</strong> singular values and setting the rest to zero, we compute the rank-k approximation:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center font-mono text-xl text-gray-800 my-6 shadow-inner">
              Aₖ = Uₖ Σₖ Vₖᵀ
            </div>
            <p className="text-gray-700 leading-relaxed">
              This drastically reduces the amount of data needed to store the image, creating a compressed version.
            </p>
          </section>

          <section id="metrics" className="scroll-mt-32 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Metrics Explained</h2>
            
            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">Mean Squared Error (MSE)</h3>
              <p className="text-sm text-gray-600 mb-2">Measures the average squared difference between the original and compressed pixels. Lower is better.</p>
            </div>

            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">Peak Signal-to-Noise Ratio (PSNR)</h3>
              <p className="text-sm text-gray-600 mb-2">Calculated from MSE. It represents the ratio between the maximum possible pixel power and the power of corrupting noise. Measured in dB. Higher is better (usually &gt;30dB is acceptable).</p>
            </div>

            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">SVD Matrix Ratio</h3>
              <p className="text-sm text-gray-600 mb-2">Theoretical low-rank matrix storage estimate.</p>
              <div className="bg-white rounded px-4 py-2 font-mono text-sm inline-block border border-gray-100">
                Ratio = (m × n) / (k × (m + n + 1))
              </div>
            </div>

            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">PNG Output Ratio</h3>
              <p className="text-sm text-gray-600">
                Actual encoded PNG byte-size comparison. SVD Matrix compression reduces the mathematical rank, but standard image encoders like PNG use DEFLATE byte compression, which may not always align perfectly with SVD size reduction.
              </p>
            </div>
            
            <div className="glass p-5">
              <h3 className="font-bold text-gray-900 mb-1">SVD Energy Retained</h3>
              <p className="text-sm text-gray-600">
                Sum of squared singular values kept divided by the sum of all squared singular values. It shows how much mathematical "variance" is preserved, though it's not exactly equal to human visual quality.
              </p>
            </div>
            
          </section>

        </div>
      </div>
    </div>
  );
};
