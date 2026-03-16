import React, { useState } from 'react';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useAvailability } from '../hooks/useAvailability';
import { format } from 'date-fns';
import { Calendar, Check, X, Clock } from 'lucide-react';

export const AvailabilityPage: React.FC = () => {
  const { availabilities, isLoading, createFromVoice, approveAvailability, declineAvailability } = useAvailability();
  const [showRecorder, setShowRecorder] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'declined':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
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

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="mb-16">
        <h2 className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark mb-12">
          Availability
        </h2>

        <button
          onClick={() => setShowRecorder(!showRecorder)}
          className="mb-8 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm hover:opacity-90 transition-opacity"
        >
          {showRecorder ? 'Hide Recorder' : 'Record Availability'}
        </button>

        {showRecorder && (
          <div className="mb-12">
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        )}
      </div>

      <div className="space-y-0">
        {availabilities?.length === 0 ? (
          <div className="py-16 text-center text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
            No availability records yet
          </div>
        ) : (
          availabilities?.map((availability, index) => (
            <div
              key={availability.id}
              className={`py-8 grid grid-cols-2 gap-8 ${
                index !== availabilities.length - 1 ? 'border-b border-notion-border-light dark:border-notion-border-dark' : ''
              }`}
            >
              <div>
                <h3 className="text-lg font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-1">
                  {getTypeLabel(availability.type)}
                </h3>
                <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                  {availability.status}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
                  {format(new Date(availability.start_date), 'MMM d, yyyy')} - {format(new Date(availability.end_date), 'MMM d, yyyy')}
                  <span className="text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark ml-2">
                    • {availability.hours_per_day}h/day
                  </span>
                </p>

                {availability.transcription_text && (
                  <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                    {availability.transcription_text}
                  </p>
                )}

                {availability.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => approveAvailability.mutate(availability.id)}
                      className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors"
                    >
                      Approve
                    </button>
                    <span className="text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">•</span>
                    <button
                      onClick={() => declineAvailability.mutate(availability.id)}
                      className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors"
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
    </div>
  );
};
