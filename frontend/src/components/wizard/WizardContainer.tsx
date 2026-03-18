import React from 'react';
import { useWizardContext } from '../../contexts/WizardContext';

interface WizardContainerProps {
  children: React.ReactNode;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({ children }) => {
  const { state, nextStep, prevStep, submitWizard, canProceedFromStep } = useWizardContext();

  const handleNext = () => {
    if (state.currentStep === 4) {
      console.log('Submitting wizard...');
      submitWizard.mutate();
    } else {
      nextStep();
    }
  };

  const stepLabels = ['Project', 'Functional', 'Non-Functional', 'Technical'];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Error Display */}
      {submitWizard.isError && (
        <div className="bg-red-50 border-b border-red-200 px-12 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-sm text-red-800">
              <strong>Submission Error:</strong> {submitWizard.error instanceof Error ? submitWizard.error.message : 'An unknown error occurred'}
            </div>
            <button
              onClick={() => submitWizard.reset()}
              className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`flex-1 h-1 transition-colors ${
                  step <= state.currentStep ? 'bg-[#000000]' : 'bg-[#e5e5e5]'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">
                Step {state.currentStep} of 4
              </div>
              <div className="text-lg font-medium text-[#000000] mt-1">
                {stepLabels[state.currentStep - 1]} Requirements
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-12 py-8">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-[#e5e5e5] px-12 py-6">
        <div className="max-w-3xl mx-auto flex justify-between">
          <button
            onClick={prevStep}
            disabled={state.currentStep === 1}
            className="px-6 py-2 text-sm text-[#666666] hover:text-[#000000] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wide transition-colors focus:outline-none"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceedFromStep(state.currentStep) || submitWizard.isPending}
            className="px-8 py-3 bg-[#000000] text-white text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide transition-opacity focus:outline-none"
          >
            {submitWizard.isPending ? (
              'Submitting...'
            ) : state.currentStep === 4 ? (
              'Submit'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
