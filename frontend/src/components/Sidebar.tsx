import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, FileText, CheckSquare, Users, Moon, Sun, LogOut, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/app', label: 'Home', icon: <Users size={18} /> },
  { path: '/app/availability', label: 'Availability', icon: <Clock size={18} /> },
  { path: '/app/calendar', label: 'Calendar', icon: <Calendar size={18} /> },
  { path: '/app/requirements', label: 'Requirements', icon: <FileText size={18} /> },
  { path: '/app/tasks', label: 'Tasks', icon: <CheckSquare size={18} /> },
  { path: '/app/allocations', label: 'Allocations', icon: <Users size={18} /> },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 h-screen bg-notion-bg-light dark:bg-notion-bg-dark border-r border-notion-border-light dark:border-notion-border-dark flex flex-col">
      {/* Logo/Brand */}
      <div className="px-4 py-6">
        <Link to="/app" className="flex items-center gap-2 group">
          <span className="text-notion-text-primary-light dark:text-notion-text-primary-dark font-semibold text-sm group-hover:opacity-70 transition-opacity">
            Our process tool
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all
                ${
                  isActive
                    ? 'bg-notion-hover-light dark:bg-notion-hover-dark text-notion-text-primary-light dark:text-notion-text-primary-dark'
                    : 'text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark'
                }
              `}
            >
              <span className={isActive ? 'opacity-100' : 'opacity-50'}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-notion-border-light dark:border-notion-border-dark space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark transition-all"
        >
          {theme === 'light' ? <Moon size={16} className="opacity-50" /> : <Sun size={16} className="opacity-50" />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        {user && (
          <div className="px-3 py-2 space-y-1">
            <div className="text-sm font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
              {user.name}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded uppercase font-medium">
                {user.role}
              </span>
              <span className="text-xs text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                {user.email}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark transition-all"
        >
          <LogOut size={16} className="opacity-50" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
