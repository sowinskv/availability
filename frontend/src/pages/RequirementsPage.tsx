import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useRequirements } from '../hooks/useRequirements';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../hooks/useModal';

export const RequirementsPage: React.FC = () => {
  const { user } = useAuth();
  const { requirements, isLoading, generateFromText, approveRequirement, deleteRequirement } = useRequirements();
  const { showAlert, showConfirm, ModalComponent } = useModal();
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
      showAlert('Failed to generate requirements. Please try again.', 'Error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (requirementId: string) => {
    try {
      await approveRequirement.mutateAsync(requirementId);
    } catch (error) {
      console.error('Failed to approve requirement:', error);
      showAlert('Failed to approve requirement. Please try again.', 'Error');
    }
  };

  const handleDelete = async (requirementId: string) => {
    const confirmed = await showConfirm(
      'Are you sure you want to delete this requirement?',
      'Confirm Delete'
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteRequirement.mutateAsync(requirementId);
    } catch (error) {
      console.error('Failed to delete requirement:', error);
      showAlert('Failed to delete requirement. Please try again.', 'Error');
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
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-[#999999]">loading...</div>
      </div>
    );
  }

  return (
    <>
      {ModalComponent}
      <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">AI PLANNING</div>
            <h1 className="text-2xl font-normal text-[#000000]">Requirements</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8">{/* Old padding removed */}

      <PageTransition delay={100}>
        <div className="mb-10">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-3 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wide"
          >
            {showForm ? 'Hide Form' : '+ Generate with AI'}
          </button>
        </div>

        {showForm && (
          <div className="mb-16 max-w-2xl">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">
                  Describe your feature
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g., User login with email and password..."
                  required
                  rows={6}
                  className="w-full px-0 py-3 bg-transparent border-b border-[#e5e5e5] text-[#000000] placeholder-[#cccccc] focus:outline-none focus:border-[#000000] transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-8 py-3 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-wide"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-3 text-[#666666] hover:text-[#000000] transition-colors text-sm uppercase tracking-wide"
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
            <div className="py-16 text-center text-[#999999]">
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
                    index !== requirements.length - 1 ? 'border-b border-[#e5e5e5]' : ''
                  }`}
                >
                  <div className="grid grid-cols-2 gap-8 mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-[#000000] mb-1">
                        {requirement.title}
                      </h3>
                      <p className="text-sm text-[#999999] capitalize">
                        {requirement.status}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-[#666666]">
                        {counts.funcCount} functional, {counts.nfCount} non-functional, {counts.techCount} technical
                      </p>

                      {requirement.description && (
                        <p className="text-sm text-[#999999] italic">
                          "{requirement.description}"
                        </p>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setExpandedRequirement(isExpanded ? null : requirement.id)}
                          className="text-sm text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                        {requirement.status === 'draft' && canApprove && (
                          <button
                            onClick={() => handleApprove(requirement.id)}
                            className="text-sm text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide"
                          >
                            Approve
                          </button>
                        )}
                        {canDelete(requirement.author_id) && (
                          <button
                            onClick={() => handleDelete(requirement.id)}
                            className="text-sm text-red-600 hover:text-red-700 transition-colors uppercase tracking-wide"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 space-y-6 pl-8 border-l-2 border-[#e5e5e5]">
                      {requirement.functional_reqs && requirement.functional_reqs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-[#000000] mb-3 uppercase tracking-wide">
                            Functional Requirements
                          </h4>
                          <div className="space-y-3">
                            {requirement.functional_reqs.map((req: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <p className="font-medium text-[#000000]">
                                  {req.id}: {req.title}
                                </p>
                                <p className="text-[#666666] mt-1">
                                  {req.description}
                                </p>
                                {req.acceptance_criteria && req.acceptance_criteria.length > 0 && (
                                  <ul className="mt-2 ml-4 list-disc text-[#999999]">
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
                          <h4 className="text-sm font-medium text-[#000000] mb-3 uppercase tracking-wide">
                            Non-Functional Requirements
                          </h4>
                          <div className="space-y-3">
                            {requirement.non_functional_reqs.map((req: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <p className="font-medium text-[#000000]">
                                  {req.id}: {req.title} ({req.category})
                                </p>
                                <p className="text-[#666666] mt-1">
                                  {req.description}
                                </p>
                                {req.metric && (
                                  <p className="text-[#999999] mt-1">
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
                          <h4 className="text-sm font-medium text-[#000000] mb-3 uppercase tracking-wide">
                            Technical Requirements
                          </h4>
                          <div className="space-y-3">
                            {requirement.technical_reqs.map((req: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <p className="font-medium text-[#000000]">
                                  {req.id}: {req.title} ({req.category})
                                </p>
                                <p className="text-[#666666] mt-1">
                                  {req.description}
                                </p>
                                {req.dependencies && req.dependencies.length > 0 && (
                                  <ul className="mt-2 ml-4 list-disc text-[#999999]">
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
    </div>
    </>
  );
};
