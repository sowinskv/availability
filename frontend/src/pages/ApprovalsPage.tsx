import React from 'react';
import { useAvailability } from '../hooks/useAvailability';

export const ApprovalsPage: React.FC = () => {
  const { availabilities, approveAvailability, declineAvailability } = useAvailability();

  const pendingApprovals = availabilities?.filter(a => a.status === 'pending') || [];
  const resolvedApprovals = availabilities?.filter(a => a.status !== 'pending') || [];

  const getUserInitials = (userId: number) => {
    // Mock - would come from user service
    const users: Record<number, { name: string; role: string; color: string }> = {
      1: { name: 'Szymon K.', role: 'DEV', color: 'bg-orange-500' },
      2: { name: 'Asia N.', role: 'PM', color: 'bg-pink-600' },
      3: { name: 'Janek M.', role: 'DEV LEAD', color: 'bg-blue-600' },
    };
    const user = users[userId] || { name: 'Unknown', role: 'USER', color: 'bg-gray-500' };
    const initials = user.name.split(' ').map(n => n[0]).join('');
    return { initials, ...user };
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">
              MANAGER / BA / MAREK
            </div>
            <h1 className="text-2xl font-normal text-[#000000]">Approvals</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide">
              SEARCH
            </button>
            <button className="px-6 py-2.5 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wide">
              + LOG AVAILABILITY
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8">
        {/* Pending Section */}
        {pendingApprovals.length > 0 && (
          <div className="mb-12">
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-6">
              PENDING — {pendingApprovals.length} TO REVIEW
            </div>

            <div className="space-y-4">
              {pendingApprovals.map((approval) => {
                const user = getUserInitials(approval.user_id);
                return (
                  <div
                    key={approval.id}
                    className="flex items-center justify-between py-4 border-b border-[#e5e5e5]"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 ${user.color} text-white flex items-center justify-center text-sm font-semibold`}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <div className="text-[#000000] font-medium">{user.name}</div>
                        <div className="text-sm text-[#999999]">
                          {approval.type} — {new Date(approval.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => declineAvailability.mutate(approval.id)}
                        className="px-5 py-2 text-sm text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide"
                      >
                        DECLINE
                      </button>
                      <button
                        onClick={() => approveAvailability.mutate(approval.id)}
                        className="px-5 py-2 text-sm text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide"
                      >
                        APPROVE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resolved Section */}
        {resolvedApprovals.length > 0 && (
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-6">
              RESOLVED
            </div>

            <div className="space-y-4">
              {resolvedApprovals.map((approval) => {
                const user = getUserInitials(approval.user_id);
                return (
                  <div
                    key={approval.id}
                    className="flex items-center justify-between py-4 border-b border-[#e5e5e5]"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 ${user.color} text-white flex items-center justify-center text-sm font-semibold`}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <div className="text-[#000000] font-medium">{user.name}</div>
                        <div className="text-sm text-[#999999]">
                          {approval.type} — {new Date(approval.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 text-sm text-[#999999] uppercase tracking-wide">
                        {approval.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingApprovals.length === 0 && resolvedApprovals.length === 0 && (
          <div className="py-16 text-center text-[#999999]">
            No approval requests yet
          </div>
        )}
      </div>
    </div>
  );
};
