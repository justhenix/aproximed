import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-500 space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Aproximed</h1>
        <p className="text-lg text-gray-600">
          A baseline demonstration of Singular Value Decomposition for medical image compression.
        </p>
      </header>

      <section className="glass-card p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">What Aproximed Is</h2>
          <p className="text-gray-700 leading-relaxed">
            Aproximed demonstrates a global SVD baseline for X-Ray image compression. 
            By treating a grayscale X-Ray image as an <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-pink-600 font-mono">m × n</code> matrix, 
            we can apply Singular Value Decomposition (SVD) to extract the most significant features 
            (singular values) and discard the noise, effectively compressing the image size while retaining visual structure.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Why X-Ray Compression Matters</h2>
          <p className="text-gray-700 leading-relaxed">
            Medical institutions generate massive amounts of imaging data daily. Efficient storage and fast transmission 
            of X-Ray images are crucial, especially in remote or low-bandwidth areas. While modern standards like JPEG2000 
            exist, exploring linear algebra techniques like SVD provides educational insight into how fundamental math 
            drives these complex algorithms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Connection to SDG 3</h2>
          <p className="text-gray-700 leading-relaxed">
            Sustainable Development Goal 3 aims to ensure healthy lives and promote well-being for all at all ages. 
            By investigating lightweight, mathematically sound methods for storing and transmitting diagnostic images, 
            we contribute to the foundational research that enables telemedicine and better healthcare access in developing regions.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
          <h2 className="text-lg font-bold text-orange-800 mb-2">Project Limitations</h2>
          <p className="text-orange-700 text-sm leading-relaxed">
            This tool is an educational prototype. Global SVD is computationally expensive for very high-resolution images 
            and may not preserve fine, high-frequency anatomical details at lower ranks. It does not outperform specialized 
            compression standards (like WebP or JPEG2000) and is <strong>not intended for clinical medical diagnosis</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Future Work</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li><strong>PatchSVD:</strong> Breaking the image into blocks (like JPEG) to apply SVD locally for better detail retention.</li>
            <li><strong>Cluster-based SVD:</strong> Grouping similar regions of the image before compression.</li>
            <li><strong>ROI-aware Compression:</strong> Automatically detecting the region of interest (e.g., lungs) and preserving higher rank there, while compressing the background heavily.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
