import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { PageTransition } from '../components/PageTransition';

export const ProjectsPage: React.FC = () => {
  const { projects, isLoading } = useProjects();
  const navigate = useNavigate();

  const getProjectTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      web_app: 'Web App',
      mobile_app: 'Mobile App',
      desktop: 'Desktop',
      api: 'API',
      other: 'Other',
    };
    return type ? labels[type] || type : 'Unknown';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planning: 'Planning',
      in_progress: 'In Progress',
      on_hold: 'On Hold',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">
              Planning
            </div>
            <h1 className="text-2xl font-normal text-[#000000]">Projects</h1>
          </div>
          <button
            onClick={() => navigate('/app/projects/wizard')}
            className="px-6 py-2 bg-[#000000] text-white text-sm uppercase tracking-wide hover:opacity-90 transition-opacity focus:outline-none"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-[#999999]">Loading projects...</div>
          </div>
        ) : projects?.length === 0 ? (
          <PageTransition>
            <div className="py-16 text-center">
              <div className="text-6xl font-light text-[#e5e5e5] mb-4">No Projects</div>
              <p className="text-[#999999] mb-8">Get started by creating your first project</p>
              <button
                onClick={() => navigate('/app/projects/wizard')}
                className="px-8 py-3 bg-[#000000] text-white text-sm uppercase tracking-wide hover:opacity-90 transition-opacity focus:outline-none"
              >
                Create Project
              </button>
            </div>
          </PageTransition>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects?.map((project, index) => (
              <PageTransition key={project.id} delay={index * 50}>
                <div
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                  className="p-6 border border-[#e5e5e5] hover:border-[#000000] cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium group-hover:text-[#000000] transition-colors">
                      {project.name}
                    </h3>
                    {project.client && (
                      <span className="text-xs text-[#666666] uppercase tracking-wide">
                        {project.client}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-[#999999] uppercase tracking-wide">
                      {getProjectTypeLabel(project.project_type)}
                    </span>
                    <span className="text-[#e5e5e5]">•</span>
                    <span className="text-xs text-[#999999] uppercase tracking-wide">
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-sm text-[#666666] mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
                    <div className="text-sm text-[#666666]">
                      {project.requirement_count} {project.requirement_count === 1 ? 'requirement' : 'requirements'}
                    </div>
                    <div className="text-xs text-[#999999]">
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </PageTransition>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
