import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calendar, RefreshCw, Clock, XCircle } from 'lucide-react';
import { useModal } from '../../hooks/useModal';

export const TeamsIntegrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm, ModalComponent } = useModal();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock connection data
  const [connectionData, setConnectionData] = useState({
    accountEmail: '',
    selectedCalendar: '',
    createOOO: true,
    syncFrequency: '15',
    twoWaySync: false,
    oooTypes: ['vacation', 'sick'],
  });

  const handleConnect = async () => {
    setIsConnecting(true);

    // Simulate Microsoft SSO OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsConnected(true);
    setConnectionData({
      ...connectionData,
      accountEmail: 'user@company.com',
      selectedCalendar: 'Calendar',
    });
    setIsConnecting(false);

    showAlert('Successfully connected to Microsoft Teams!', 'Success');
  };

  const handleDisconnect = async () => {
    const confirmed = await showConfirm(
      'Are you sure you want to disconnect Microsoft Teams? This will stop calendar synchronization.',
      'Confirm Disconnect'
    );

    if (confirmed) {
      setIsConnected(false);
      setConnectionData({
        accountEmail: '',
        selectedCalendar: '',
        createOOO: true,
        syncFrequency: '15',
        twoWaySync: false,
        oooTypes: ['vacation', 'sick'],
      });
      showAlert('Microsoft Teams has been disconnected.', 'Disconnected');
    }
  };

  const handleSaveSettings = () => {
    showAlert('Settings saved successfully!', 'Success');
  };

  const toggleOOOType = (type: string) => {
    if (connectionData.oooTypes.includes(type)) {
      setConnectionData({
        ...connectionData,
        oooTypes: connectionData.oooTypes.filter(t => t !== type),
      });
    } else {
      setConnectionData({
        ...connectionData,
        oooTypes: [...connectionData.oooTypes, type],
      });
    }
  };

  return (
    <>
      {ModalComponent}
      <div className="h-full bg-white">
        {/* Header */}
        <div className="border-b border-[#e5e5e5] px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app/integrations')}
                className="text-[#666666] hover:text-[#000000] transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">
                  INTEGRATION
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💬</span>
                  <h1 className="text-2xl font-normal text-[#000000]">Microsoft Teams</h1>
                </div>
              </div>
            </div>
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="px-6 py-2.5 text-sm text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 transition-colors uppercase tracking-wide"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-6 py-2.5 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-wide"
              >
                {isConnecting ? 'Connecting...' : 'Connect to Teams'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-12 py-8">
          <div className="max-w-3xl space-y-12">
            {!isConnected ? (
              /* Not Connected State */
              <section>
                <div className="text-center py-16">
                  <div className="text-6xl mb-6">💬</div>
                  <h2 className="text-xl font-normal text-[#000000] mb-4">
                    Connect Microsoft Teams for Calendar Sync
                  </h2>
                  <p className="text-sm text-[#666666] mb-8 max-w-md mx-auto leading-relaxed">
                    Automatically sync team availability with Microsoft Teams calendar. Add Out of Office markers
                    and keep everyone informed about schedule changes.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
                    <div className="p-6 border border-[#e5e5e5]">
                      <Calendar size={24} className="text-[#000000] mb-3" />
                      <h3 className="text-sm font-medium text-[#000000] mb-2 uppercase">
                        Calendar Sync
                      </h3>
                      <p className="text-xs text-[#666666]">
                        View FAST availability directly in Teams calendar
                      </p>
                    </div>
                    <div className="p-6 border border-[#e5e5e5]">
                      <RefreshCw size={24} className="text-[#000000] mb-3" />
                      <h3 className="text-sm font-medium text-[#000000] mb-2 uppercase">
                        Auto OOO Markers
                      </h3>
                      <p className="text-xs text-[#666666]">
                        Automatically add Out of Office when unavailable
                      </p>
                    </div>
                    <div className="p-6 border border-[#e5e5e5]">
                      <Clock size={24} className="text-[#000000] mb-3" />
                      <h3 className="text-sm font-medium text-[#000000] mb-2 uppercase">
                        Real-time Updates
                      </h3>
                      <p className="text-xs text-[#666666]">
                        Keep calendars synchronized in real-time
                      </p>
                    </div>
                  </div>

                  {/* OAuth Info */}
                  <div className="mt-12 p-6 bg-[#fafafa] text-left">
                    <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-3">
                      How Connection Works
                    </div>
                    <ol className="text-sm text-[#666666] space-y-2 list-decimal list-inside">
                      <li>Click "Connect to Teams" to open Microsoft SSO</li>
                      <li>Sign in with your Microsoft account</li>
                      <li>Grant calendar read/write permissions</li>
                      <li>Configure OOO creation rules and sync frequency</li>
                    </ol>
                  </div>

                  {/* Security Note */}
                  <div className="mt-6 p-6 border border-[#e5e5e5] text-left">
                    <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-3">
                      Security & Privacy
                    </div>
                    <p className="text-xs text-[#666666] leading-relaxed">
                      We only request minimal permissions needed for calendar sync. Your Microsoft credentials
                      are never stored, and you can revoke access at any time through your Microsoft account settings.
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              /* Connected State */
              <>
                {/* Connection Status */}
                <section>
                  <div className="flex items-center gap-3 p-6 bg-green-50 border border-green-200">
                    <CheckCircle size={24} className="text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#000000]">
                        Connected to {connectionData.accountEmail}
                      </div>
                      <div className="text-xs text-[#666666]">
                        Syncing to: {connectionData.selectedCalendar}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Calendar Selection */}
                <section>
                  <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                    Calendar Settings
                  </h2>
                  <div className="space-y-4 pl-4 border-l-2 border-[#e5e5e5]">
                    <div>
                      <label className="block text-xs text-[#999999] uppercase mb-2">
                        Target Calendar
                      </label>
                      <select
                        value={connectionData.selectedCalendar}
                        onChange={(e) => setConnectionData({ ...connectionData, selectedCalendar: e.target.value })}
                        className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="Calendar">Calendar</option>
                        <option value="Team Calendar">Team Calendar</option>
                        <option value="Work Calendar">Work Calendar</option>
                      </select>
                      <p className="text-xs text-[#999999] mt-2">
                        Select which Teams calendar to sync with
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs text-[#999999] uppercase mb-2">
                        Sync Frequency
                      </label>
                      <select
                        value={connectionData.syncFrequency}
                        onChange={(e) => setConnectionData({ ...connectionData, syncFrequency: e.target.value })}
                        className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="5">Every 5 minutes</option>
                        <option value="15">Every 15 minutes</option>
                        <option value="30">Every 30 minutes</option>
                        <option value="60">Every hour</option>
                      </select>
                      <p className="text-xs text-[#999999] mt-2">
                        How often to check for calendar changes
                      </p>
                    </div>
                  </div>
                </section>

                {/* OOO Settings */}
                <section>
                  <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                    Out of Office Settings
                  </h2>
                  <div className="space-y-4 pl-4 border-l-2 border-[#e5e5e5]">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm text-[#000000]">Create OOO Markers</div>
                        <div className="text-xs text-[#999999]">
                          Add Out of Office status in Teams when unavailable
                        </div>
                      </div>
                      <label className="relative inline-block w-12 h-6 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={connectionData.createOOO}
                          onChange={(e) => setConnectionData({ ...connectionData, createOOO: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-full h-full bg-[#e5e5e5] peer-checked:bg-[#000000] transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white transition-transform peer-checked:translate-x-6"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm text-[#000000]">Two-Way Sync</div>
                        <div className="text-xs text-[#999999]">
                          Update FAST when Teams calendar changes
                        </div>
                      </div>
                      <label className="relative inline-block w-12 h-6 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={connectionData.twoWaySync}
                          onChange={(e) => setConnectionData({ ...connectionData, twoWaySync: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-full h-full bg-[#e5e5e5] peer-checked:bg-[#000000] transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white transition-transform peer-checked:translate-x-6"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs text-[#999999] uppercase mb-3">
                        Availability Types for OOO
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'vacation', label: 'Vacation' },
                          { value: 'sick', label: 'Sick Leave' },
                          { value: 'partial', label: 'Partial Availability' },
                        ].map((type) => (
                          <label key={type.value} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={connectionData.oooTypes.includes(type.value)}
                              onChange={() => toggleOOOType(type.value)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-[#666666]">{type.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-[#999999] mt-2">
                        Which availability types should create OOO markers
                      </p>
                    </div>
                  </div>
                </section>

                {/* Permissions */}
                <section>
                  <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                    Granted Permissions
                  </h2>
                  <div className="space-y-3 pl-4 border-l-2 border-[#e5e5e5]">
                    {[
                      { label: 'Read calendar events', granted: true },
                      { label: 'Create calendar events', granted: true },
                      { label: 'Update calendar events', granted: true },
                      { label: 'Read user profile', granted: true },
                      { label: 'Send notifications', granted: false },
                    ].map((permission, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        {permission.granted ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-[#999999]" />
                        )}
                        <span className={permission.granted ? 'text-[#000000]' : 'text-[#999999]'}>
                          {permission.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Last Sync Info */}
                <section>
                  <div className="p-4 bg-[#fafafa] text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666]">Last synchronized:</span>
                      <span className="text-[#000000] font-medium">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#666666]">Events synced:</span>
                      <span className="text-[#000000] font-medium">12 items</span>
                    </div>
                  </div>
                </section>

                {/* Save Button */}
                <div className="pt-6">
                  <button
                    onClick={handleSaveSettings}
                    className="px-8 py-3 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wide"
                  >
                    Save Settings
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
