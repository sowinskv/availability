import React from 'react';
import { PageTransition } from '../components/PageTransition';

export const RequirementsPage: React.FC = () => {
  return (
    <div className="p-12 max-w-5xl mx-auto">
      <PageTransition delay={0}>
        <div className="mb-20">
          <h1 className="text-3xl font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-12">
            Requirements
          </h1>
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <div className="py-16 text-center">
          <p className="text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
            coming soon
          </p>
        </div>
      </PageTransition>
    </div>
  );
};
