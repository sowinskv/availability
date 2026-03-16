import React, { useState, useRef } from 'react';
import { Mic, StopCircle, Upload } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
        {isRecording ? (
          <span className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            recording: {formatTime(recordingTime)}
          </span>
        ) : (
          'click the microphone to start recording'
        )}
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-8 rounded-full transition-all ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
            : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'
        } text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
      >
        {isRecording ? (
          <StopCircle size={40} />
        ) : (
          <Mic size={40} />
        )}
      </button>

      <p className="text-xs text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark text-center max-w-md leading-relaxed">
        speak your availability information naturally. include dates, type (vacation, sick leave), and any other details.
      </p>
    </div>
  );
};
