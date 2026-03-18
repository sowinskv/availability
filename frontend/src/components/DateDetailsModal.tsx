import React from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface Availability {
  id: string;
  user_id: string;
  type: string;
  hours_per_day: number;
  status: string;
}

interface DateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  availabilities: Availability[];
  teamMembers?: Array<{ id: string; name: string; role: string }>;
}

export const DateDetailsModal: React.FC<DateDetailsModalProps> = ({
  isOpen,
  onClose,
  date,
  availabilities,
  teamMembers = [],
}) => {
  if (!isOpen || !date) return null;

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-600 text-white';
      case 'sick':
        return 'bg-red-600 text-white';
      case 'partial':
        return 'bg-orange-600 text-white';
      case 'available':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getUserName = (userId: string) => {
    const member = teamMembers.find(m => m.id === userId);
    return member?.name || 'Unknown User';
  };

  const getUserRole = (userId: string) => {
    const member = teamMembers.find(m => m.id === userId);
    return member?.role || 'Unknown';
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="bg-white border border-[#e5e5e5] max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col animate-slide-in">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#e5e5e5] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">
              DATE DETAILS
            </div>
            <h2 className="text-xl font-normal text-[#000000]">
              {format(date, 'MMMM d, yyyy')}
            </h2>
            <p className="text-sm text-[#666666] mt-1">
              {availabilities.length} {availabilities.length === 1 ? 'person' : 'people'} affected
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#000000] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          {availabilities.length === 0 ? (
            <div className="py-12 text-center text-[#999999]">
              No availabilities logged for this date
            </div>
          ) : (
            <div className="space-y-4">
              {availabilities.map((avail) => (
                <div
                  key={avail.id}
                  className="pb-4 border-b border-[#e5e5e5] last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#000000] text-white flex items-center justify-center text-xs font-semibold">
                        {getUserName(avail.user_id).split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#000000]">
                          {getUserName(avail.user_id)}
                        </div>
                        <div className="text-xs text-[#999999] uppercase">
                          {getUserRole(avail.user_id)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${getTypeBadgeColor(avail.type)}`}>
                      {avail.type}
                    </div>
                  </div>
                  <div className="ml-11 space-y-1">
                    <p className="text-sm text-[#666666]">
                      Hours: {avail.hours_per_day}h per day
                    </p>
                    <p className="text-xs text-[#999999] uppercase">
                      Status: {avail.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-[#e5e5e5] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wide"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
