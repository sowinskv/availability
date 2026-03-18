import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load preferences from localStorage
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      notifications: {
        email: true,
        push: false,
        approvalRequests: true,
        decisions: true,
        calendarChanges: true,
        weeklySummary: false,
      },
      display: {
        theme: 'light',
        dateFormat: 'MM/DD/YYYY',
        startOfWeek: 'monday',
        defaultCalendarView: 'month',
      },
    };
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const updateNotificationPreference = (key: string, value: boolean) => {
    setPreferences({
      ...preferences,
      notifications: { ...preferences.notifications, [key]: value },
    });
  };

  const updateDisplayPreference = (key: string, value: string) => {
    setPreferences({
      ...preferences,
      display: { ...preferences.display, [key]: value },
    });
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">SETTINGS</div>
            <h1 className="text-2xl font-normal text-[#000000]">Preferences</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8">
        <div className="max-w-3xl space-y-12">
          {/* Profile Section */}
          <section>
            <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
              Profile
            </h2>
            <div className="space-y-4 pl-4 border-l-2 border-[#e5e5e5]">
              <div>
                <label className="block text-xs text-[#999999] uppercase mb-1">Name</label>
                <div className="text-sm text-[#000000]">{user?.name}</div>
              </div>
              <div>
                <label className="block text-xs text-[#999999] uppercase mb-1">Email</label>
                <div className="text-sm text-[#000000]">{user?.email}</div>
              </div>
              <div>
                <label className="block text-xs text-[#999999] uppercase mb-1">Role</label>
                <div className="inline-block px-3 py-1 text-xs font-medium text-white bg-[#000000] uppercase">
                  {user?.role}
                </div>
              </div>
            </div>
          </section>

          {/* Notification Preferences */}
          <section>
            <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
              Notifications
            </h2>
            <div className="space-y-4 pl-4 border-l-2 border-[#e5e5e5]">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm text-[#000000]">Email Notifications</div>
                  <div className="text-xs text-[#999999]">Receive notifications via email</div>
                </div>
                <label className="relative inline-block w-12 h-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.email}
                    onChange={(e) => updateNotificationPreference('email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-[#e5e5e5] peer-checked:bg-[#000000] transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white transition-transform peer-checked:translate-x-6"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm text-[#000000]">Push Notifications</div>
                  <div className="text-xs text-[#999999]">Receive browser push notifications</div>
                </div>
                <label className="relative inline-block w-12 h-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.push}
                    onChange={(e) => updateNotificationPreference('push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-[#e5e5e5] peer-checked:bg-[#000000] transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white transition-transform peer-checked:translate-x-6"></div>
                </label>
              </div>

              <div className="pt-4 space-y-3">
                <div className="text-xs text-[#999999] uppercase font-medium">Notification Types</div>
                {[
                  { key: 'approvalRequests', label: 'Approval Requests' },
                  { key: 'decisions', label: 'Approval Decisions' },
                  { key: 'calendarChanges', label: 'Calendar Changes' },
                  { key: 'weeklySummary', label: 'Weekly Summary' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications[key]}
                      onChange={(e) => updateNotificationPreference(key, e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-[#666666]">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Display Preferences */}
          <section>
            <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
              Display
            </h2>
            <div className="space-y-4 pl-4 border-l-2 border-[#e5e5e5]">
              <div>
                <label className="block text-xs text-[#999999] uppercase mb-2">Theme</label>
                <select
                  value={preferences.display.theme}
                  onChange={(e) => updateDisplayPreference('theme', e.target.value)}
                  className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#999999] uppercase mb-2">Date Format</label>
                <select
                  value={preferences.display.dateFormat}
                  onChange={(e) => updateDisplayPreference('dateFormat', e.target.value)}
                  className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#999999] uppercase mb-2">Start of Week</label>
                <select
                  value={preferences.display.startOfWeek}
                  onChange={(e) => updateDisplayPreference('startOfWeek', e.target.value)}
                  className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
                >
                  <option value="sunday">Sunday</option>
                  <option value="monday">Monday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#999999] uppercase mb-2">Default Calendar View</label>
                <select
                  value={preferences.display.defaultCalendarView}
                  onChange={(e) => updateDisplayPreference('defaultCalendarView', e.target.value)}
                  className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
                >
                  <option value="today">Today</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>
          </section>

          {/* Integration Settings */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">
                Integrations
              </h2>
              <button
                onClick={() => navigate('/app/integrations')}
                className="text-xs text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4 pl-4 border-l-2 border-[#e5e5e5]">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm text-[#000000]">Notion</div>
                  <div className="text-xs text-[#999999]">Task Management</div>
                </div>
                <button
                  onClick={() => navigate('/app/integrations/notion')}
                  className="px-4 py-2 text-xs text-[#666666] hover:text-[#000000] border border-[#e5e5e5] hover:border-[#000000] transition-colors uppercase tracking-wide"
                >
                  Setup
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm text-[#000000]">Microsoft Teams</div>
                  <div className="text-xs text-[#999999]">Calendar Sync</div>
                </div>
                <button
                  onClick={() => navigate('/app/integrations/teams')}
                  className="px-4 py-2 text-xs text-[#666666] hover:text-[#000000] border border-[#e5e5e5] hover:border-[#000000] transition-colors uppercase tracking-wide"
                >
                  Setup
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
