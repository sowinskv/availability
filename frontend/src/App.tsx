import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
      <Router>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                  <Link to="/" className="text-xl font-bold text-blue-600">
                    Atlas
                  </Link>
                  <div className="flex gap-4">
                    <Link
                      to="/availability"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Availability
                    </Link>
                    <Link
                      to="/requirements"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Requirements
                    </Link>
                    <Link
                      to="/tasks"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Tasks
                    </Link>
                    <Link
                      to="/allocations"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Allocations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/availability" element={<AvailabilityPage />} />
            <Route path="/requirements" element={<RequirementsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/allocations" element={<div className="p-8">Allocations Page (Coming Soon)</div>} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

const HomePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Atlas
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-Powered Project Planning Engine
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Team Intelligence
            </h3>
            <p className="text-gray-600">
              Track availability, skills, and velocity across your team
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Planning
            </h3>
            <p className="text-gray-600">
              Generate requirements and tasks from natural language
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Intelligent Allocation
            </h3>
            <p className="text-gray-600">
              AI-powered task allocation based on skills and capacity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
