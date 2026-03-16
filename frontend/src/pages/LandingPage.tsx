import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>

      {/* Abstract visual element */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-pink-600/30 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="max-w-2xl">
          {/* Logo */}
          <div className="mb-12">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xl">O</span>
            </div>
          </div>

          {/* Hero text */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            planning doesn't guess.
            <br />
            <span className="text-gray-400">neither should ai.</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-xl leading-relaxed">
            our ai analyzes real-time team capacity to uncover what matters most to your projects.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/login')}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-lg hover:bg-gray-100 transition-all duration-200 hover:gap-4"
          >
            get started
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </button>

          {/* Subtle tagline */}
          <p className="mt-8 text-sm text-gray-600">
            transform spoken ideas into structured plans in seconds
          </p>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};
