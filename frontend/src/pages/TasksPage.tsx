import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useRequirements } from '../hooks/useRequirements';
import { CheckSquare, Clock, User, Loader } from 'lucide-react';

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
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'backlog':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p0':
        return 'bg-red-100 text-red-800';
      case 'p1':
        return 'bg-orange-100 text-orange-800';
      case 'p2':
        return 'bg-yellow-100 text-yellow-800';
      case 'p3':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
        <p className="text-gray-600">Break down requirements into actionable tasks</p>
      </div>

      {requirements && requirements.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Tasks from Requirement</h3>
          <select
            value={selectedRequirement}
            onChange={(e) => setSelectedRequirement(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {decomposing ? (
              <>
                <Loader size={18} className="animate-spin" />
                Generating Tasks...
              </>
            ) : (
              'Generate Tasks'
            )}
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Tasks</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {tasks?.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No tasks yet. Generate tasks from an approved requirement above.
            </div>
          ) : (
            tasks?.map((task) => (
              <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckSquare size={20} className="text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      {task.estimated_hours && (
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {task.estimated_hours}h estimated
                        </span>
                      )}
                      {task.assigned_to && (
                        <span className="flex items-center gap-1">
                          <User size={16} />
                          Assigned
                        </span>
                      )}
                      {task.required_skills.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Skills:</span>
                          {task.required_skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {task.required_skills.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{task.required_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {task.acceptance_criteria && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                        <span className="font-medium">Acceptance Criteria:</span> {task.acceptance_criteria}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
