import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { ArrowLeftIcon, SearchIcon, AlertCircleIcon } from 'lucide-react';
import { searchCustomerById } from '../service/api/customer';
import { createQueue } from '../service/api/queue';
import { sendFcmToken } from '../service/api/customer';
import { getToken } from 'firebase/messaging';
import { messaging } from '../firebase'; // Adjust this path if needed

const CustomerIdentification: React.FC = () => {
  const {
    customerType,
    updateCustomerData,
    setCustomerData,
    setCurrentStep,
    setCustomerId,
    queueTypeId,
    branchId,
    setQueueNumber,
    setEstimatedWaitTime
  } = useQueue();
  const [icPassport, setIcPassport] = useState('');
  const [thirdPartyIcPassport, setThirdPartyIcPassport] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
/*  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);
    try {
      const customerData = await searchCustomerById(icPassport);
      setCustomerId(customerData.customerId);
      const queueResponse = await createQueue({
        branchId,
        customerId: customerData.customerId,
        queueTypeId: queueTypeId!
      });
      setQueueNumber(queueResponse.queueNumber);
      setEstimatedWaitTime(queueResponse.estimatedWaitTime);
      setCustomerData({
        name: customerData.fullName,
        dob: customerData.dateOfBirth,
        icPassport: customerData.idNumber,
        address: customerData.address,
        city: customerData.city,
        postcode: customerData.postcode,
        state: customerData.state,
        country: customerData.country,
        mobile: customerData.phoneNumber,
        residentStatus: customerData.residentStatus as any,
        orderPurpose: customerData.orderPurpose,
        idFrontImage: customerData.idFrontImage,
        idBackImage: customerData.idBackImage,
        passportFrontImage: customerData.passportFrontImage,
        nationality: customerData.nationality,
        occupation: customerData.occupation,
        natureOfBusiness: customerData.natureOfBusiness,
        ...(customerType === 'thirdParty' ? {
          thirdPartyIcPassport
        } : {})
      });
      setCurrentStep(4);
    } catch (err) {
      setCustomerId(null);
      updateCustomerData({
        icPassport,
        ...(customerType === 'thirdParty' ? {
          thirdPartyIcPassport
        } : {})
      });
      setError('Customer not found. Please fill in your details in the next step.');
      setTimeout(() => {
        setCurrentStep(3);
      }, 2000);
    } finally {
      setIsSearching(false);
    }
  };*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);

    try {
      const customerData = await searchCustomerById(icPassport);
      const customerId = customerData.customerId;
      setCustomerId(customerId);

      // Send FCM token to backend
      try {
        const fcmToken = await getToken(messaging, {
          vapidKey: "BDnGebf7kUA4SLfjJC8bKZz-PRH7BgRhPwoab2Nt4XlZ7JpwxRFpvHvXvHSKcFy9E9ARcKcCT1wIb6Ik5X0Xxoo"
        });

        if (fcmToken) {
          await sendFcmToken(customerId, fcmToken);
          console.log("✅ FCM token sent to backend");
        } else {
          console.warn("⚠️ FCM token is null");
        }
      } catch (fcmError) {
        console.warn("❌ Failed to get/send FCM token:", fcmError);
      }

      // Then create queue
      const queueResponse = await createQueue({
        branchId,
        customerId,
        queueTypeId: queueTypeId!
      });
      setQueueNumber(queueResponse.queueNumber);
      setEstimatedWaitTime(queueResponse.estimatedWaitTime);

      // Update context data
      setCustomerData({
        name: customerData.fullName,
        dob: customerData.dateOfBirth,
        icPassport: customerData.idNumber,
        address: customerData.address,
        city: customerData.city,
        postcode: customerData.postcode,
        state: customerData.state,
        country: customerData.country,
        mobile: customerData.phoneNumber,
        residentStatus: customerData.residentStatus as any,
        orderPurpose: customerData.orderPurpose,
        idFrontImage: customerData.idFrontImage,
        idBackImage: customerData.idBackImage,
        passportFrontImage: customerData.passportFrontImage,
        nationality: customerData.nationality,
        occupation: customerData.occupation,
        natureOfBusiness: customerData.natureOfBusiness,
        ...(customerType === 'thirdParty' ? {
          thirdPartyIcPassport
        } : {})
      });

      setCurrentStep(4);

    } catch (err) {
      setCustomerId(null);
      updateCustomerData({
        icPassport,
        ...(customerType === 'thirdParty' ? {
          thirdPartyIcPassport
        } : {})
      });
      setError('Customer not found. Please fill in your details in the next step.');
      setTimeout(() => {
        setCurrentStep(3);
      }, 2000);
    } finally {
      setIsSearching(false);
    }
  };

  return <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Identification</h2>
      <p className="text-gray-600 mb-6">
        Please enter the required identification information.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="icPassport" className="block text-sm font-medium text-gray-700 mb-1">
            {customerType === 'self' ? 'Your IC/Passport Number' : 'Your IC/Passport Number (as customer)'}
          </label>
          <input type="text" id="icPassport" value={icPassport} onChange={e => setIcPassport(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter IC/Passport number" required />
        </div>
        {customerType === 'thirdParty' && <div>
            <label htmlFor="thirdPartyIcPassport" className="block text-sm font-medium text-gray-700 mb-1">
              Third Party IC/Passport Number
            </label>
            <input type="text" id="thirdPartyIcPassport" value={thirdPartyIcPassport} onChange={e => setThirdPartyIcPassport(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter third party IC/Passport number" required />
          </div>}
        {error && <div className="flex items-center p-4 text-amber-700 bg-amber-50 rounded-lg">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>}
        <div className="pt-4">
          <button type="submit" disabled={isSearching} className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex justify-center items-center ${isSearching ? 'opacity-70' : ''}`}>
            {isSearching ? <>
                <SearchIcon className="animate-spin h-5 w-5 mr-2" />
                Searching...
              </> : 'Search'}
          </button>
        </div>
      </form>
      <button onClick={() => setCurrentStep(1)} disabled={isSearching} className="mt-6 flex items-center text-blue-600 hover:text-blue-800">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back
      </button>
    </div>;
};
export default CustomerIdentification;
/*
import React, { useState } from 'react'
import { useQueue } from '../context/QueueContext'
import { ArrowLeftIcon, SearchIcon, AlertCircleIcon } from 'lucide-react'
import { searchCustomerById } from '../service/api/customer'
import { createQueue } from '../service/api/queue'
const CustomerIdentification: React.FC = () => {
  const {
    customerType,
    updateCustomerData,
    setCustomerData,
    setCurrentStep,
    setCustomerId,
    queueTypeId,
    branchId,
    setQueueNumber,
    setEstimatedWaitTime,
  } = useQueue()
  const [icPassport, setIcPassport] = useState('')
  const [thirdPartyIcPassport, setThirdPartyIcPassport] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setError(null)
    try {
      const customerData = await searchCustomerById(icPassport)
      setCustomerId(customerData.customerId)
      const queueResponse = await createQueue({
        branchId,
        customerId: customerData.customerId,
        queueTypeId: queueTypeId!,
      })
      setQueueNumber(queueResponse.queueNumber)
      setEstimatedWaitTime(queueResponse.estimatedWaitTime)
      setCustomerData({
        name: customerData.fullName,
        dob: customerData.dateOfBirth,
        icPassport: customerData.idNumber,
        address: customerData.address,
        city: customerData.city,
        postcode: customerData.postcode,
        state: customerData.state,
        country: customerData.country,
        mobile: customerData.phoneNumber,
        residentStatus: customerData.residentStatus as any,
        orderPurpose: customerData.orderPurpose,
        idFrontImage: customerData.idFrontImage,
        idBackImage: customerData.idBackImage,
        passportFrontImage: customerData.passportFrontImage,
        nationality: customerData.nationality,
        occupation: customerData.occupation,
        natureOfBusiness: customerData.natureOfBusiness,
        ...(customerType === 'thirdParty'
            ? {
              thirdPartyIcPassport,
            }
            : {}),
      })
      setCurrentStep(4)
    } catch (err) {
      setCustomerId(null)
      updateCustomerData({
        icPassport,
        ...(customerType === 'thirdParty'
            ? {
              thirdPartyIcPassport,
            }
            : {}),
      })
      setError(
          'Customer not found. Please fill in your details in the next step.',
      )
      setTimeout(() => {
        setCurrentStep(3)
      }, 2000)
    } finally {
      setIsSearching(false)
    }
  }
  return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Identification</h2>
        <p className="text-gray-600 mb-6">
          Please enter the required identification information.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
                htmlFor="icPassport"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
              {customerType === 'self'
                  ? 'Your IC/Passport Number'
                  : 'Your IC/Passport Number (as customer)'}
            </label>
            <input
                type="text"
                id="icPassport"
                value={icPassport}
                onChange={(e) => setIcPassport(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter IC/Passport number"
                required
            />
          </div>
          {customerType === 'thirdParty' && (
              <div>
                <label
                    htmlFor="thirdPartyIcPassport"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Third Party IC/Passport Number
                </label>
                <input
                    type="text"
                    id="thirdPartyIcPassport"
                    value={thirdPartyIcPassport}
                    onChange={(e) => setThirdPartyIcPassport(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter third party IC/Passport number"
                    required
                />
              </div>
          )}
          {error && (
              <div className="flex items-center p-4 text-amber-700 bg-amber-50 rounded-lg">
                <AlertCircleIcon className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
          )}
          <div className="pt-4">
            <button
                type="submit"
                disabled={isSearching}
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex justify-center items-center ${isSearching ? 'opacity-70' : ''}`}
            >
              {isSearching ? (
                  <>
                    <SearchIcon className="animate-spin h-5 w-5 mr-2" />
                    Searching...
                  </>
              ) : (
                  'Search'
              )}
            </button>
          </div>
        </form>
        <button
            onClick={() => setCurrentStep(1)}
            disabled={isSearching}
            className="mt-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>
  )
}
export default CustomerIdentification
*/
