import React from 'react';
import { useWizardContext } from '../../contexts/WizardContext';
import { FieldSuggestion } from './FieldSuggestion';

export const FunctionalReqStep: React.FC = () => {
  const {
    state,
    updateFR,
    addFR,
    removeFR,
    requestSuggestion,
    clearSuggestion,
  } = useWizardContext();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">
          Functional Requirements
        </div>
        <p className="text-sm text-[#666666] mt-2">
          Define what the system should do. Each requirement should describe a specific feature or capability.
        </p>
      </div>

      {state.functionalReqs.map((fr, index) => {
        const suggestionKey = `fr_${index}_acceptance_criteria`;
        const hasSuggestion = state.suggestions.has(suggestionKey);

        return (
          <div key={index} className="p-6 border border-[#e5e5e5] space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium text-[#000000]">FR #{index + 1}</div>
              {state.functionalReqs.length > 1 && (
                <button
                  onClick={() => removeFR(index)}
                  className="text-xs text-[#666666] hover:text-red-600 uppercase tracking-wide transition-colors focus:outline-none"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] text-[#999999] uppercase mb-2">
                Title *
              </label>
              <input
                type="text"
                value={fr.title}
                onChange={(e) => updateFR(index, 'title', e.target.value)}
                required
                className="w-full px-0 py-2 border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none transition-colors"
                placeholder="e.g., User Authentication"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#999999] uppercase mb-2">
                Description *
              </label>
              <textarea
                value={fr.description}
                onChange={(e) => updateFR(index, 'description', e.target.value)}
                required
                rows={3}
                className="w-full px-0 py-2 border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none resize-none transition-colors"
                placeholder="Describe what the feature should do"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-[#999999] uppercase">
                  Acceptance Criteria
                </label>
                <button
                  onClick={() =>
                    requestSuggestion.mutate({
                      fieldType: suggestionKey,
                      context: { title: fr.title, description: fr.description },
                    })
                  }
                  disabled={!fr.title || !fr.description || requestSuggestion.isPending}
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
                  onAccept={(value) => updateFR(index, 'acceptance_criteria', value)}
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

              <textarea
                value={fr.acceptance_criteria?.join('\n') || ''}
                onChange={(e) =>
                  updateFR(
                    index,
                    'acceptance_criteria',
                    e.target.value.split('\n').filter(line => line.trim())
                  )
                }
                rows={4}
                placeholder="One criterion per line&#10;e.g., User can log in with email and password&#10;System displays error for invalid credentials"
                className="w-full px-0 py-2 border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none resize-none transition-colors"
              />
              <div className="text-xs text-[#999999] mt-1">One criterion per line</div>
            </div>
          </div>
        );
      })}

      <button
        onClick={addFR}
        className="text-sm text-[#666666] hover:text-[#000000] uppercase tracking-wide transition-colors focus:outline-none"
      >
        + Add Another Functional Requirement
      </button>
    </div>
  );
};
