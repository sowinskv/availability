import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Calendar, Settings, Folder } from 'lucide-react';
import { useAvailability } from '../hooks/useAvailability';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'availability' | 'settings' | 'projects' | null>(null);
  const { availabilities } = useAvailability();

  const isActive = (path: string) => location.pathname === path;
  const isAvailabilitySectionActive = () => {
    return isActive('/app/availability') || isActive('/app/calendar') || isActive('/app/approvals');
  };
  const isSettingsSectionActive = () => {
    return isActive('/app/preferences') || isActive('/app/notifications') || isActive('/app/integrations') || location.pathname.startsWith('/app/integrations/');
  };
  const isProjectsSectionActive = () => {
    return isActive('/app/projects') || location.pathname.startsWith('/app/projects/');
  };
  const pendingCount = availabilities?.filter(a => a.status === 'pending').length || 0;

  const toggleSection = (section: 'availability' | 'settings' | 'projects') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
    <aside className={`h-screen bg-white border-r border-[#e5e5e5] flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-[72px]' : 'w-[280px]'
    }`}>
      {/* Logo/Brand */}
      <div className={`py-6 transition-all duration-300 ${
        isCollapsed ? 'px-4' : 'px-6'
      }`}>
        <Link to="/app" className="block">
          {isCollapsed ? (
            <div className="w-10 h-10 bg-[#000000] text-white flex items-center justify-center text-base font-semibold">
              F
            </div>
          ) : (
            <>
              <div className="text-[#000000] font-semibold text-lg tracking-tight">FAST</div>
              <div className="text-[#999999] text-xs tracking-wide mt-0.5">PROCESS TOOL</div>
            </>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-6 py-6 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'px-2' : 'px-4'
      }`}>
        {/* Availability Section */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2">
              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">Workspace</div>
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleSection('availability')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded transition-colors focus:outline-none ${
                isAvailabilitySectionActive() || expandedSection === 'availability'
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
              title={isCollapsed ? 'Availability' : ''}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Calendar size={18} className="text-current" />
                </div>
                {!isCollapsed && <span>AVAILABILITY</span>}
              </div>
              {pendingCount > 0 && !isCollapsed && (
                <span className="w-5 h-5 bg-blue-600 text-white text-[8px] font-semibold rounded flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2">
              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">Planning</div>
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleSection('projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded transition-colors focus:outline-none ${
                isProjectsSectionActive() || expandedSection === 'projects'
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
              title={isCollapsed ? 'Projects' : ''}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Folder size={18} className="text-current" />
                </div>
                {!isCollapsed && <span>PROJECTS</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Settings Section */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2">
              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">Settings</div>
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleSection('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded transition-colors focus:outline-none ${
                isSettingsSectionActive() || expandedSection === 'settings'
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
              title={isCollapsed ? 'Settings' : ''}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Settings size={18} className="text-current" />
                </div>
                {!isCollapsed && <span>SETTINGS</span>}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Toggle Button */}
      <div className="border-t border-[#e5e5e5]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full p-4 flex items-center justify-center text-[#666666] hover:text-[#000000] hover:bg-[#fafafa] transition-colors focus:outline-none"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User Footer */}
      <div className={`border-t border-[#e5e5e5] transition-all duration-300 ${
        isCollapsed ? 'px-4 py-4' : 'px-6 py-6'
      }`}>
        {user && (
          <>
            {isCollapsed ? (
              <div className="w-10 h-10 bg-[#000000] text-white flex items-center justify-center text-sm font-semibold rounded">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            ) : (
              <div className="mb-3">
                <div className="text-sm font-medium text-[#000000] mb-0.5">{user.name}</div>
                <div className="text-xs text-[#999999] uppercase">{user.role}</div>
              </div>
            )}
          </>
        )}
        {!isCollapsed && (
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-xs text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide focus:outline-none"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>

    {/* Secondary Sidebar */}
    <aside
      className={`h-screen bg-white border-r border-[#e5e5e5] flex flex-col transition-all duration-300 ${
        expandedSection ? 'w-[240px] opacity-100' : 'w-0 opacity-0'
      } overflow-hidden`}
    >
      {expandedSection === 'availability' && (
        <div className="flex-1 py-6 px-4">
          <div className="px-2 mb-4">
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">AVAILABILITY</div>
            <div className="text-xs text-[#666666]">Manage team availability</div>
          </div>
          <div className="space-y-1">
            <Link
              to="/app/availability"
              onClick={() => setExpandedSection(null)}
              className={`block px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/availability')
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              Log Availability
            </Link>
            <Link
              to="/app/calendar"
              onClick={() => setExpandedSection(null)}
              className={`block px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/calendar')
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              Team Overview
            </Link>
            <Link
              to="/app/approvals"
              onClick={() => setExpandedSection(null)}
              className={`flex items-center justify-between px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/approvals')
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              <span>Approvals</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white text-[8px] font-semibold rounded flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}

      {expandedSection === 'projects' && (
        <div className="flex-1 py-6 px-4">
          <div className="px-2 mb-4">
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">PROJECTS</div>
            <div className="text-xs text-[#666666]">Manage projects & requirements</div>
          </div>
          <div className="space-y-1">
            <Link
              to="/app/projects"
              onClick={() => setExpandedSection(null)}
              className={`block px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/projects')
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              All Projects
            </Link>
            <Link
              to="/app/projects/wizard"
              onClick={() => setExpandedSection(null)}
              className={`block px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/projects/wizard')
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              Requirements Collection
            </Link>
          </div>
        </div>
      )}

      {expandedSection === 'settings' && (
        <div className="flex-1 py-6 px-4">
          <div className="px-2 mb-4">
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">SETTINGS</div>
            <div className="text-xs text-[#666666]">Configure your preferences</div>
          </div>
          <div className="space-y-1">
            <Link
              to="/app/preferences"
              onClick={() => setExpandedSection(null)}
              className={`block px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/preferences')
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              Preferences
            </Link>
            <Link
              to="/app/notifications"
              onClick={() => setExpandedSection(null)}
              className={`block px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/notifications')
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              Notifications
            </Link>
            <Link
              to="/app/integrations"
              onClick={() => setExpandedSection(null)}
              className={`block px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/integrations') || location.pathname.startsWith('/app/integrations/')
                  ? 'text-[#000000] font-medium'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              Integrations
            </Link>
          </div>
        </div>
      )}
    </aside>
    </>
  );
};
