import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { ArrowRight, Mic, Calendar, Users } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <PageTransition delay={0}>
        <nav className="border-b border-[#e5e5e5]">
          <div className="max-w-7xl mx-auto px-12 py-6 flex items-center justify-between">
            <div>
              <div className="text-[#000000] font-semibold text-lg tracking-tight">FAST</div>
              <div className="text-[#999999] text-xs tracking-wide mt-0.5">PROCESS TOOL</div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-sm text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide"
            >
              Sign In
            </button>
          </div>
        </nav>
      </PageTransition>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-12 py-24">
        <div className="max-w-3xl">
          <PageTransition delay={100}>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
              AI-POWERED TEAM PLANNING
            </div>
          </PageTransition>

          <PageTransition delay={200}>
            <h1 className="text-6xl font-light text-[#000000] mb-8 leading-tight">
              Voice-first availability tracking
            </h1>
          </PageTransition>

          <PageTransition delay={300}>
            <p className="text-xl text-[#666666] mb-12 leading-relaxed">
              Speak your availability. Our AI transforms natural language into structured team planning, intelligent task allocation, and real-time capacity insights.
            </p>
          </PageTransition>

          <PageTransition delay={400}>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wide"
            >
              Get Started
              <ArrowRight size={16} />
            </button>
          </PageTransition>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-8 mt-32">
          <PageTransition delay={500}>
            <div className="border-t-2 border-[#000000] pt-6">
              <div className="w-12 h-12 bg-[#000000] text-white flex items-center justify-center mb-6">
                <Mic size={24} />
              </div>
              <h3 className="text-lg font-medium text-[#000000] mb-3">Voice Input</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Record your availability naturally. No forms, no friction. Just speak and our AI handles the rest.
              </p>
            </div>
          </PageTransition>

          <PageTransition delay={600}>
            <div className="border-t-2 border-[#000000] pt-6">
              <div className="w-12 h-12 bg-[#000000] text-white flex items-center justify-center mb-6">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-medium text-[#000000] mb-3">Team Calendar</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Real-time visibility into team capacity. See who's available, who's out, and plan accordingly.
              </p>
            </div>
          </PageTransition>

          <PageTransition delay={700}>
            <div className="border-t-2 border-[#000000] pt-6">
              <div className="w-12 h-12 bg-[#000000] text-white flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-medium text-[#000000] mb-3">Smart Approvals</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Streamlined approval workflow. Managers review and approve with a single click.
              </p>
            </div>
          </PageTransition>
        </div>
      </div>

      {/* Footer */}
      <PageTransition delay={800}>
        <div className="border-t border-[#e5e5e5] mt-32">
          <div className="max-w-7xl mx-auto px-12 py-8">
            <div className="text-xs text-[#999999]">
              FAST Process Tool © 2026
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};
