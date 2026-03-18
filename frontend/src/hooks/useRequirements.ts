import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

interface Requirement {
  id: string;
  title: string;
  description?: string;
  author_id: string;
  status: string;
  source: string;
  functional_reqs: any;
  non_functional_reqs: any;
  technical_reqs: any;
}

export const useRequirements = (status?: string) => {
  const queryClient = useQueryClient();

  const { data: requirements, isLoading, error } = useQuery({
    queryKey: ['requirements', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await axios.get<Requirement[]>(`${API_BASE}/requirements`, { params });
      return response.data;
    },
  });

  const createRequirement = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const response = await axios.post(`${API_BASE}/requirements`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });

  const generateFromText = useMutation({
    mutationFn: async ({ inputText, authorId }: { inputText: string; authorId?: string }) => {
      const response = await axios.post(`${API_BASE}/requirements/generate`, {
        input_text: inputText,
      }, {
        params: authorId ? { author_id: authorId } : undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });

  const approveRequirement = useMutation({
    mutationFn: async (requirementId: string) => {
      const response = await axios.patch(`${API_BASE}/requirements/${requirementId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });

  const deleteRequirement = useMutation({
    mutationFn: async (requirementId: string) => {
      const response = await axios.delete(`${API_BASE}/requirements/${requirementId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });

  return {
    requirements,
    isLoading,
    error,
    createRequirement,
    generateFromText,
    approveRequirement,
    deleteRequirement,
  };
};
