import React from 'react';
import { useWizardContext } from '../../contexts/WizardContext';
import { FieldSuggestion } from './FieldSuggestion';

export const TechnicalReqStep: React.FC = () => {
  const {
    state,
    updateTR,
    addTR,
    removeTR,
    requestSuggestion,
    clearSuggestion,
  } = useWizardContext();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">
          Technical Requirements
        </div>
        <p className="text-sm text-[#666666] mt-2">
          Specify technologies, frameworks, and technical constraints for the project.
        </p>
      </div>

      {state.technicalReqs.map((tr, index) => {
        const suggestionKey = `tr_${index}_dependencies`;
        const hasSuggestion = state.suggestions.has(suggestionKey);

        return (
          <div key={index} className="p-6 border border-[#e5e5e5] space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium text-[#000000]">TR #{index + 1}</div>
              {state.technicalReqs.length > 1 && (
                <button
                  onClick={() => removeTR(index)}
                  className="text-xs text-[#666666] hover:text-red-600 uppercase tracking-wide transition-colors focus:outline-none"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] text-[#999999] uppercase mb-2">
                Technology/Framework *
              </label>
              <input
                type="text"
                value={tr.technology}
                onChange={(e) => updateTR(index, 'technology', e.target.value)}
                required
                className="w-full px-0 py-2 border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none transition-colors"
                placeholder="e.g., React, Node.js, PostgreSQL"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#999999] uppercase mb-2">
                Description *
              </label>
              <textarea
                value={tr.description}
                onChange={(e) => updateTR(index, 'description', e.target.value)}
                required
                rows={3}
                className="w-full px-0 py-2 border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none resize-none transition-colors"
                placeholder="Why this technology is needed and how it will be used"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-[#999999] uppercase">
                  Dependencies
                </label>
                <button
                  onClick={() =>
                    requestSuggestion.mutate({
                      fieldType: suggestionKey,
                      context: { technology: tr.technology, description: tr.description },
                    })
                  }
                  disabled={!tr.technology || !tr.description || requestSuggestion.isPending}
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
                  onAccept={(value) => updateTR(index, 'dependencies', value)}
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
                value={tr.dependencies?.join('\n') || ''}
                onChange={(e) =>
                  updateTR(
                    index,
                    'dependencies',
                    e.target.value.split('\n').filter(line => line.trim())
                  )
                }
                rows={4}
                placeholder="One dependency per line&#10;e.g., React ^18.0.0&#10;Axios ^1.0.0"
                className="w-full px-0 py-2 border-b border-[#e5e5e5] focus:border-[#000000] focus:outline-none resize-none transition-colors"
              />
              <div className="text-xs text-[#999999] mt-1">Optional: List required libraries/tools</div>
            </div>
          </div>
        );
      })}

      <button
        onClick={addTR}
        className="text-sm text-[#666666] hover:text-[#000000] uppercase tracking-wide transition-colors focus:outline-none"
      >
        + Add Another Technical Requirement
      </button>
    </div>
  );
};
