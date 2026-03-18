import React, { useState, useRef } from 'react';
import { Mic, StopCircle, Upload } from 'lucide-react';
import { useModal } from '../hooks/useModal';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const { showAlert, ModalComponent } = useModal();
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
      showAlert('Could not access microphone. Please check permissions.', 'Microphone Error');
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
    <>
      {ModalComponent}
      <div className="py-12">
      {/* Example text */}
      <div className="text-center mb-12">
        <p className="text-[#999999] italic text-sm">
          "I'll be working remotely on Tuesday from 9 to 1,
          <br />
          dentist in the afternoon."
        </p>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="group relative"
        >
          {isRecording ? (
            <div className="flex flex-col items-center gap-4">
              {/* Waveform indicator */}
              <div className="flex items-center gap-1 h-8">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-6 bg-blue-600 rounded-full animate-wave origin-center"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-4xl font-light text-[#000000] tabular-nums">
                {formatTime(recordingTime)}
              </div>

              {/* Stop button */}
              <div className="w-24 h-24 bg-blue-600 text-white flex items-center justify-center text-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors">
                stop
              </div>

              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mt-2">
                TAP TO STOP
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Rec button */}
              <div className="w-24 h-24 bg-[#000000] text-white flex items-center justify-center text-lg font-medium cursor-pointer hover:opacity-90 transition-opacity">
                rec
              </div>

              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mt-2">
                TAP TO RECORD
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
    </>
  );
};
