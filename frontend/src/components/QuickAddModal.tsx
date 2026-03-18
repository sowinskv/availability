import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  onSubmit: (data: {
    start_date: string;
    end_date: string;
    hours_per_day: number;
    type: string;
  }) => Promise<void>;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  date,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    endDate: date ? format(date, 'yyyy-MM-dd') : '',
    hoursPerDay: 8,
    type: 'vacation' as 'vacation' | 'sick' | 'partial' | 'available',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (date && isOpen) {
      setFormData({
        endDate: format(date, 'yyyy-MM-dd'),
        hoursPerDay: 8,
        type: 'vacation',
        reason: '',
      });
    }
  }, [date, isOpen]);

  if (!isOpen || !date) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        start_date: format(date, 'yyyy-MM-dd'),
        end_date: formData.endDate,
        hours_per_day: formData.hoursPerDay,
        type: formData.type,
      });
      onClose();
    } catch (error) {
      console.error('Failed to add availability:', error);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="bg-white border border-[#e5e5e5] max-w-2xl w-full mx-4 animate-slide-in">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#e5e5e5] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">
              QUICK ADD
            </div>
            <h2 className="text-xl font-normal text-[#000000]">
              Log Availability
            </h2>
            <p className="text-sm text-[#666666] mt-1">
              Starting {format(date, 'MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#000000] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                TYPE OF ABSENCE
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="partial">Partial Availability</option>
                <option value="available">Available</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                END DATE
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={format(date, 'yyyy-MM-dd')}
                required
                className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                HOURS PER DAY
              </label>
              <input
                type="number"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData({ ...formData, hoursPerDay: Number(e.target.value) })}
                min="0"
                max="24"
                step="0.5"
                required
                className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                REASON (OPTIONAL)
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Dentist appointment"
                className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] placeholder-[#cccccc] focus:outline-none focus:border-[#000000] transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-wide"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-[#666666] hover:text-[#000000] transition-colors text-sm uppercase tracking-wide"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
