import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { RequirementsPage } from './pages/RequirementsPage';
import { TasksPage } from './pages/TasksPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <div className="flex h-screen bg-notion-bg-light dark:bg-notion-bg-dark overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/availability" element={<AvailabilityPage />} />
                <Route path="/requirements" element={<RequirementsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/allocations" element={<AllocationsPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const HomePage: React.FC = () => {
  return (
    <div className="p-12 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-3">
          Welcome to Our process tool
        </h1>
        <p className="text-lg text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
          ai-powered project planning engine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-notion-bg-light dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg hover:shadow-sm transition-all duration-200">
          <h3 className="text-lg font-semibold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-2">
            team intelligence
          </h3>
          <p className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark leading-relaxed">
            track availability, skills, and velocity across your team with voice input and calendar sync
          </p>
        </div>

        <div className="p-8 bg-notion-bg-light dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg hover:shadow-sm transition-all duration-200">
          <h3 className="text-lg font-semibold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-2">
            smart planning
          </h3>
          <p className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark leading-relaxed">
            generate structured requirements and granular tasks from natural language with ai
          </p>
        </div>

        <div className="p-8 bg-notion-bg-light dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg hover:shadow-sm transition-all duration-200">
          <h3 className="text-lg font-semibold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-2">
            intelligent allocation
          </h3>
          <p className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark leading-relaxed">
            ai-powered task allocation based on skills, capacity, and historical velocity
          </p>
        </div>
      </div>
    </div>
  );
};

const AllocationsPage: React.FC = () => {
  return (
    <div className="p-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-4">
        Allocations
      </h1>
      <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
        coming soon...
      </p>
    </div>
  );
};

export default App;
