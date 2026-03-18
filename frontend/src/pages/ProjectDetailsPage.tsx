import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PageTransition } from '../components/PageTransition';

const API_BASE = 'http://localhost:8000/api';

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { useProject, deleteProject } = useProjects();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedRequirementId, setExpandedRequirementId] = useState<string | null>(null);

  // Fetch project requirements
  const { data: requirements, isLoading: requirementsLoading } = useQuery({
    queryKey: ['project-requirements', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await axios.get(`${API_BASE}/projects/${projectId}/requirements`);
      return response.data;
    },
    enabled: !!projectId,
  });

  const handleDelete = async () => {
    if (!projectId) return;

    if (window.confirm('Are you sure you want to delete this project? This will unlink all requirements from this project.')) {
      setIsDeleting(true);
      try {
        await deleteProject.mutateAsync(projectId);
        navigate('/app/projects');
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project');
        setIsDeleting(false);
      }
    }
  };

  if (projectLoading || requirementsLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-[#999999]">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-light text-[#e5e5e5] mb-4">Project Not Found</div>
          <button
            onClick={() => navigate('/app/projects')}
            className="px-6 py-2 text-sm text-[#666666] hover:text-[#000000] uppercase tracking-wide"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const getProjectTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      web_app: 'Web Application',
      mobile_app: 'Mobile Application',
      desktop: 'Desktop Application',
      api: 'API',
      other: 'Other',
    };
    return type ? labels[type] || type : 'Unknown';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PLANNING: 'Planning',
      IN_PROGRESS: 'In Progress',
      ON_HOLD: 'On Hold',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
      CRITICAL: 'Critical',
    };
    return labels[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-blue-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      CRITICAL: 'text-red-600',
    };
    return colors[priority] || 'text-[#666666]';
  };

  return (
    <div className="h-full bg-white overflow-auto">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={() => navigate('/app/projects')}
              className="text-xs text-[#999999] hover:text-[#000000] uppercase tracking-wide mb-3 transition-colors"
            >
              ← Back to Projects
            </button>
            <h1 className="text-2xl font-normal text-[#000000] mb-2">{project.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#999999] uppercase tracking-wide">
                {getProjectTypeLabel(project.project_type)}
              </span>
              <span className="text-[#e5e5e5]">•</span>
              <span className="text-[#999999] uppercase tracking-wide">
                {getStatusLabel(project.status)}
              </span>
              <span className="text-[#e5e5e5]">•</span>
              <span className={`uppercase tracking-wide ${getPriorityColor(project.priority)}`}>
                {getPriorityLabel(project.priority)} Priority
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/app/projects/${projectId}/edit`)}
              className="px-6 py-2 border border-[#e5e5e5] text-[#666666] text-sm hover:text-[#000000] hover:border-[#000000] uppercase tracking-wide transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2 border border-red-200 text-red-600 text-sm hover:bg-red-50 uppercase tracking-wide transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8 max-w-5xl">
        {/* Project Info */}
        <PageTransition>
          <div className="mb-12">
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
              Project Information
            </div>
            <div className="grid grid-cols-2 gap-6">
              {project.description && (
                <div className="col-span-2">
                  <div className="text-xs text-[#999999] uppercase tracking-wide mb-2">Description</div>
                  <div className="text-sm text-[#666666]">{project.description}</div>
                </div>
              )}
              {project.client && (
                <div>
                  <div className="text-xs text-[#999999] uppercase tracking-wide mb-2">Client</div>
                  <div className="text-sm text-[#000000]">{project.client}</div>
                </div>
              )}
              {project.deadline && (
                <div>
                  <div className="text-xs text-[#999999] uppercase tracking-wide mb-2">Deadline</div>
                  <div className="text-sm text-[#000000]">
                    {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs text-[#999999] uppercase tracking-wide mb-2">Created</div>
                <div className="text-sm text-[#666666]">
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#999999] uppercase tracking-wide mb-2">Last Updated</div>
                <div className="text-sm text-[#666666]">
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </PageTransition>

        {/* Requirements */}
        <PageTransition delay={100}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">
                Requirements ({requirements?.length || 0})
              </div>
              <button
                onClick={() => navigate('/app/projects/wizard')}
                className="px-4 py-2 text-xs text-[#666666] hover:text-[#000000] uppercase tracking-wide transition-colors"
              >
                + Add Requirements
              </button>
            </div>

            {!requirements || requirements.length === 0 ? (
              <div className="py-16 text-center border border-[#e5e5e5]">
                <div className="text-[#999999] mb-4">No requirements yet</div>
                <button
                  onClick={() => navigate('/app/projects/wizard')}
                  className="px-6 py-2 bg-[#000000] text-white text-sm uppercase tracking-wide hover:opacity-90"
                >
                  Add Requirements
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {requirements.map((req: any, index: number) => {
                  const isExpanded = expandedRequirementId === req.id;

                  return (
                    <PageTransition key={req.id} delay={200 + index * 50}>
                      <div className="border border-[#e5e5e5] hover:border-[#000000] transition-colors">
                        {/* Header - Always Visible */}
                        <div
                          className="p-6 cursor-pointer"
                          onClick={() => setExpandedRequirementId(isExpanded ? null : req.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-[#000000] mb-1">{req.title}</h3>
                              {req.description && (
                                <p className="text-sm text-[#666666] mb-3">{req.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[#999999] uppercase tracking-wide">
                                {req.status}
                              </span>
                              <span className="text-[#999999]">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </div>
                          </div>

                          {/* Requirements breakdown */}
                          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#e5e5e5]">
                            <div>
                              <div className="text-xs text-[#999999] uppercase tracking-wide mb-1">
                                Functional
                              </div>
                              <div className="text-sm text-[#000000] font-medium">
                                {Array.isArray(req.functional_reqs) ? req.functional_reqs.length : 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-[#999999] uppercase tracking-wide mb-1">
                                Non-Functional
                              </div>
                              <div className="text-sm text-[#000000] font-medium">
                                {Array.isArray(req.non_functional_reqs) ? req.non_functional_reqs.length : 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-[#999999] uppercase tracking-wide mb-1">
                                Technical
                              </div>
                              <div className="text-sm text-[#000000] font-medium">
                                {Array.isArray(req.technical_reqs) ? req.technical_reqs.length : 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-6 pb-6 space-y-8 border-t border-[#e5e5e5] pt-6">
                            {/* Functional Requirements */}
                            {Array.isArray(req.functional_reqs) && req.functional_reqs.length > 0 && (
                              <div>
                                <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                                  Functional Requirements
                                </div>
                                <div className="space-y-4">
                                  {req.functional_reqs.map((fr: any, idx: number) => (
                                    <div key={idx} className="pl-4 border-l-2 border-[#e5e5e5]">
                                      <div className="text-sm font-medium text-[#000000] mb-1">
                                        {idx + 1}. {fr.title}
                                      </div>
                                      <p className="text-sm text-[#666666] mb-2">{fr.description}</p>
                                      {fr.acceptance_criteria && fr.acceptance_criteria.length > 0 && (
                                        <div className="mt-2">
                                          <div className="text-xs text-[#999999] uppercase tracking-wide mb-1">
                                            Acceptance Criteria:
                                          </div>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-[#666666]">
                                            {fr.acceptance_criteria.map((criteria: string, cIdx: number) => (
                                              <li key={cIdx}>{criteria}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Non-Functional Requirements */}
                            {Array.isArray(req.non_functional_reqs) && req.non_functional_reqs.length > 0 && (
                              <div>
                                <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                                  Non-Functional Requirements
                                </div>
                                <div className="space-y-4">
                                  {req.non_functional_reqs.map((nfr: any, idx: number) => (
                                    <div key={idx} className="pl-4 border-l-2 border-[#e5e5e5]">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-[#999999] uppercase tracking-wide">
                                          {nfr.category}
                                        </span>
                                        <span className="text-[#e5e5e5]">•</span>
                                        <span className="text-sm font-medium text-[#000000]">
                                          NFR #{idx + 1}
                                        </span>
                                      </div>
                                      <p className="text-sm text-[#666666] mb-2">{nfr.description}</p>
                                      {nfr.metric && (
                                        <div className="mt-2">
                                          <div className="text-xs text-[#999999] uppercase tracking-wide mb-1">
                                            Metric:
                                          </div>
                                          <p className="text-sm text-[#666666]">{nfr.metric}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Technical Requirements */}
                            {Array.isArray(req.technical_reqs) && req.technical_reqs.length > 0 && (
                              <div>
                                <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                                  Technical Requirements
                                </div>
                                <div className="space-y-4">
                                  {req.technical_reqs.map((tr: any, idx: number) => (
                                    <div key={idx} className="pl-4 border-l-2 border-[#e5e5e5]">
                                      <div className="text-sm font-medium text-[#000000] mb-1">
                                        {idx + 1}. {tr.technology}
                                      </div>
                                      <p className="text-sm text-[#666666] mb-2">{tr.description}</p>
                                      {tr.dependencies && tr.dependencies.length > 0 && (
                                        <div className="mt-2">
                                          <div className="text-xs text-[#999999] uppercase tracking-wide mb-1">
                                            Dependencies:
                                          </div>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-[#666666]">
                                            {tr.dependencies.map((dep: string, dIdx: number) => (
                                              <li key={dIdx}>{dep}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </PageTransition>
                  );
                })}
              </div>
            )}
          </div>
        </PageTransition>
      </div>
    </div>
  );
};
