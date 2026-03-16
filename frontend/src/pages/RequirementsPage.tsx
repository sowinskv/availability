import React, { useState } from 'react';
import { useRequirements } from '../hooks/useRequirements';
import { Loader } from 'lucide-react';

export const RequirementsPage: React.FC = () => {
  const { requirements, isLoading, generateFromText, approveRequirement } = useRequirements();
  const [inputText, setInputText] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setGenerating(true);
    try {
      await generateFromText.mutateAsync(inputText);
      setInputText('');
      setShowGenerator(false);
      alert('Requirements generated successfully!');
    } catch (error) {
      console.error('Failed to generate requirements:', error);
      alert('Failed to generate requirements. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'review':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'draft':
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
          Requirements
        </h2>

        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="mb-8 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm hover:opacity-90 transition-opacity"
        >
          {showGenerator ? 'Hide Generator' : 'Generate with AI'}
        </button>

        {showGenerator && (
          <div className="mb-12">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your feature..."
              className="w-full h-32 px-4 py-3 bg-white dark:bg-gray-900 border border-notion-border-light dark:border-notion-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none text-notion-text-primary-light dark:text-notion-text-primary-dark placeholder:text-notion-text-tertiary-light dark:placeholder:text-notion-text-tertiary-dark mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating || !inputText.trim()}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => setShowGenerator(false)}
                className="px-6 py-2 text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-0">
        {requirements?.length === 0 ? (
          <div className="py-16 text-center text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
            No requirements yet
          </div>
        ) : (
          requirements?.map((requirement, index) => (
            <div
              key={requirement.id}
              className={`py-8 grid grid-cols-2 gap-8 ${
                index !== requirements.length - 1 ? 'border-b border-notion-border-light dark:border-notion-border-dark' : ''
              }`}
            >
              <div>
                <h3 className="text-lg font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-1">
                  {requirement.title}
                </h3>
                <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                  {requirement.status}
                </p>
              </div>

              <div className="space-y-3">
                {requirement.description && (
                  <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
                    {requirement.description}
                  </p>
                )}

                <div className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark space-y-1">
                  {requirement.functional_reqs?.items?.length > 0 && (
                    <div>Functional: {requirement.functional_reqs.items.length} items</div>
                  )}
                  {requirement.non_functional_reqs?.items?.length > 0 && (
                    <div>Non-functional: {requirement.non_functional_reqs.items.length} items</div>
                  )}
                  {requirement.technical_reqs?.items?.length > 0 && (
                    <div>Technical: {requirement.technical_reqs.items.length} items</div>
                  )}
                </div>

                {requirement.status === 'draft' && (
                  <button
                    onClick={() => approveRequirement.mutate(requirement.id)}
                    className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
