import React, { useEffect, useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { ArrowRightIcon, FileTextIcon, UserIcon, GlobeIcon, FileIcon, LoaderIcon } from 'lucide-react';
import { getTiers, QueueType } from '../service/api/tier';
const TierSelection: React.FC = () => {
  const {
    setSelectedTier,
    setCurrentStep,
    setQueueTypeId
  } = useQueue();
  const [tiers, setTiers] = useState<QueueType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const tiersData = await getTiers();
        setTiers(tiersData);
      } catch (err) {
        setError('Failed to load tiers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTiers();
  }, []);
  const handleTierSelect = (tier: '1' | '2' | '3', queueTypeId: string) => {
    setSelectedTier(tier);
    setQueueTypeId(queueTypeId);
    setCurrentStep(1);
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
      </div>;
  }
  if (error) {
    return <div className="text-center p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 hover:text-blue-800">
          Try Again
        </button>
      </div>;
  }
  const getTierDetails = (tierName: string) => {
    switch (tierName) {
      case 'Basic Tier':
        return {
          colorClass: 'blue',
          tier: '1',
          amount: 'Below RM3,000',
          sortOrder: 1
        };
      case 'Standard Tier':
        return {
          colorClass: 'blue',
          tier: '2',
          amount: 'RM3,001 – RM10,000',
          sortOrder: 2
        };
      case 'Premium Tier':
        return {
          colorClass: 'blue',
          tier: '3',
          amount: 'Above RM10,000',
          sortOrder: 3
        };
      default:
        return {
          colorClass: 'blue',
          tier: '1',
          amount: 'Below RM3,000',
          sortOrder: 1
        };
    }
  };
  return <div className="w-full">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Select Transaction Tier
        </h2>
        <p className="text-gray-600 mb-8 text-base md:text-lg">
          Please select the appropriate tier based on your transaction amount.
          Different tiers require different levels of documentation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {tiers.sort((a, b) => {
          const aSortOrder = getTierDetails(a.queueName).sortOrder;
          const bSortOrder = getTierDetails(b.queueName).sortOrder;
          return aSortOrder - bSortOrder;
        }).map(tier => {
          const {
            colorClass,
            tier: tierNumber,
            amount
          } = getTierDetails(tier.queueName);
          return <button key={tier.queueTypeId} onClick={() => handleTierSelect(tierNumber as '1' | '2' | '3', tier.queueTypeId)} className="border-2 border-gray-200 p-4 md:p-6 rounded-lg hover:border-blue-500 transition-colors h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-block px-3 py-1 bg-${colorClass}-50 text-${colorClass}-600 rounded-full text-sm font-medium mb-2`}>
                        {tier.queueName}
                      </span>
                      <h3 className={`text-xl font-semibold text-${colorClass}-600`}>
                        Tier {tierNumber}
                      </h3>
                    </div>
                    <ArrowRightIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-left space-y-3">
                    <p className="text-lg font-medium text-gray-900">
                      Transaction Amount:{' '}
                      <span className={`text-${colorClass}-600`}>{amount}</span>
                    </p>
                    <div className="flex items-center text-gray-600">
                      <FileTextIcon className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{tier.description}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-sm text-gray-500">
                        Required Information:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li className="flex items-center">
                          <UserIcon className={`h-4 w-4 mr-2 text-${colorClass}-400`} />
                          {tierNumber === '1' ? 'Basic Personal Details' : tierNumber === '2' ? 'Extended Personal Details' : 'Complete Personal Profile'}
                        </li>
                        {tierNumber !== '1' && <li className="flex items-center">
                            <GlobeIcon className={`h-4 w-4 mr-2 text-${colorClass}-400`} />
                            {tierNumber === '2' ? 'Residence Information' : 'Full Address & Contact Details'}
                          </li>}
                        <li className="flex items-center">
                          <FileIcon className={`h-4 w-4 mr-2 text-${colorClass}-400`} />
                          {tierNumber === '1' ? 'IC/Passport Information' : tierNumber === '2' ? 'Contact & Purpose Details' : 'Business & Document Verification'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </button>;
        })}
        </div>
      </div>
    </div>;
};
export default TierSelection;