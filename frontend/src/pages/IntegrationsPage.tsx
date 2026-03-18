import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'not_connected';
  logo: string;
  route: string;
}

const INTEGRATIONS: IntegrationCard[] = [
  {
    id: 'notion',
    name: 'Notion',
    description: 'Create and assign tasks based on team availability. Automatically sync requirements and allocations to your Notion workspace.',
    category: 'Task Management',
    status: 'not_connected',
    logo: '📝',
    route: '/app/integrations/notion',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Sync availability with Teams calendar. Automatically add Out of Office markers when team members are unavailable.',
    category: 'Calendar Sync',
    status: 'not_connected',
    logo: '💬',
    route: '/app/integrations/teams',
  },
];

export const IntegrationsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">SETTINGS</div>
            <h1 className="text-2xl font-normal text-[#000000]">Integrations</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8">
        <div className="max-w-4xl">
          {/* Description */}
          <div className="mb-12">
            <p className="text-sm text-[#666666] leading-relaxed">
              Connect FAST with your existing tools to streamline workflows and automate routine tasks.
              All integrations use secure OAuth authentication and can be disconnected at any time.
            </p>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.id}
                className="border border-[#e5e5e5] hover:border-[#000000] transition-colors cursor-pointer"
                onClick={() => navigate(integration.route)}
              >
                {/* Card Header */}
                <div className="px-6 py-5 border-b border-[#e5e5e5]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{integration.logo}</div>
                      <div>
                        <h3 className="text-lg font-medium text-[#000000]">{integration.name}</h3>
                        <div className="text-xs text-[#999999] uppercase">{integration.category}</div>
                      </div>
                    </div>
                    {integration.status === 'connected' ? (
                      <div className="px-3 py-1 bg-green-600 text-white text-xs font-medium uppercase">
                        Connected
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-[#e5e5e5] text-[#666666] text-xs font-medium uppercase">
                        Not Connected
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 py-5">
                  <p className="text-sm text-[#666666] mb-4 leading-relaxed">
                    {integration.description}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(integration.route);
                    }}
                    className="flex items-center gap-2 text-sm text-[#000000] hover:opacity-70 transition-opacity uppercase tracking-wide"
                  >
                    {integration.status === 'connected' ? 'Manage' : 'Connect'}
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Section */}
          <div className="mt-16 pt-8 border-t border-[#e5e5e5]">
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-6">
              Coming Soon
            </div>
            <div className="grid grid-cols-3 gap-8">
              {[
                { name: 'Slack', icon: '💬' },
                { name: 'Jira', icon: '🎯' },
                { name: 'GitHub', icon: '🐙' },
              ].map((future) => (
                <div key={future.name} className="text-center py-8 border border-[#e5e5e5] opacity-50">
                  <div className="text-3xl mb-2">{future.icon}</div>
                  <div className="text-sm text-[#999999]">{future.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
