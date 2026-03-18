import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

interface Availability {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  hours_per_day: number;
  status: string;
  type: string;
  transcription_text?: string;
  transcription_confidence?: number;
}

export const useAvailability = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: availabilities, isLoading, error } = useQuery({
    queryKey: ['availabilities', userId],
    queryFn: async () => {
      const params = userId ? { user_id: userId } : {};
      const response = await axios.get<Availability[]>(`${API_BASE}/availability`, { params });
      return response.data;
    },
  });

  const createAvailability = useMutation({
    mutationFn: async (data: { start_date: string; end_date: string; hours_per_day: number; type: string; user_id: string }) => {
      const { user_id, ...availabilityData } = data;
      const response = await axios.post(`${API_BASE}/availability`, availabilityData, {
        params: { user_id }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });

  const createFromVoice = useMutation({
    mutationFn: async ({ audioBlob, userId }: { audioBlob: Blob; userId: string }) => {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');
      formData.append('user_id', userId);

      const response = await axios.post(`${API_BASE}/availability/voice`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });

  const approveAvailability = useMutation({
    mutationFn: async (availabilityId: string) => {
      const response = await axios.patch(`${API_BASE}/availability/${availabilityId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });

  const declineAvailability = useMutation({
    mutationFn: async (availabilityId: string) => {
      const response = await axios.patch(`${API_BASE}/availability/${availabilityId}/decline`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });

  return {
    availabilities,
    isLoading,
    error,
    createAvailability,
    createFromVoice,
    approveAvailability,
    declineAvailability,
  };
};
