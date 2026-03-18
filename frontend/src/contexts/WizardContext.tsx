import React, { createContext, useContext } from 'react';
import { useRequirementsWizard } from '../hooks/useRequirementsWizard';

// Create context for wizard state
const WizardContext = createContext<ReturnType<typeof useRequirementsWizard> | null>(null);

export const useWizardContext = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizardContext must be used within WizardProvider');
  }
  return context;
};

interface WizardProviderProps {
  children: React.ReactNode;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const wizardState = useRequirementsWizard();

  return (
    <WizardContext.Provider value={wizardState}>
      {children}
    </WizardContext.Provider>
  );
};
