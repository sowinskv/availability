import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useRequirements } from '../hooks/useRequirements';
import { useAuth } from '../contexts/AuthContext';

export const RequirementsPage: React.FC = () => {
  const { user } = useAuth();
  const { requirements, isLoading, generateFromText, approveRequirement, deleteRequirement } = useRequirements();
  const [showForm, setShowForm] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(null);

  // Role-based permissions
  const canApprove = user?.role === 'ba' || user?.role === 'dev';
  const canDelete = (requirementAuthorId: string) => user?.id === requirementAuthorId;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    setIsGenerating(true);
    try {
      await generateFromText.mutateAsync({
        inputText,
        authorId: user.id,
      });
      setInputText('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to generate requirements:', error);
      alert('Failed to generate requirements. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (requirementId: string) => {
    try {
      await approveRequirement.mutateAsync(requirementId);
    } catch (error) {
      console.error('Failed to approve requirement:', error);
      alert('Failed to approve requirement. Please try again.');
    }
  };

  const handleDelete = async (requirementId: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) {
      return;
    }

    try {
      await deleteRequirement.mutateAsync(requirementId);
    } catch (error) {
      console.error('Failed to delete requirement:', error);
      alert('Failed to delete requirement. Please try again.');
    }
  };

  const getRequirementCounts = (req: any) => {
    const funcCount = req.functional_reqs?.length || 0;
    const nfCount = req.non_functional_reqs?.length || 0;
    const techCount = req.technical_reqs?.length || 0;
    return { funcCount, nfCount, techCount, total: funcCount + nfCount + techCount };
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
      <PageTransition delay={0}>
        <div className="mb-20">
          <h1 className="text-3xl font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-12">
            Requirements
          </h1>
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <div className="mb-10">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            {showForm ? 'Hide Form' : 'Generate with AI'}
          </button>
        </div>

        {showForm && (
          <div className="mb-16 max-w-2xl">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark mb-2">
                  Describe your feature
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g., User login with email and password..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-transparent border border-notion-border-light dark:border-notion-border-dark rounded text-notion-text-primary-light dark:text-notion-text-primary-dark focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </PageTransition>

      <PageTransition delay={200}>
        <div className="space-y-0">
          {requirements?.length === 0 ? (
            <div className="py-16 text-center text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
              No requirements yet
            </div>
          ) : (
            requirements?.map((requirement, index) => {
              const counts = getRequirementCounts(requirement);
              const isExpanded = expandedRequirement === requirement.id;

              return (
                <div
                  key={requirement.id}
                  className={`py-8 ${
                    index !== requirements.length - 1 ? 'border-b border-notion-border-light dark:border-notion-border-dark' : ''
                  }`}
                >
                  <div className="grid grid-cols-2 gap-8 mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-1">
                        {requirement.title}
                      </h3>
                      <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark capitalize">
                        {requirement.status}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
                        {counts.funcCount} functional, {counts.nfCount} non-functional, {counts.techCount} technical
                      </p>

                      {requirement.description && (
                        <p className="text-sm text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark italic">
                          "{requirement.description}"
                        </p>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setExpandedRequirement(isExpanded ? null : requirement.id)}
                          className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors underline"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                        {requirement.status === 'draft' && canApprove && (
                          <button
                            onClick={() => handleApprove(requirement.id)}
                            className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:text-notion-text-primary-light dark:hover:text-notion-text-primary-dark transition-colors underline"
                          >
                            Approve
                          </button>
                        )}
                        {canDelete(requirement.author_id) && (
                          <button
                            onClick={() => handleDelete(requirement.id)}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 space-y-6 pl-8 border-l-2 border-notion-border-light dark:border-notion-border-dark">
                      {requirement.functional_reqs && requirement.functional_reqs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-3">
                            Functional Requirements
                          </h4>
                          <div className="space-y-3">
                            {requirement.functional_reqs.map((req: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <p className="font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                                  {req.id}: {req.title}
                                </p>
                                <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark mt-1">
                                  {req.description}
                                </p>
                                {req.acceptance_criteria && req.acceptance_criteria.length > 0 && (
                                  <ul className="mt-2 ml-4 list-disc text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                                    {req.acceptance_criteria.map((criteria: string, cidx: number) => (
                                      <li key={cidx}>{criteria}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {requirement.non_functional_reqs && requirement.non_functional_reqs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-3">
                            Non-Functional Requirements
                          </h4>
                          <div className="space-y-3">
                            {requirement.non_functional_reqs.map((req: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <p className="font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                                  {req.id}: {req.title} ({req.category})
                                </p>
                                <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark mt-1">
                                  {req.description}
                                </p>
                                {req.metric && (
                                  <p className="text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark mt-1">
                                    Metric: {req.metric}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {requirement.technical_reqs && requirement.technical_reqs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark mb-3">
                            Technical Requirements
                          </h4>
                          <div className="space-y-3">
                            {requirement.technical_reqs.map((req: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <p className="font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
                                  {req.id}: {req.title} ({req.category})
                                </p>
                                <p className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark mt-1">
                                  {req.description}
                                </p>
                                {req.dependencies && req.dependencies.length > 0 && (
                                  <ul className="mt-2 ml-4 list-disc text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark">
                                    {req.dependencies.map((dep: string, didx: number) => (
                                      <li key={didx}>{dep}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </PageTransition>
    </div>
  );
};
