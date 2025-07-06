import { api } from './api';
export interface CustomerApiResponse {
  customerId: string;
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  address: string;
  city: string;
  postcode: string;
  state: string;
  country: string;
  phoneNumber: string;
  residentStatus: 'RESIDENT' | 'NON_RESIDENT';
  orderPurpose: string;
  occupation: string;
  natureOfBusiness: string;
  nationality: string;
  idFrontImage?: string;
  idBackImage?: string;
  passportFrontImage?: string;
}
export const searchCustomerById = async (idNumber: string): Promise<CustomerApiResponse> => {
  const response = await api.get(`/customer/by-id-number/${idNumber}`);
  return response.data;
};
export const saveCustomer = async (formData: FormData): Promise<CustomerApiResponse> => {
  const response = await api.post('/customer', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
export const updateCustomer = async (customerId: string, formData: FormData): Promise<string> => {
  const response = await api.put(`/customer/${customerId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
export const sendFcmToken = async (customerId: string, token: string) => {
  return api.put(`/customer/customerFcmToken/${customerId}`, {
    token: token,
  });
};
