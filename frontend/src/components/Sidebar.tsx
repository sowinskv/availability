import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, FileText, CheckSquare, Users, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/availability', label: 'Availability', icon: <Calendar size={18} /> },
  { path: '/requirements', label: 'Requirements', icon: <FileText size={18} /> },
  { path: '/tasks', label: 'Tasks', icon: <CheckSquare size={18} /> },
  { path: '/allocations', label: 'Allocations', icon: <Users size={18} /> },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 h-screen bg-notion-sidebar-light dark:bg-notion-sidebar-dark border-r border-notion-border-light dark:border-notion-border-dark flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-notion-border-light dark:border-notion-border-dark">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">OP</span>
          </div>
          <span className="text-notion-text-primary-light dark:text-notion-text-primary-dark font-semibold text-base group-hover:opacity-80 transition-opacity">
            Our process tool
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-notion-active-light dark:bg-notion-active-dark text-notion-text-primary-light dark:text-notion-text-primary-dark'
                    : 'text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark'
                }
              `}
            >
              <span className={isActive ? 'opacity-100' : 'opacity-60'}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-notion-border-light dark:border-notion-border-dark">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark transition-all"
        >
          {theme === 'light' ? <Moon size={18} className="opacity-60" /> : <Sun size={18} className="opacity-60" />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>
    </aside>
  );
};
