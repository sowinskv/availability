import React, { useState } from 'react';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { Button } from '../components/Button';
import { Card, CardHeader, CardContent } from '../components/Card';
import { useAvailability } from '../hooks/useAvailability';
import { format } from 'date-fns';
import { Calendar, Check, X, Clock, Mic } from 'lucide-react';

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
    <div className="p-12 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-2">
          team availability
        </h1>
        <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
          manage team availability using voice input or manual entry
        </p>
      </div>

      <div className="mb-6">
        <Button
          variant="primary"
          icon={<Mic size={18} />}
          onClick={() => setShowRecorder(!showRecorder)}
        >
          {showRecorder ? 'hide voice recorder' : 'record availability'}
        </Button>
      </div>

      {showRecorder && (
        <div className="mb-8 animate-slide-in">
          <Card>
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          </Card>
        </div>
      )}

      <Card padding="none">
        <CardHeader
          title="availability requests"
          subtitle={`${availabilities?.length || 0} total`}
        />
        <CardContent className="divide-y divide-notion-border-light dark:divide-notion-border-dark">
          {availabilities?.length === 0 ? (
            <div className="py-12 text-center text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
              no availability records yet. record your first availability using the button above.
            </div>
          ) : (
            availabilities?.map((availability) => (
              <div
                key={availability.id}
                className="py-4 hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark transition-colors px-1 -mx-1 rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(availability.status)}`}
                      >
                        {availability.status}
                      </span>
                      <span className="text-sm font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                        {getTypeLabel(availability.type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark mb-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={15} />
                        {format(new Date(availability.start_date), 'MMM d, yyyy')} -{' '}
                        {format(new Date(availability.end_date), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} />
                        {availability.hours_per_day}h/day
                      </span>
                    </div>

                    {availability.transcription_text && (
                      <div className="mt-2 p-3 bg-notion-hover-light dark:bg-notion-hover-dark rounded-md text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
                        <span className="font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                          transcription:
                        </span>{' '}
                        {availability.transcription_text}
                        {availability.transcription_confidence && (
                          <span className="ml-2 text-xs text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                            ({Math.round(availability.transcription_confidence * 100)}% confidence)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {availability.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="success"
                        size="sm"
                        icon={<Check size={16} />}
                        onClick={() => approveAvailability.mutate(availability.id)}
                        title="approve"
                      >
                        approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<X size={16} />}
                        onClick={() => declineAvailability.mutate(availability.id)}
                        title="decline"
                      >
                        decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
