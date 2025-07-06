import React, { useEffect, useState, createContext, useContext } from 'react';
type CustomerType = 'self' | 'thirdParty';
type Tier = '1' | '2' | '3';
export interface CustomerData {
  name?: string;
  dob?: string;
  icPassport?: string;
  address?: string;
  city?: string;
  postcode?: string;
  state?: string;
  country?: string;
  mobile?: string;
  residentStatus?: string;
  orderPurpose?: string;
  occupation?: string;
  natureOfBusiness?: string;
  nationality?: string;

  // 🖼️ Image preview URLs
  idFrontImage?: string | null;
  idBackImage?: string | null;
  passportFrontImage?: string | null;

  // 📁 Actual uploaded files
  idFrontImageFile?: File | null;
  idBackImageFile?: File | null;
  passportFrontImageFile?: File | null;
}
interface QueueContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedTier: Tier | null;
  setSelectedTier: (tier: Tier) => void;
  customerType: CustomerType | null;
  setCustomerType: (type: CustomerType) => void;
  customerData: CustomerData;
  setCustomerData: (data: CustomerData) => void;
  updateCustomerData: (data: Partial<CustomerData>) => void;
  queueNumber: string | null;
  setQueueNumber: (number: string) => void;
  currentServing: string;
  estimatedWaitTime: string;
  setEstimatedWaitTime: (time: string) => void;
  customerId: string | null;
  setCustomerId: (id: string | null) => void;
  branchId: string;
  setBranchId: (id: string) => void;
  queueTypeId: string | null;
  setQueueTypeId: (id: string) => void;
}
const QueueContext = createContext<QueueContextType | undefined>(undefined);
export const QueueProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [queueNumber, setQueueNumber] = useState<string | null>(null);
  const [currentServing] = useState('0001');
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<string>('0');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string>(() => {
    // Initialize from localStorage or set default
    return localStorage.getItem('branchId');
  });
  const [queueTypeId, setQueueTypeId] = useState<string | null>(null);
  // Update localStorage when branchId changes
  useEffect(() => {

  }, [branchId]);
  const updateCustomerData = (data: Partial<CustomerData>) => {
    setCustomerData(prev => ({
      ...prev,
      ...data
    }));
  };
  return <QueueContext.Provider value={{
    currentStep,
    setCurrentStep,
    selectedTier,
    setSelectedTier,
    customerType,
    setCustomerType,
    customerData,
    setCustomerData,
    updateCustomerData,
    queueNumber,
    setQueueNumber,
    currentServing,
    estimatedWaitTime,
    setEstimatedWaitTime,
    customerId,
    setCustomerId,
    branchId,
    setBranchId,
    queueTypeId,
    setQueueTypeId
  }}>
      {children}
    </QueueContext.Provider>;
};
export const useQueue = () => {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};