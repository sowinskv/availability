import React, { useState } from 'react';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { PageTransition } from '../components/PageTransition';
import { useAvailability } from '../hooks/useAvailability';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export const AvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const { availabilities, isLoading, createFromVoice, approveAvailability, declineAvailability } = useAvailability();
  const [showRecorder, setShowRecorder] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    hoursPerDay: '8',
    type: 'vacation' as 'vacation' | 'sick' | 'partial' | 'available',
  });

  // Role-based permissions
  const isApprover = user?.role === 'ba' || user?.role === 'manager';
  const isDeveloper = user?.role === 'dev';

  // Filter availabilities based on role
  const filteredAvailabilities = React.useMemo(() => {
    if (!availabilities) return [];

    // Developers only see their own entries
    if (isDeveloper) {
      return availabilities.filter(a => a.user_id === user?.id);
    }

    // BA/Manager/Marek see all entries
    return availabilities;
  }, [availabilities, isDeveloper, user?.id]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      await createFromVoice.mutateAsync(audioBlob);
      setShowRecorder(false);
      alert('Availability recorded successfully!');
    } catch (error) {
      console.error('Failed to submit availability:', error);
      alert('Failed to submit availability. Please try again.');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire up to API
    console.log('Manual submission:', formData);
    alert('Manual submission - API integration pending');
    setShowManualForm(false);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: 'Vacation',
      sick: 'Sick Leave',
      partial: 'Partial Availability',
      available: 'Available',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">loading...</div>
      </div>
    );
  }

  // Calculate summary for approvers
  const summary = React.useMemo(() => {
    if (!isApprover || !filteredAvailabilities) return null;

    const pending = filteredAvailabilities.filter(a => a.status === 'pending').length;
    const approved = filteredAvailabilities.filter(a => a.status === 'approved').length;
    const declined = filteredAvailabilities.filter(a => a.status === 'declined').length;

    return { pending, approved, declined, total: filteredAvailabilities.length };
  }, [isApprover, filteredAvailabilities]);

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <PageTransition delay={0}>
        <div className="mb-20">
          <h1 className="text-3xl font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-12">
            Availability
          </h1>

          {isApprover && summary && summary.total > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-8">
              <div className="px-4 py-3 border border-notion-border-light dark:border-notion-border-dark rounded">
                <div className="text-2xl font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                  {summary.total}
                </div>
                <div className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                  Total Entries
                </div>
              </div>
              <div className="px-4 py-3 border border-yellow-400 dark:border-yellow-600 rounded bg-yellow-50 dark:bg-yellow-900/20">
                <div className="text-2xl font-medium text-yellow-700 dark:text-yellow-400">
                  {summary.pending}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-500">
                  Pending Review
                </div>
              </div>
              <div className="px-4 py-3 border border-green-400 dark:border-green-600 rounded bg-green-50 dark:bg-green-900/20">
                <div className="text-2xl font-medium text-green-700 dark:text-green-400">
                  {summary.approved}
                </div>
                <div className="text-sm text-green-600 dark:text-green-500">
                  Approved
                </div>
              </div>
              <div className="px-4 py-3 border border-red-400 dark:border-red-600 rounded bg-red-50 dark:bg-red-900/20">
                <div className="text-2xl font-medium text-red-700 dark:text-red-400">
                  {summary.declined}
                </div>
                <div className="text-sm text-red-600 dark:text-red-500">
                  Declined
                </div>
              </div>
            </div>
          )}
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <div className="flex gap-3 mb-10">
          <button
            onClick={() => {
              setShowManualForm(!showManualForm);
              setShowRecorder(false);
            }}
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            {showManualForm ? 'Hide Form' : 'Add Manually'}
          </button>
          <button
            onClick={() => {
              setShowRecorder(!showRecorder);
              setShowManualForm(false);
            }}
            className="px-6 py-2 border border-black dark:border-white text-black dark:text-white rounded-full text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            {showRecorder ? 'Hide Recorder' : 'Voice Input'}
          </button>
        </div>

        {showManualForm && (
          <div className="mb-16 max-w-2xl">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-notion-border-light dark:border-notion-border-dark rounded text-notion-text-primary-light dark:text-notion-text-primary-dark focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-notion-border-light dark:border-notion-border-dark rounded text-notion-text-primary-light dark:text-notion-text-primary-dark focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-transparent border border-notion-border-light dark:border-notion-border-dark rounded text-notion-text-primary-light dark:text-notion-text-primary-dark focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none cursor-pointer"
                  >
                    <option value="vacation">Vacation</option>
                    <option value="sick">Sick Leave</option>
                    <option value="partial">Partial Availability</option>
                    <option value="available">Available</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark mb-2">
                    Hours per Day
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.hoursPerDay}
                    onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-notion-border-light dark:border-notion-border-dark rounded text-notion-text-primary-light dark:text-notion-text-primary-dark focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm hover:opacity-90 transition-opacity"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-6 py-2 text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showRecorder && (
          <div className="mb-16 max-w-2xl">
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        )}
      </PageTransition>

      <PageTransition delay={200}>
        <div className="space-y-0">
        {filteredAvailabilities.length === 0 ? (
          <div className="py-16 text-center text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
            {isDeveloper ? 'No availability records yet' : 'No team availability records yet'}
          </div>
        ) : (
          filteredAvailabilities.map((availability, index) => (
            <div
              key={availability.id}
              className={`py-8 grid grid-cols-2 gap-8 ${
                index !== filteredAvailabilities.length - 1 ? 'border-b border-notion-border-light dark:border-notion-border-dark' : ''
              }`}
            >
              <div>
                <h3 className="text-lg font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-1">
                  {getTypeLabel(availability.type)}
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark capitalize">
                    {availability.status}
                  </p>
                  {isApprover && (
                    <p className="text-xs text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                      User ID: {availability.user_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
                  {format(new Date(availability.start_date), 'MMM d, yyyy')} - {format(new Date(availability.end_date), 'MMM d, yyyy')}
                </p>

                <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                  {availability.hours_per_day}h per day
                </p>

                {availability.transcription_text && (
                  <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark italic">
                    "{availability.transcription_text}"
                  </p>
                )}

                {availability.status === 'pending' && isApprover && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => approveAvailability.mutate(availability.id)}
                      className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors underline"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => declineAvailability.mutate(availability.id)}
                      className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors underline"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        </div>
      </PageTransition>
    </div>
  );
};
