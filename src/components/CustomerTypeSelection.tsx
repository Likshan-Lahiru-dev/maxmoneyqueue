import React from 'react';
import { useQueue } from '../context/QueueContext';
import { UserIcon, UsersIcon, ArrowLeftIcon } from 'lucide-react';
const CustomerTypeSelection: React.FC = () => {
  const {
    setCustomerType,
    setCurrentStep
  } = useQueue();
  const handleTypeSelect = (type: 'self' | 'thirdParty') => {
    setCustomerType(type);
    setCurrentStep(2);
  };
  return <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Transaction Type
      </h2>
      <p className="text-gray-600 mb-6">
        Are you changing money for yourself or for someone else?
      </p>
      <div className="space-y-4">
        <button onClick={() => handleTypeSelect('self')} className="w-full bg-white border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition flex items-center">
          <UserIcon className="h-6 w-6 text-blue-600 mr-3" />
          <div className="text-left">
            <h3 className="text-lg font-medium">Changing for Self</h3>
          </div>
        </button>
        <button onClick={() => handleTypeSelect('thirdParty')} className="w-full bg-white border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition flex items-center">
          <UsersIcon className="h-6 w-6 text-blue-600 mr-3" />
          <div className="text-left">
            <h3 className="text-lg font-medium">
              Changing for Others (Third Party)
            </h3>
          </div>
        </button>
      </div>
      <button onClick={() => setCurrentStep(0)} className="mt-6 flex items-center text-blue-600 hover:text-blue-800">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back
      </button>
    </div>;
};
export default CustomerTypeSelection;