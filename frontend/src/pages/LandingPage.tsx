import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-sm">O</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 dark:text-white mb-6 leading-tight">
            Our process tool
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            AI-powered project planning and team allocation.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="inline-block px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-8 text-sm text-gray-500 dark:text-gray-600">
        Our process tool © 2025
      </div>
    </div>
  );
};
