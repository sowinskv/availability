import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Card, CardHeader, CardContent } from '../components/Card';
import { useTasks } from '../hooks/useTasks';
import { useRequirements } from '../hooks/useRequirements';
import { CheckSquare, Clock, User, Loader, Sparkles } from 'lucide-react';

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
    <div className="p-12 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-2">
          tasks
        </h1>
        <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
          break down requirements into actionable tasks
        </p>
      </div>

      {requirements && requirements.length > 0 && (
        <div className="mb-8">
          <Card>
            <h3 className="text-lg font-semibold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-4">
              generate tasks from requirement
            </h3>
            <select
              value={selectedRequirement}
              onChange={(e) => setSelectedRequirement(e.target.value)}
              className="w-full px-4 py-2 bg-notion-bg-light dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-notion-text-primary-light dark:text-notion-text-primary-dark"
            >
              <option value="">select a requirement...</option>
              {requirements.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.title}
                </option>
              ))}
            </select>
            <div className="mt-4">
              <Button
                variant="primary"
                icon={decomposing ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
                onClick={handleDecompose}
                disabled={decomposing || !selectedRequirement}
              >
                {decomposing ? 'generating tasks...' : 'generate tasks'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card padding="none">
        <CardHeader
          title="all tasks"
          subtitle={`${tasks?.length || 0} total`}
        />
        <CardContent className="divide-y divide-notion-border-light dark:divide-notion-border-dark">
          {tasks?.length === 0 ? (
            <div className="py-12 text-center text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
              no tasks yet. generate tasks from an approved requirement above.
            </div>
          ) : (
            tasks?.map((task) => (
              <div
                key={task.id}
                className="py-4 hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark transition-colors px-1 -mx-1 rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <CheckSquare size={18} className="text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark flex-shrink-0" />
                      <h3 className="text-base font-semibold text-notion-text-primary-light dark:text-notion-text-primary-dark">
                        {task.title}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark mb-3 ml-7">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark ml-7 flex-wrap">
                      {task.estimated_hours && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={15} />
                          {task.estimated_hours}h estimated
                        </span>
                      )}
                      {task.assigned_to && (
                        <span className="flex items-center gap-1.5">
                          <User size={15} />
                          assigned
                        </span>
                      )}
                      {task.required_skills.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                            skills:
                          </span>
                          {task.required_skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {task.required_skills.length > 3 && (
                            <span className="text-xs text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                              +{task.required_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {task.acceptance_criteria && (
                      <div className="mt-3 p-3 bg-notion-hover-light dark:bg-notion-hover-dark rounded-md text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark ml-7">
                        <span className="font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                          acceptance criteria:
                        </span>{' '}
                        {task.acceptance_criteria}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
