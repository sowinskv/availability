import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Database, Settings, Zap, XCircle } from 'lucide-react';
import { useModal } from '../../hooks/useModal';

export const NotionIntegrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm, ModalComponent } = useModal();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock connection data
  const [connectionData, setConnectionData] = useState({
    workspaceName: '',
    selectedDatabase: '',
    autoCreateTasks: true,
    syncTaskStatus: false,
    assignmentRules: 'availability',
  });

  const handleConnect = async () => {
    setIsConnecting(true);

    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsConnected(true);
    setConnectionData({
      ...connectionData,
      workspaceName: 'My Notion Workspace',
      selectedDatabase: 'Tasks Database',
    });
    setIsConnecting(false);

    showAlert('Successfully connected to Notion!', 'Success');
  };

  const handleDisconnect = async () => {
    const confirmed = await showConfirm(
      'Are you sure you want to disconnect Notion? This will stop all automatic syncing.',
      'Confirm Disconnect'
    );

    if (confirmed) {
      setIsConnected(false);
      setConnectionData({
        workspaceName: '',
        selectedDatabase: '',
        autoCreateTasks: true,
        syncTaskStatus: false,
        assignmentRules: 'availability',
      });
      showAlert('Notion has been disconnected.', 'Disconnected');
    }
  };

  const handleSaveSettings = () => {
    showAlert('Settings saved successfully!', 'Success');
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
                  <span className="text-3xl">📝</span>
                  <h1 className="text-2xl font-normal text-[#000000]">Notion</h1>
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
                {isConnecting ? 'Connecting...' : 'Connect to Notion'}
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
                  <div className="text-6xl mb-6">📝</div>
                  <h2 className="text-xl font-normal text-[#000000] mb-4">
                    Connect Notion for Task Management
                  </h2>
                  <p className="text-sm text-[#666666] mb-8 max-w-md mx-auto leading-relaxed">
                    Automatically create and assign Notion tasks based on team availability and requirements.
                    Keep your project management in sync with resource allocation.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
                    <div className="p-6 border border-[#e5e5e5]">
                      <Zap size={24} className="text-[#000000] mb-3" />
                      <h3 className="text-sm font-medium text-[#000000] mb-2 uppercase">
                        Auto Task Creation
                      </h3>
                      <p className="text-xs text-[#666666]">
                        Create tasks automatically when requirements are approved
                      </p>
                    </div>
                    <div className="p-6 border border-[#e5e5e5]">
                      <Database size={24} className="text-[#000000] mb-3" />
                      <h3 className="text-sm font-medium text-[#000000] mb-2 uppercase">
                        Smart Assignment
                      </h3>
                      <p className="text-xs text-[#666666]">
                        Assign tasks based on team member availability
                      </p>
                    </div>
                    <div className="p-6 border border-[#e5e5e5]">
                      <Settings size={24} className="text-[#000000] mb-3" />
                      <h3 className="text-sm font-medium text-[#000000] mb-2 uppercase">
                        Two-Way Sync
                      </h3>
                      <p className="text-xs text-[#666666]">
                        Keep task status synchronized between platforms
                      </p>
                    </div>
                  </div>

                  {/* OAuth Info */}
                  <div className="mt-12 p-6 bg-[#fafafa] text-left">
                    <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-3">
                      How Connection Works
                    </div>
                    <ol className="text-sm text-[#666666] space-y-2 list-decimal list-inside">
                      <li>Click "Connect to Notion" to open OAuth authorization</li>
                      <li>Select your Notion workspace and grant permissions</li>
                      <li>Choose which database to sync tasks to</li>
                      <li>Configure task creation and assignment rules</li>
                    </ol>
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
                        Connected to {connectionData.workspaceName}
                      </div>
                      <div className="text-xs text-[#666666]">
                        Syncing to: {connectionData.selectedDatabase}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Database Selection */}
                <section>
                  <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                    Database Settings
                  </h2>
                  <div className="space-y-4 pl-4 border-l-2 border-[#e5e5e5]">
                    <div>
                      <label className="block text-xs text-[#999999] uppercase mb-2">
                        Target Database
                      </label>
                      <select
                        value={connectionData.selectedDatabase}
                        onChange={(e) => setConnectionData({ ...connectionData, selectedDatabase: e.target.value })}
                        className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="Tasks Database">Tasks Database</option>
                        <option value="Project Tasks">Project Tasks</option>
                        <option value="Backlog">Backlog</option>
                      </select>
                      <p className="text-xs text-[#999999] mt-2">
                        Select which Notion database to create tasks in
                      </p>
                    </div>
                  </div>
                </section>

                {/* Task Creation Settings */}
                <section>
                  <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                    Task Creation
                  </h2>
                  <div className="space-y-4 pl-4 border-l-2 border-[#e5e5e5]">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm text-[#000000]">Automatic Task Creation</div>
                        <div className="text-xs text-[#999999]">
                          Create tasks when requirements are approved
                        </div>
                      </div>
                      <label className="relative inline-block w-12 h-6 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={connectionData.autoCreateTasks}
                          onChange={(e) => setConnectionData({ ...connectionData, autoCreateTasks: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-full h-full bg-[#e5e5e5] peer-checked:bg-[#000000] transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white transition-transform peer-checked:translate-x-6"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm text-[#000000]">Two-Way Task Status Sync</div>
                        <div className="text-xs text-[#999999]">
                          Update FAST when task status changes in Notion
                        </div>
                      </div>
                      <label className="relative inline-block w-12 h-6 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={connectionData.syncTaskStatus}
                          onChange={(e) => setConnectionData({ ...connectionData, syncTaskStatus: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-full h-full bg-[#e5e5e5] peer-checked:bg-[#000000] transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white transition-transform peer-checked:translate-x-6"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs text-[#999999] uppercase mb-2">
                        Assignment Rules
                      </label>
                      <select
                        value={connectionData.assignmentRules}
                        onChange={(e) => setConnectionData({ ...connectionData, assignmentRules: e.target.value })}
                        className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="availability">Based on Availability</option>
                        <option value="role">Based on Role</option>
                        <option value="manual">Manual Assignment Only</option>
                      </select>
                      <p className="text-xs text-[#999999] mt-2">
                        How to automatically assign tasks to team members
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
                      { label: 'Read workspace databases', granted: true },
                      { label: 'Create and update pages', granted: true },
                      { label: 'Read page content', granted: true },
                      { label: 'Receive webhooks for changes', granted: false },
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
