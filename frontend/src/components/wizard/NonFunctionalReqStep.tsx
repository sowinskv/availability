import React from 'react';
import { useWizardContext } from '../../contexts/WizardContext';
import { FieldSuggestion } from './FieldSuggestion';

export const NonFunctionalReqStep: React.FC = () => {
  const {
    state,
    updateNFR,
    addNFR,
    removeNFR,
    requestSuggestion,
    clearSuggestion,
  } = useWizardContext();

  const nfrCategories = [
    'performance',
    'security',
    'scalability',
    'reliability',
    'usability',
    'maintainability',
    'compliance',
    'other',
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">
          Non-Functional Requirements
        </div>
        <p className="text-sm text-[#666666] mt-2">
          Define quality attributes and constraints like performance, security, and scalability.
        </p>
      </div>

      {state.nonFunctionalReqs.map((nfr, index) => {
        const suggestionKey = `nfr_${index}_metric`;
        const hasSuggestion = state.suggestions.has(suggestionKey);

        return (
          <div key={index} className="p-6 border border-[#e5e5e5] space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium text-[#000000]">NFR #{index + 1}</div>
              {state.nonFunctionalReqs.length > 1 && (
                <button
                  onClick={() => removeNFR(index)}
                  className="text-xs text-[#666666] hover:text-red-600 uppercase tracking-wide transition-colors focus:outline-none"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] text-[#999999] uppercase mb-2">
                Category *
              </label>
              <select
                value={nfr.category}
                onChange={(e) => updateNFR(index, 'category', e.target.value)}
                className="w-full px-0 py-2 border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none transition-colors capitalize"
              >
                {nfrCategories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#999999] uppercase mb-2">
                Description *
              </label>
              <textarea
                value={nfr.description}
                onChange={(e) => updateNFR(index, 'description', e.target.value)}
                required
                rows={3}
                className="w-full px-0 py-2 border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none resize-none transition-colors"
                placeholder="Describe the quality requirement"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-[#999999] uppercase">
                  Metric
                </label>
                <button
                  onClick={() =>
                    requestSuggestion.mutate({
                      fieldType: suggestionKey,
                      context: { category: nfr.category, description: nfr.description },
                    })
                  }
                  disabled={!nfr.category || !nfr.description || requestSuggestion.isPending}
                  className="text-xs text-[#666666] hover:text-[#000000] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
                >
                  ✨ Suggest with AI
                </button>
              </div>

              {hasSuggestion && (
                <FieldSuggestion
                  fieldKey={suggestionKey}
                  isLoading={false}
                  suggestion={state.suggestions.get(suggestionKey)}
                  onAccept={(value) => updateNFR(index, 'metric', value)}
                  onReject={() => clearSuggestion(suggestionKey)}
                />
              )}

              {requestSuggestion.isPending && (
                <FieldSuggestion
                  fieldKey={suggestionKey}
                  isLoading={true}
                  suggestion={null}
                  onAccept={() => {}}
                  onReject={() => {}}
                />
              )}

              <input
                type="text"
                value={nfr.metric || ''}
                onChange={(e) => updateNFR(index, 'metric', e.target.value)}
                className="w-full px-0 py-2 border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none transition-colors"
                placeholder="e.g., Response time < 200ms for 95th percentile"
              />
              <div className="text-xs text-[#999999] mt-1">Optional: How will you measure this?</div>
            </div>
          </div>
        );
      })}

      <button
        onClick={addNFR}
        className="text-sm text-[#666666] hover:text-[#000000] uppercase tracking-wide transition-colors focus:outline-none"
      >
        + Add Another Non-Functional Requirement
      </button>
    </div>
  );
};
