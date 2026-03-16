import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useRequirements } from '../hooks/useRequirements';
import { Loader } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { requirements } = useRequirements('approved');
  const { tasks, isLoading, decomposeRequirements } = useTasks();
  const [selectedRequirement, setSelectedRequirement] = useState<string>('');
  const [decomposing, setDecomposing] = useState(false);

  const handleDecompose = async () => {
    if (!selectedRequirement) return;

    setDecomposing(true);
    try {
      await decomposeRequirements.mutateAsync(selectedRequirement);
      alert('Tasks generated successfully!');
      setSelectedRequirement('');
    } catch (error) {
      console.error('Failed to decompose requirements:', error);
      alert('Failed to generate tasks. Please try again.');
    } finally {
      setDecomposing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'review':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'backlog':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p0':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'p1':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'p2':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'p3':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">loading...</div>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="mb-16">
        <h2 className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark mb-12">
          Tasks
        </h2>

        {requirements && requirements.length > 0 && (
          <div className="mb-8">
            <select
              value={selectedRequirement}
              onChange={(e) => setSelectedRequirement(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-notion-border-light dark:border-notion-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-notion-text-primary-light dark:text-notion-text-primary-dark mb-4"
            >
              <option value="">Select a requirement...</option>
              {requirements.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleDecompose}
              disabled={decomposing || !selectedRequirement}
              className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {decomposing ? 'Generating...' : 'Generate Tasks'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-0">
        {tasks?.length === 0 ? (
          <div className="py-16 text-center text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
            No tasks yet
          </div>
        ) : (
          tasks?.map((task, index) => (
            <div
              key={task.id}
              className={`py-8 grid grid-cols-2 gap-8 ${
                index !== tasks.length - 1 ? 'border-b border-notion-border-light dark:border-notion-border-dark' : ''
              }`}
            >
              <div>
                <h3 className="text-lg font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-1">
                  {task.title}
                </h3>
                <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                  {task.status.replace('_', ' ')} • {task.priority.toUpperCase()}
                </p>
              </div>

              <div className="space-y-3">
                {task.description && (
                  <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
                    {task.description}
                  </p>
                )}

                <div className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark space-y-1">
                  {task.estimated_hours && <div>{task.estimated_hours}h estimated</div>}
                  {task.required_skills.length > 0 && (
                    <div>Skills: {task.required_skills.slice(0, 3).join(', ')}{task.required_skills.length > 3 ? ` +${task.required_skills.length - 3} more` : ''}</div>
                  )}
                </div>

                {task.acceptance_criteria && (
                  <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                    {task.acceptance_criteria}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
