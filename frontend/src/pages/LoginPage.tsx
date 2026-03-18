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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        {/* Back button */}
        <PageTransition delay={0}>
          <button
            onClick={() => navigate('/')}
            className="mb-12 flex items-center gap-2 text-[#666666] hover:text-[#000000] transition-colors text-sm uppercase tracking-wide"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </PageTransition>

        {/* Logo */}
        <PageTransition delay={100}>
          <div className="mb-12">
            <div className="mb-8">
              <div className="text-[#000000] font-semibold text-2xl tracking-tight">FAST</div>
              <div className="text-[#999999] text-xs tracking-wide mt-0.5">PROCESS TOOL</div>
            </div>
            <h1 className="text-3xl font-light text-[#000000] mb-2">Sign in</h1>
            <p className="text-[#666666] text-sm">Welcome back to your workspace</p>
          </div>
        </PageTransition>

        {/* Login form */}
        <PageTransition delay={200}>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="user" className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                Select User (Mock Login)
              </label>
              <select
                id="user"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                required
                className="w-full px-0 py-3 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
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
              className="w-full px-8 py-3 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              Sign In
            </button>

            <div className="space-y-3 pt-4">
              <p className="text-center text-xs text-[#999999]">
                Mock authentication - select any user to continue
              </p>
              <div className="text-xs text-[#999999] space-y-1 border-t border-[#e5e5e5] pt-4">
                <p><strong className="text-[#666666]">DEV:</strong> Can log own availability</p>
                <p><strong className="text-[#666666]">BA/Manager:</strong> Can approve team availability</p>
                <p><strong className="text-[#666666]">Client:</strong> View-only access</p>
              </div>
            </div>
          </form>
        </PageTransition>
      </div>
    </div>
  );
};
