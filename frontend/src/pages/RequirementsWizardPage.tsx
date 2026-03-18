import React from 'react';
import { WizardProvider, useWizardContext } from '../contexts/WizardContext';
import { WizardContainer } from '../components/wizard/WizardContainer';
import { ProjectStep } from '../components/wizard/ProjectStep';
import { FunctionalReqStep } from '../components/wizard/FunctionalReqStep';
import { NonFunctionalReqStep } from '../components/wizard/NonFunctionalReqStep';
import { TechnicalReqStep } from '../components/wizard/TechnicalReqStep';

const WizardContent: React.FC = () => {
  const { state } = useWizardContext();

  return (
    <WizardContainer>
      {state.currentStep === 1 && <ProjectStep />}
      {state.currentStep === 2 && <FunctionalReqStep />}
      {state.currentStep === 3 && <NonFunctionalReqStep />}
      {state.currentStep === 4 && <TechnicalReqStep />}
    </WizardContainer>
  );
};

export const RequirementsWizardPage: React.FC = () => {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
};
