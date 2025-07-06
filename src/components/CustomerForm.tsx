import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { ArrowLeftIcon, CheckIcon, UploadIcon, AlertCircleIcon } from 'lucide-react';
import {saveCustomer, sendFcmToken} from '../service/api/customer';
import { createQueue } from '../service/api/queue';
import {getToken} from "firebase/messaging";
import {messaging} from "../firebase.ts";



const CustomerForm: React.FC = () => {
    const {
        selectedTier,
        customerData,
        updateCustomerData,
        setCurrentStep,
        setQueueNumber,
        setCustomerId,
        queueTypeId,
        branchId,
        setEstimatedWaitTime
    } = useQueue();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'idFront' | 'idBack' | 'passportFront'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileUrl = URL.createObjectURL(file);
        switch (type) {
            case 'idFront':
                updateCustomerData({ idFrontImage: fileUrl, idFrontImageFile: file });
                break;
            case 'idBack':
                updateCustomerData({ idBackImage: fileUrl, idBackImageFile: file });
                break;
            case 'passportFront':
                updateCustomerData({ passportFrontImage: fileUrl, passportFrontImageFile: file });
                break;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('fullName', customerData.name || '');
            formData.append('dateOfBirth', customerData.dob || '');
            formData.append('idNumber', customerData.icPassport || '');
            formData.append('address', customerData.address || '');
            formData.append('city', customerData.city || '');
            formData.append('postcode', customerData.postcode || '');
            formData.append('state', customerData.state || '');
            formData.append('country', customerData.country || '');
            formData.append('phoneNumber', customerData.mobile || '');
            formData.append('residentStatus', customerData.residentStatus || '');
            formData.append('orderPurpose', customerData.orderPurpose || '');
            formData.append('occupation', customerData.occupation || '');
            formData.append('natureOfBusiness', customerData.natureOfBusiness || '');
            formData.append('nationality', customerData.nationality || '');

            if (customerData.idFrontImageFile) {
                formData.append('idFrontImage', customerData.idFrontImageFile);
            }
            if (customerData.idBackImageFile) {
                formData.append('idBackImage', customerData.idBackImageFile);
            }
            if (customerData.passportFrontImageFile) {
                formData.append('passportFrontImage', customerData.passportFrontImageFile);
            }

            const customerResponse = await saveCustomer(formData);
            setCustomerId(customerResponse.customerId);

            const queueResponse = await createQueue({
                branchId,
                customerId: customerResponse.customerId,
                queueTypeId: queueTypeId!
            });

            try {
                const fcmToken = await getToken(messaging, {
                    vapidKey: "BDnGebf7kUA4SLfjJC8bKZz-PRH7BgRhPwoab2Nt4XlZ7JpwxRFpvHvXvHSKcFy9E9ARcKcCT1wIb6Ik5X0Xxoo"
                });

                if (fcmToken) {
                    await sendFcmToken(customerResponse.customerId, fcmToken);
                    console.log("✅ FCM token sent to backend");
                } else {
                    console.warn("⚠️ FCM token is null");
                }
            } catch (fcmError) {
                console.warn("❌ Failed to get/send FCM token:", fcmError);
            }

            setQueueNumber(queueResponse.queueNumber);
            setEstimatedWaitTime(queueResponse.estimatedWaitTime);
            setCurrentStep(4);
        } catch (err) {
            console.error(err);
            setError('Failed to save customer data. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateCustomerData({ [name]: value });
    };

    const renderFileUpload = (
        label: string,
        previewUrl: string | undefined,
        type: 'idFront' | 'idBack' | 'passportFront'
    ) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {previewUrl ? (
                    <div className="relative">
                        <img src={previewUrl} alt={label} className="w-full h-40 object-cover rounded-lg" />
                        <button
                            type="button"
                            onClick={() =>
                                updateCustomerData({
                                    [`${type}Image`]: null,
                                    [`${type}ImageFile`]: null
                                } as any)
                            }
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                            <AlertCircleIcon className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-1 text-sm text-gray-500">Upload {label}</p>
                        <input
                            type="file"
                            className="hidden"
                            id={`${type}-upload`}
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, type)}
                        />
                        <label
                            htmlFor={`${type}-upload`}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        >
                            Select File
                        </label>
                    </div>
                )}
            </div>
        </div>
    );

    const renderTierFields = () => {
        const fields = [];

        // Tier 1
        fields.push(
            <div key="name">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                </label>
                <input type="text" id="name" name="name" value={customerData.name || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
            </div>
        );
        fields.push(
            <div key="dob">
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                </label>
                <input type="date" id="dob" name="dob" value={customerData.dob || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
            </div>
        );

        if (selectedTier === '2' || selectedTier === '3') {
            fields.push(
                <div key="nationality">
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                    </label>
                    <input type="text" id="nationality" name="nationality" value={customerData.nationality || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                </div>
            );
            fields.push(
                <div key="address">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                    </label>
                    <input type="text" id="address" name="address" value={customerData.address || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                </div>
            );
            fields.push(
                <div className="grid grid-cols-2 gap-4" key="cityPostcode">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                        </label>
                        <input type="text" id="city" name="city" value={customerData.city || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                            Postcode
                        </label>
                        <input type="text" id="postcode" name="postcode" value={customerData.postcode || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    </div>
                </div>
            );
            fields.push(
                <div className="grid grid-cols-2 gap-4" key="stateCountry">
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                            State
                        </label>
                        <input type="text" id="state" name="state" value={customerData.state || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                        </label>
                        <input type="text" id="country" name="country" value={customerData.country || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    </div>
                </div>
            );
            fields.push(
                <div key="mobile">
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number
                    </label>
                    <input type="tel" id="mobile" name="mobile" value={customerData.mobile || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                </div>
            );
            fields.push(
                <div key="orderPurpose">
                    <label htmlFor="orderPurpose" className="block text-sm font-medium text-gray-700 mb-1">
                        Order Purpose
                    </label>
                    <input type="text" id="orderPurpose" name="orderPurpose" value={customerData.orderPurpose || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                </div>
            );
            fields.push(
                <div key="residentStatus">
                    <label htmlFor="residentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                        Resident Status
                    </label>
                    <select id="residentStatus" name="residentStatus" value={customerData.residentStatus || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg bg-white" required>
                        <option value="">Select status</option>
                        <option value="RESIDENT">Resident</option>
                        <option value="NON_RESIDENT">Non-Resident</option>
                    </select>
                </div>
            );
        }

        if (selectedTier === '3') {
            fields.push(
                <div key="occupation">
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                        Occupation
                    </label>
                    <input type="text" id="occupation" name="occupation" value={customerData.occupation || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                </div>
            );
            fields.push(
                <div key="natureOfBusiness">
                    <label htmlFor="natureOfBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                        Nature of Business
                    </label>
                    <input type="text" id="natureOfBusiness" name="natureOfBusiness" value={customerData.natureOfBusiness || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                </div>
            );
            fields.push(
                <div className="space-y-6" key="uploads">
                    {renderFileUpload('ID Front', customerData.idFrontImage, 'idFront')}
                    {renderFileUpload('ID Back', customerData.idBackImage, 'idBack')}
                    {renderFileUpload('Passport Front', customerData.passportFrontImage, 'passportFront')}
                </div>
            );
        }

        return fields;
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Information</h2>
            <p className="text-gray-600 mb-6">Please fill in the required information for your transaction.</p>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600">
                    <AlertCircleIcon className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {renderTierFields()}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex justify-center items-center ${isSubmitting ? 'opacity-70' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <CheckIcon className="animate-spin h-5 w-5 mr-2" />
                                Processing...
                            </>
                        ) : (
                            'Submit and Get Queue Number'
                        )}
                    </button>
                </div>
            </form>

            <button onClick={() => setCurrentStep(2)} disabled={isSubmitting} className="mt-6 flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
            </button>
        </div>
    );
};

export default CustomerForm;
