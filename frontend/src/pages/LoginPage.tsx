import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageTransition } from '../components/PageTransition';
import { ArrowLeft } from 'lucide-react';

const MOCK_USERS = [
  { email: 'dev@example.com', name: 'Developer User', role: 'dev' },
  { email: 'ba@example.com', name: 'BA User', role: 'ba' },
  { email: 'manager@example.com', name: 'Manager User', role: 'manager' },
  { email: 'marek@example.com', name: 'Marek', role: 'manager' },
  { email: 'client@example.com', name: 'Client User', role: 'client' },
];

export const LoginPage: React.FC = () => {
  const [selectedEmail, setSelectedEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmail) {
      login(selectedEmail);
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        {/* Back button */}
        <PageTransition delay={0}>
          <button
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </PageTransition>

        {/* Logo */}
        <PageTransition delay={100}>
          <div className="mb-8">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mb-6">
              <span className="text-white dark:text-black font-bold text-xl">O</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Sign in</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back</p>
          </div>
        </PageTransition>

        {/* Login form */}
        <PageTransition delay={200}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="user" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Select User (Mock Login)
              </label>
              <select
                id="user"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all appearance-none cursor-pointer"
              >
                <option value="">Choose a role...</option>
                {MOCK_USERS.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.name} ({user.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedEmail}
              className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In
            </button>

            <div className="space-y-2">
              <p className="text-center text-sm text-gray-500 dark:text-gray-500">
                Mock authentication - select any user to continue
              </p>
              <div className="text-xs text-gray-400 dark:text-gray-600 space-y-1">
                <p><strong>DEV:</strong> Can see own availability, generate/approve requirements</p>
                <p><strong>BA/Manager:</strong> Can see all team availability, approve requirements</p>
                <p><strong>Client:</strong> View-only access</p>
              </div>
            </div>
          </form>
        </PageTransition>
      </div>
    </div>
  );
};
