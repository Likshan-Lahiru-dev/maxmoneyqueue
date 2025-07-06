import React from 'react';
import { useQueue } from '../context/QueueContext';
import TierSelection from './TierSelection';
import CustomerTypeSelection from './CustomerTypeSelection';
import CustomerIdentification from './CustomerIdentification';
import CustomerForm from './CustomerForm';
import QueueDisplay from './QueueDisplay';
const StepFlow: React.FC = () => {
  const {
    currentStep
  } = useQueue();
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <TierSelection />;
      case 1:
        return <CustomerTypeSelection />;
      case 2:
        return <CustomerIdentification />;
      case 3:
        return <CustomerForm />;
      case 4:
        return <QueueDisplay />;
      default:
        return <TierSelection />;
    }
  };
  return <div className="bg-white rounded-lg shadow-md p-6">{renderStep()}</div>;
};
export default StepFlow;