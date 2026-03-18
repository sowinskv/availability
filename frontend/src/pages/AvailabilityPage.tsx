import React, { useState } from 'react';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useAvailability } from '../hooks/useAvailability';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../hooks/useModal';

export const AvailabilityPage: React.FC = () => {
  const { createFromVoice, createAvailability } = useAvailability();
  const { user } = useAuth();
  const { showAlert, ModalComponent } = useModal();
  const [activeTab, setActiveTab] = useState<'voice' | 'manual'>('voice');
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    hoursPerDay: '9:00 - 13:00',
    type: 'vacation' as 'vacation' | 'sick' | 'partial' | 'available',
    reason: '',
  });

  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!user?.id) {
      showAlert('You must be logged in to record availability.', 'Authentication Required');
      return;
    }

    try {
      await createFromVoice.mutateAsync({ audioBlob, userId: user.id });
      showAlert('Availability recorded successfully!', 'Success');
    } catch (error) {
      console.error('Failed to submit availability:', error);
      showAlert('Failed to submit availability. Please try again.', 'Error');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      showAlert('You must be logged in to submit availability.', 'Authentication Required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      showAlert('Please fill in all required fields.', 'Validation Error');
      return;
    }

    try {
      await createAvailability.mutateAsync({
        start_date: formData.startDate,
        end_date: formData.endDate,
        hours_per_day: 8, // Default to 8 hours, you can parse hoursPerDay if needed
        type: formData.type,
        user_id: user.id,
      });

      // Reset form
      setFormData({
        startDate: '',
        endDate: '',
        hoursPerDay: '9:00 - 13:00',
        type: 'vacation',
        reason: '',
      });

      showAlert('Entry sent for approval!', 'Success');
    } catch (error) {
      console.error('Failed to submit availability:', error);
      showAlert('Failed to submit availability. Please try again.', 'Error');
    }
  };

  return (
    <>
      {ModalComponent}
      <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">OUR TEAM</div>
            <h1 className="text-2xl font-normal text-[#000000]">My Availability</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-12">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-4 text-sm font-medium uppercase tracking-wide relative focus:outline-none ${
              activeTab === 'voice'
                ? 'text-[#000000] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#000000]'
                : 'text-[#999999] hover:text-[#666666]'
            } transition-colors`}
          >
            Voice Input
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-4 text-sm font-medium uppercase tracking-wide relative focus:outline-none ${
              activeTab === 'manual'
                ? 'text-[#000000] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#000000]'
                : 'text-[#999999] hover:text-[#666666]'
            } transition-colors`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8 flex items-center justify-center min-h-[calc(100vh-200px)] relative overflow-hidden">
        <div
          className={`max-w-2xl mx-auto w-full transition-all duration-300 ${
            activeTab === 'voice'
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-[-20px] absolute pointer-events-none'
          }`}
        >
          <div className="mb-6 text-center">
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
              RECORD YOUR MESSAGE — MAX 2 MIN
            </div>
          </div>
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        </div>

        <div
          className={`max-w-2xl mx-auto w-full transition-all duration-300 ${
            activeTab === 'manual'
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-[20px] absolute pointer-events-none'
          }`}
        >
          <div className="mb-6">
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
              ENTER AVAILABILITY DETAILS
            </div>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                  TYPE OF ABSENCE
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none cursor-pointer"
                >
                  <option value="vacation">Remote work</option>
                  <option value="sick">Sick Leave</option>
                  <option value="partial">Partial Availability</option>
                  <option value="available">Available</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                    FROM
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                    TO
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                  HOURS (IF PARTIAL DAY)
                </label>
                <input
                  type="text"
                  value={formData.hoursPerDay}
                  onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
                  placeholder="9:00 - 13:00"
                  className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] placeholder-[#cccccc] focus:outline-none focus:border-[#000000] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                  REASON
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Dentist appointment"
                  className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] text-[#000000] placeholder-[#cccccc] focus:outline-none focus:border-[#000000] transition-colors"
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wide focus:outline-none"
                >
                  SUBMIT FOR APPROVAL
                </button>
              </div>
            </form>
        </div>
      </div>

    </div>
    </>
  );
};
