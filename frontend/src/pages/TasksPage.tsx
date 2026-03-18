import React from 'react';
import { PageTransition } from '../components/PageTransition';

export const TasksPage: React.FC = () => {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">AI PLANNING</div>
            <h1 className="text-2xl font-normal text-[#000000]">Tasks</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <PageTransition delay={100}>
          <div className="text-center">
            <div className="text-6xl font-light text-[#e5e5e5] mb-4">Coming Soon</div>
            <p className="text-[#999999]">AI-powered task decomposition and management</p>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};
