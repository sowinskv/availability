import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Card, CardHeader, CardContent } from '../components/Card';
import { useRequirements } from '../hooks/useRequirements';
import { FileText, Sparkles, Check, Loader } from 'lucide-react';

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
    <div className="p-12 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-2">
          requirements
        </h1>
        <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
          generate structured requirements from natural language
        </p>
      </div>

      <div className="mb-6">
        <Button
          variant="primary"
          icon={<Sparkles size={18} />}
          onClick={() => setShowGenerator(!showGenerator)}
        >
          {showGenerator ? 'hide ai generator' : 'generate with ai'}
        </Button>
      </div>

      {showGenerator && (
        <div className="mb-8 animate-slide-in">
          <Card>
            <h3 className="text-lg font-semibold text-notion-text-primary-light dark:text-notion-text-primary-dark mb-4">
              generate requirements
            </h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="describe your feature in natural language... e.g., 'we need a user authentication system with oauth and 2fa support. it should be secure and fast.'"
              className="w-full h-32 px-4 py-3 bg-notion-bg-light dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-notion-text-primary-light dark:text-notion-text-primary-dark placeholder:text-notion-text-tertiary-light dark:placeholder:text-notion-text-tertiary-dark"
            />
            <div className="mt-4 flex gap-3">
              <Button
                variant="primary"
                icon={generating ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
                onClick={handleGenerate}
                disabled={generating || !inputText.trim()}
              >
                {generating ? 'generating...' : 'generate requirements'}
              </Button>
              <Button variant="secondary" onClick={() => setShowGenerator(false)}>
                cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card padding="none">
        <CardHeader
          title="all requirements"
          subtitle={`${requirements?.length || 0} total`}
        />
        <CardContent className="divide-y divide-notion-border-light dark:divide-notion-border-dark">
          {requirements?.length === 0 ? (
            <div className="py-12 text-center text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
              no requirements yet. generate your first one using ai above.
            </div>
          ) : (
            requirements?.map((requirement) => (
              <div
                key={requirement.id}
                className="py-4 hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark transition-colors px-1 -mx-1 rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={18} className="text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark" />
                      <h3 className="text-base font-semibold text-notion-text-primary-light dark:text-notion-text-primary-dark">
                        {requirement.title}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(requirement.status)}`}>
                        {requirement.status}
                      </span>
                    </div>

                    {requirement.description && (
                      <p className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark mb-3 ml-7">
                        {requirement.description}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-3 ml-7">
                      {requirement.functional_reqs?.items?.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                            functional:
                          </span>
                          <span className="ml-2 text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
                            {requirement.functional_reqs.items.length} items
                          </span>
                        </div>
                      )}
                      {requirement.non_functional_reqs?.items?.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                            non-functional:
                          </span>
                          <span className="ml-2 text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
                            {requirement.non_functional_reqs.items.length} items
                          </span>
                        </div>
                      )}
                      {requirement.technical_reqs?.items?.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                            technical:
                          </span>
                          <span className="ml-2 text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
                            {requirement.technical_reqs.items.length} items
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {requirement.status === 'draft' && (
                    <Button
                      variant="success"
                      size="sm"
                      icon={<Check size={16} />}
                      onClick={() => approveRequirement.mutate(requirement.id)}
                      title="approve"
                    >
                      approve
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
