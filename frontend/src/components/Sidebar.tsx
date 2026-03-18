import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, CheckCircle, Settings, Bell, Plug } from 'lucide-react';
import { useAvailability } from '../hooks/useAvailability';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { availabilities } = useAvailability();

  const isActive = (path: string) => location.pathname === path;
  const pendingCount = availabilities?.filter(a => a.status === 'pending').length || 0;

  return (
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
        {/* Workspace Section */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2">
              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">Workspace</div>
            </div>
          )}
          <div className="space-y-0.5">
            <Link
              to="/app/availability"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/availability')
                  ? 'text-[#000000] font-medium bg-[#f5f5f5]'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-[#fafafa]'
              }`}
              title={isCollapsed ? 'My Availability' : ''}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Calendar size={18} className="text-current" />
              </div>
              {!isCollapsed && <span>MY AVAILABILITY</span>}
            </Link>
            <Link
              to="/app/calendar"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/calendar')
                  ? 'text-[#000000] font-medium bg-[#f5f5f5]'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-[#fafafa]'
              }`}
              title={isCollapsed ? 'Team Overview' : ''}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <CalendarDays size={18} className="text-current" />
              </div>
              {!isCollapsed && <span>TEAM OVERVIEW</span>}
            </Link>
            <Link
              to="/app/approvals"
              className={`flex items-center justify-between px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/approvals')
                  ? 'text-[#000000] font-medium bg-[#f5f5f5]'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-[#fafafa]'
              }`}
              title={isCollapsed ? 'Approvals' : ''}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <CheckCircle size={18} className="text-current" />
                </div>
                {!isCollapsed && <span>APPROVALS</span>}
              </div>
              {pendingCount > 0 && !isCollapsed && (
                <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-semibold rounded flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
              {pendingCount > 0 && isCollapsed && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </Link>
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
            <Link
              to="/app/preferences"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/preferences')
                  ? 'text-[#000000] font-medium bg-[#f5f5f5]'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-[#fafafa]'
              }`}
              title={isCollapsed ? 'Preferences' : ''}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Settings size={18} className="text-current" />
              </div>
              {!isCollapsed && <span>PREFERENCES</span>}
            </Link>
            <Link
              to="/app/notifications"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/notifications')
                  ? 'text-[#000000] font-medium bg-[#f5f5f5]'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-[#fafafa]'
              }`}
              title={isCollapsed ? 'Notifications' : ''}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Bell size={18} className="text-current" />
              </div>
              {!isCollapsed && <span>NOTIFICATIONS</span>}
            </Link>
            <Link
              to="/app/integrations"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                isActive('/app/integrations') || location.pathname.startsWith('/app/integrations/')
                  ? 'text-[#000000] font-medium bg-[#f5f5f5]'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-[#fafafa]'
              }`}
              title={isCollapsed ? 'Integrations' : ''}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Plug size={18} className="text-current" />
              </div>
              {!isCollapsed && <span>INTEGRATIONS</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* Toggle Button */}
      <div className="border-t border-[#e5e5e5]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full p-4 flex items-center justify-center text-[#666666] hover:text-[#000000] hover:bg-[#fafafa] transition-colors"
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
            className="text-xs text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
};
