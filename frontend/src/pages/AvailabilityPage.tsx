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
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Availability</h1>
        <p className="text-gray-600">Manage team availability using voice input or manual entry</p>
      </div>

      <div className="mb-8">
        <button
          onClick={() => setShowRecorder(!showRecorder)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Calendar size={20} />
          {showRecorder ? 'Hide Voice Recorder' : 'Record Availability'}
        </button>
      </div>

      {showRecorder && (
        <div className="mb-8">
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Availability Requests</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {availabilities?.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No availability records yet. Record your first availability using the button above.
            </div>
          ) : (
            availabilities?.map((availability) => (
              <div key={availability.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(availability.status)}`}>
                        {availability.status}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {getTypeLabel(availability.type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {format(new Date(availability.start_date), 'MMM d, yyyy')} - {format(new Date(availability.end_date), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {availability.hours_per_day}h/day
                      </span>
                    </div>

                    {availability.transcription_text && (
                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                        <span className="font-medium">Transcription:</span> {availability.transcription_text}
                        {availability.transcription_confidence && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({Math.round(availability.transcription_confidence * 100)}% confidence)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {availability.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => approveAvailability.mutate(availability.id)}
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => declineAvailability.mutate(availability.id)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Decline"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
