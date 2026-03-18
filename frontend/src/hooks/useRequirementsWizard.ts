import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

// Form data types
export interface ProjectFormData {
  name: string;
  project_type: string;
  description?: string;
  client?: string;
  deadline?: string;
  priority?: string;
}

export interface FRFormData {
  title: string;
  description: string;
  acceptance_criteria: string[];
}

export interface NFRFormData {
  category: string;
  description: string;
  metric?: string;
}

export interface TRFormData {
  technology: string;
  description: string;
  dependencies: string[];
}

// Wizard state
interface WizardState {
  currentStep: 1 | 2 | 3 | 4;
  projectSelection: 'existing' | 'new';
  selectedProjectId?: string;
  newProject: ProjectFormData;
  functionalReqs: FRFormData[];
  nonFunctionalReqs: NFRFormData[];
  technicalReqs: TRFormData[];
  suggestions: Map<string, any>;
}

const initialState: WizardState = {
  currentStep: 1,
  projectSelection: 'new',
  newProject: {
    name: '',
    project_type: 'web_app',
    description: '',
    client: '',
    priority: 'medium',
  },
  functionalReqs: [{ title: '', description: '', acceptance_criteria: [] }],
  nonFunctionalReqs: [{ category: 'performance', description: '', metric: '' }],
  technicalReqs: [{ technology: '', description: '', dependencies: [] }],
  suggestions: new Map(),
};

