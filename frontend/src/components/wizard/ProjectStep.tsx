import React from 'react';
import { useWizardContext } from '../../contexts/WizardContext';
import { useProjects } from '../../hooks/useProjects';

export const ProjectStep: React.FC = () => {
  const { state, setProjectSelection, setSelectedProjectId, updateNewProject } = useWizardContext();
  const { projects } = useProjects();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
          Project Selection
        </div>

        {/* Radio buttons */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={state.projectSelection === 'existing'}
              onChange={() => setProjectSelection('existing')}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm">Select Existing Project</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={state.projectSelection === 'new'}
              onChange={() => setProjectSelection('new')}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm">Create New Project</span>
          </label>
        </div>
      </div>

      {/* Conditional content */}
      {state.projectSelection === 'existing' ? (
        <div>
          <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
            Select Project *
          </label>
          <select
            value={state.selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-4 py-3 border border-[#e5e5e5] text-sm focus:outline-none focus:border-[#000000] transition-colors"
          >
            <option value="">Choose a project...</option>
            {projects?.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={state.newProject.name}
              onChange={(e) => updateNewProject('name', e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none transition-colors"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
              Project Type *
            </label>
            <select
              value={state.newProject.project_type}
              onChange={(e) => updateNewProject('project_type', e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none transition-colors"
            >
              <option value="web_app">Web Application</option>
              <option value="mobile_app">Mobile Application</option>
              <option value="desktop">Desktop Application</option>
              <option value="api">API</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={state.newProject.description}
              onChange={(e) => updateNewProject('description', e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none resize-none transition-colors"
              placeholder="Project description"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
              Client
            </label>
            <input
              type="text"
              value={state.newProject.client}
              onChange={(e) => updateNewProject('client', e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none transition-colors"
              placeholder="Client name"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
              Priority
            </label>
            <select
              value={state.newProject.priority}
              onChange={(e) => updateNewProject('priority', e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none transition-colors"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
