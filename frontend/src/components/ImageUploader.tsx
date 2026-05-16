import React from 'react';

export const ImageUploader: React.FC = () => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
      <div className="text-gray-500 mb-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-sm font-semibold">Click to upload or drag and drop</p>
        <p className="text-xs">PNG, JPG up to 10MB</p>
      </div>
      <input type="file" className="hidden" accept="image/*" />
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Select X-Ray Image
      </button>
    </div>
  );
};