export const useRequirementsWizard = () => {
  const [state, setState] = useState<WizardState>(initialState);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Navigation
  const nextStep = () => {
    if (state.currentStep < 4) {
      setState(s => ({ ...s, currentStep: (s.currentStep + 1) as any }));
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      setState(s => ({ ...s, currentStep: (s.currentStep - 1) as any }));
    }
  };

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    setState(s => ({ ...s, currentStep: step }));
  };

  // Project selection
  const setProjectSelection = (selection: 'existing' | 'new') => {
    setState(s => ({ ...s, projectSelection: selection }));
  };

  const setSelectedProjectId = (projectId: string) => {
    setState(s => ({ ...s, selectedProjectId: projectId }));
  };

  const updateNewProject = (field: keyof ProjectFormData, value: any) => {
    setState(s => ({
      ...s,
      newProject: { ...s.newProject, [field]: value },
    }));
  };

  // Functional Requirements
  const updateFR = (index: number, field: keyof FRFormData, value: any) => {
    setState(s => {
      const functionalReqs = [...s.functionalReqs];
      functionalReqs[index] = { ...functionalReqs[index], [field]: value };
      return { ...s, functionalReqs };
    });
  };

  const addFR = () => {
    setState(s => ({
      ...s,
      functionalReqs: [
        ...s.functionalReqs,
        { title: '', description: '', acceptance_criteria: [] },
      ],
    }));
  };

  const removeFR = (index: number) => {
    setState(s => ({
      ...s,
      functionalReqs: s.functionalReqs.filter((_, i) => i !== index),
    }));
  };

  // Non-Functional Requirements
  const updateNFR = (index: number, field: keyof NFRFormData, value: any) => {
    setState(s => {
      const nonFunctionalReqs = [...s.nonFunctionalReqs];
      nonFunctionalReqs[index] = { ...nonFunctionalReqs[index], [field]: value };
      return { ...s, nonFunctionalReqs };
    });
  };

  const addNFR = () => {
    setState(s => ({
      ...s,
      nonFunctionalReqs: [
        ...s.nonFunctionalReqs,
        { category: 'performance', description: '', metric: '' },
      ],
    }));
  };

  const removeNFR = (index: number) => {
    setState(s => ({
      ...s,
      nonFunctionalReqs: s.nonFunctionalReqs.filter((_, i) => i !== index),
    }));
  };

  // Technical Requirements
  const updateTR = (index: number, field: keyof TRFormData, value: any) => {
    setState(s => {
      const technicalReqs = [...s.technicalReqs];
      technicalReqs[index] = { ...technicalReqs[index], [field]: value };
      return { ...s, technicalReqs };
    });
  };

  const addTR = () => {
    setState(s => ({
      ...s,
      technicalReqs: [
        ...s.technicalReqs,
        { technology: '', description: '', dependencies: [] },
      ],
    }));
  };

  const removeTR = (index: number) => {
    setState(s => ({
      ...s,
      technicalReqs: s.technicalReqs.filter((_, i) => i !== index),
    }));
  };

  // Suggestions
  const requestSuggestion = useMutation({
    mutationFn: async ({ fieldType, context }: { fieldType: string; context: any }) => {
      const response = await axios.post(`${API_BASE}/requirements/suggest-field`, {
        field_type: fieldType,
        context,
      });
      return { fieldType, suggestion: response.data.suggestion };
    },
    onSuccess: (data) => {
      setState(s => {
        const suggestions = new Map(s.suggestions);
        suggestions.set(data.fieldType, data.suggestion);
        return { ...s, suggestions };
      });
    },
  });

  const clearSuggestion = (fieldKey: string) => {
    setState(s => {
      const suggestions = new Map(s.suggestions);
      suggestions.delete(fieldKey);
      return { ...s, suggestions };
    });
  };

  // Submit wizard
  const submitWizard = useMutation({
    mutationFn: async () => {
      console.log('Starting wizard submission...');
      console.log('Current state:', {
        projectSelection: state.projectSelection,
        selectedProjectId: state.selectedProjectId,
        newProject: state.newProject,
        functionalReqs: state.functionalReqs,
        nonFunctionalReqs: state.nonFunctionalReqs,
        technicalReqs: state.technicalReqs,
      });

      // First create project if new
      let projectId = state.selectedProjectId;

      if (state.projectSelection === 'new') {
        console.log('Creating new project...');
        try {
          const projectResponse = await axios.post(
            `${API_BASE}/api/projects/`,
            state.newProject
          );
          console.log('Project created:', projectResponse.data);
          projectId = projectResponse.data.id;
        } catch (error: any) {
          console.error('Failed to create project:', error.response?.data || error.message);
          throw new Error(`Failed to create project: ${error.response?.data?.detail || error.message}`);
        }
      }

      if (!projectId) {
        throw new Error('No project selected');
      }

      console.log('Creating requirements for project:', projectId);

      // Then create requirements
      try {
        const response = await axios.post(`${API_BASE}/requirements/wizard`, {
          project_id: projectId,
          functional_reqs: state.functionalReqs,
          non_functional_reqs: state.nonFunctionalReqs,
          technical_reqs: state.technicalReqs,
          author_id: '00000000-0000-0000-0000-000000000001', // TODO: Get from auth context
        });
        console.log('Requirements created:', response.data);
        return { projectId, requirement: response.data };
      } catch (error: any) {
        console.error('Failed to create requirements:', error.response?.data || error.message);
        throw new Error(`Failed to create requirements: ${error.response?.data?.detail || error.message}`);
      }
    },
    onSuccess: (data) => {
      console.log('Wizard submission successful!', data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      navigate('/app/projects');
    },
    onError: (error) => {
      console.error('Wizard submission failed:', error);
      alert(`Failed to submit: ${error.message}`);
    },
  });

  // Reset wizard
  const resetWizard = () => {
    setState(initialState);
  };

  // Validation
  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (state.projectSelection === 'existing') {
          return !!state.selectedProjectId;
        } else {
          return !!state.newProject.name && !!state.newProject.project_type;
        }
      case 2:
        return state.functionalReqs.some(fr => fr.title && fr.description);
      case 3:
        return state.nonFunctionalReqs.some(nfr => nfr.category && nfr.description);
      case 4:
        return state.technicalReqs.some(tr => tr.technology && tr.description);
      default:
        return true;
    }
  };

  return {
    state,
    nextStep,
    prevStep,
    goToStep,
    setProjectSelection,
    setSelectedProjectId,
    updateNewProject,
    updateFR,
    addFR,
    removeFR,
    updateNFR,
    addNFR,
    removeNFR,
    updateTR,
    addTR,
    removeTR,
    requestSuggestion,
    clearSuggestion,
    submitWizard,
    resetWizard,
    canProceedFromStep,
  };
};
