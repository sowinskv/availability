import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { PageTransition } from './components/PageTransition';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { CalendarPage } from './pages/CalendarPage';
import { RequirementsPage } from './pages/RequirementsPage';
import { TasksPage } from './pages/TasksPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { NotionIntegrationPage } from './pages/integrations/NotionIntegrationPage';
import { TeamsIntegrationPage } from './pages/integrations/TeamsIntegrationPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RequirementsWizardPage } from './pages/RequirementsWizardPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';

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
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/availability" element={<AvailabilityPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/requirements" element={<RequirementsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/allocations" element={<AllocationsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/wizard" element={<RequirementsWizardPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/integrations/notion" element={<NotionIntegrationPage />} />
            <Route path="/integrations/teams" element={<TeamsIntegrationPage />} />
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
  const navigate = useNavigate();

  return (
    <div className="h-full bg-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-12 text-center">
        <PageTransition delay={0}>
          <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
            WELCOME TO FAST
          </div>
        </PageTransition>

        <PageTransition delay={100}>
          <h1 className="text-4xl font-light text-[#000000] mb-6">
            Log your availability
          </h1>
        </PageTransition>

        <PageTransition delay={200}>
          <p className="text-lg text-[#666666] mb-12 leading-relaxed">
            Start by recording your availability using voice input or manual entry. Your team will be able to see your schedule in real-time.
          </p>
        </PageTransition>

        <PageTransition delay={300}>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/app/availability')}
              className="px-8 py-4 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wide"
            >
              Log Availability
            </button>
            <button
              onClick={() => navigate('/app/calendar')}
              className="px-8 py-4 border border-[#e5e5e5] text-[#666666] text-sm font-medium hover:text-[#000000] hover:border-[#000000] transition-colors uppercase tracking-wide"
            >
              View Calendar
            </button>
          </div>
        </PageTransition>

        <PageTransition delay={400}>
          <div className="mt-16 pt-8 border-t border-[#e5e5e5]">
            <div className="grid grid-cols-3 gap-8 text-left">
              <div>
                <div className="text-2xl font-light text-[#000000] mb-2">01</div>
                <div className="text-xs text-[#999999] uppercase tracking-wide mb-2">Voice Input</div>
                <div className="text-sm text-[#666666]">Record naturally</div>
              </div>
              <div>
                <div className="text-2xl font-light text-[#000000] mb-2">02</div>
                <div className="text-xs text-[#999999] uppercase tracking-wide mb-2">Team View</div>
                <div className="text-sm text-[#666666]">See capacity</div>
              </div>
              <div>
                <div className="text-2xl font-light text-[#000000] mb-2">03</div>
                <div className="text-xs text-[#999999] uppercase tracking-wide mb-2">Approvals</div>
                <div className="text-sm text-[#666666]">One-click review</div>
              </div>
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

const AllocationsPage: React.FC = () => {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">AI PLANNING</div>
            <h1 className="text-2xl font-normal text-[#000000]">Allocations</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <PageTransition delay={100}>
          <div className="text-center">
            <div className="text-6xl font-light text-[#e5e5e5] mb-4">Coming Soon</div>
            <p className="text-[#999999]">AI-powered task allocation and capacity planning</p>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

export default App;
