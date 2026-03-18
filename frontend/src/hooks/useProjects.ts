import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export interface Project {
  id: string;
  name: string;
  project_type?: string;
  description?: string;
  client?: string;
  deadline?: string;
  status: string;
  priority: string;
  requirement_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  project_type: string;
  description?: string;
  client?: string;
  deadline?: string;
  priority?: string;
}

export interface ProjectUpdate {
  name?: string;
  project_type?: string;
  description?: string;
  client?: string;
  deadline?: string;
  priority?: string;
  status?: string;
}

interface UseProjectsFilters {
  status?: string;
  project_type?: string;
}

export const useProjects = (filters?: UseProjectsFilters) => {
  const queryClient = useQueryClient();

  // Query: list projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status_filter', filters.status);
      if (filters?.project_type) params.append('project_type', filters.project_type);

      const response = await axios.get(`${API_BASE}/projects/?${params.toString()}`);
      return response.data as Project[];
    },
  });

  // Query: get single project
  const useProject = (projectId?: string) => {
    return useQuery({
      queryKey: ['projects', projectId],
      queryFn: async () => {
        if (!projectId) throw new Error('Project ID is required');
        const response = await axios.get(`${API_BASE}/projects/${projectId}`);
        return response.data as Project;
      },
      enabled: !!projectId,
    });
  };

  // Mutation: create project
  const createProject = useMutation({
    mutationFn: async (data: ProjectCreate) => {
      const response = await axios.post(`${API_BASE}/projects/`, data);
      return response.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Mutation: update project
  const updateProject = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectUpdate }) => {
      const response = await axios.patch(`${API_BASE}/projects/${id}`, data);
      return response.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Mutation: delete project
  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_BASE}/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects,
    isLoading,
    error,
    useProject,
    createProject,
    updateProject,
    deleteProject,
  };
};
