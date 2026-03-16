import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

interface Task {
  id: string;
  requirement_id: string;
  title: string;
  description?: string;
  acceptance_criteria?: string;
  estimated_hours?: number;
  actual_hours?: number;
  status: string;
  priority: string;
  assigned_to?: string;
  dependencies: string[];
  required_skills: string[];
}

export const useTasks = (requirementId?: string, status?: string) => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', requirementId, status],
    queryFn: async () => {
      const params: any = {};
      if (requirementId) params.requirement_id = requirementId;
      if (status) params.status = status;
      const response = await axios.get<Task[]>(`${API_BASE}/tasks`, { params });
      return response.data;
    },
  });

  const createTask = useMutation({
    mutationFn: async (data: {
      requirement_id: string;
      title: string;
      description?: string;
      estimated_hours?: number;
    }) => {
      const response = await axios.post(`${API_BASE}/tasks`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const decomposeRequirements = useMutation({
    mutationFn: async (requirementId: string) => {
      const response = await axios.post(`${API_BASE}/tasks/decompose/${requirementId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: any }) => {
      const response = await axios.patch(`${API_BASE}/tasks/${taskId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    decomposeRequirements,
    updateTask,
  };
};
