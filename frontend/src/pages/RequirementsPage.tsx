import React, { useState } from 'react';
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
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Requirements</h1>
        <p className="text-gray-600">Generate structured requirements from natural language</p>
      </div>

      <div className="mb-8">
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
        >
          <Sparkles size={20} />
          {showGenerator ? 'Hide AI Generator' : 'Generate with AI'}
        </button>
      </div>

      {showGenerator && (
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Requirements</h3>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your feature in natural language... e.g., 'We need a user authentication system with OAuth and 2FA support. It should be secure and fast.'"
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating || !inputText.trim()}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Requirements
                </>
              )}
            </button>
            <button
              onClick={() => setShowGenerator(false)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Requirements</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {requirements?.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No requirements yet. Generate your first one using AI above.
            </div>
          ) : (
            requirements?.map((requirement) => (
              <div key={requirement.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={20} className="text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900">{requirement.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          requirement.status
                        )}`}
                      >
                        {requirement.status}
                      </span>
                    </div>

                    {requirement.description && (
                      <p className="text-sm text-gray-600 mb-3">{requirement.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      {requirement.functional_reqs?.items?.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Functional:</span>
                          <span className="ml-2 text-gray-600">
                            {requirement.functional_reqs.items.length} items
                          </span>
                        </div>
                      )}
                      {requirement.non_functional_reqs?.items?.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Non-Functional:</span>
                          <span className="ml-2 text-gray-600">
                            {requirement.non_functional_reqs.items.length} items
                          </span>
                        </div>
                      )}
                      {requirement.technical_reqs?.items?.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Technical:</span>
                          <span className="ml-2 text-gray-600">
                            {requirement.technical_reqs.items.length} items
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {requirement.status === 'draft' && (
                    <button
                      onClick={() => approveRequirement.mutate(requirement.id)}
                      className="ml-4 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
