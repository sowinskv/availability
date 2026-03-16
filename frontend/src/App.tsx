import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AuthenticatedApp: React.FC = () => {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <AuthenticatedApp />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const HomePage: React.FC = () => {
  return (
    <div className="p-12 max-w-5xl mx-auto">
      <h2 className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark mb-16">
        Our services
      </h2>

      <div className="space-y-0">
        <div className="py-8 grid grid-cols-2 gap-8 border-b border-notion-border-light dark:border-notion-border-dark">
          <h3 className="text-lg font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
            Team Intelligence
          </h3>
          <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
            Track availability, skills, and velocity across your team with voice input and calendar sync.
          </p>
        </div>

        <div className="py-8 grid grid-cols-2 gap-8 border-b border-notion-border-light dark:border-notion-border-dark">
          <h3 className="text-lg font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
            Smart Planning
          </h3>
          <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
            Generate structured requirements and granular tasks from natural language with AI.
          </p>
        </div>

        <div className="py-8 grid grid-cols-2 gap-8 border-b border-notion-border-light dark:border-notion-border-dark">
          <h3 className="text-lg font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
            Intelligent Allocation
          </h3>
          <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
            AI-powered task allocation based on skills, capacity, and historical velocity.
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
