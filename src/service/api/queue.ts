import { api } from './api';
export interface Branch {
  branchId: string;
  branchName: string;
  location: string;
  qrCodeUrl: string;
  createdAt: string;
  updatedAt: string;
}
export interface QueueCustomer {
  customerId: string;
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  phoneNumber: string;
  address: string;
  city: string;
  postcode: string;
  state: string;
  country: string;
  occupation: string;
  natureOfBusiness: string;
  residentStatus: string;
  orderPurpose: string;
  idFrontImage: string | null;
  idBackImage: string | null;
  passportFrontImage: string | null;
  nationality: string | null;
}
export interface QueueCounter {
  counterId: string;
  counterName: string;
  counterNumber: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}
export interface QueueType {
  queueTypeId: string;
  queueName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
export interface QueueApiResponse {
  queueNumber: string;
  queueId: string;
  branch: Branch;
  queueTypeId: string; // Changed from object to string ID
  customer: QueueCustomer;
  counterId: QueueCounter | null;
  createdAt: string;
  status: 'Pending' | 'Completed' | 'Canceled' | 'InProgress';
  completedAt: string | null;
  estimatedWaitTime: string;
}
export interface QueueUpdateRequest {
  branchId: string;
  queueTypeId: string;
  customerId: string;
  createdAt: string;
  status: 'Pending' | 'Completed' | 'Canceled';
  counterId: string | null;
  completedAt: string | null;
}
export interface CreateQueueRequest {
  branchId: string;
  queueTypeId: string;
  customerId: string;
}

export const getQueuesByBranch = async (branchId: string): Promise<QueueApiResponse[]> => {
  const response = await api.get<QueueApiResponse[]>(`/queues/branch/${branchId}`);
  return response.data;
};
export const updateQueue = async (queueId: string, data: QueueUpdateRequest): Promise<QueueApiResponse> => {
  const response = await api.put<QueueApiResponse>(`/queues/update/${queueId}`, data);
  return response.data;
};
export const createQueue = async (data: CreateQueueRequest): Promise<QueueApiResponse> => {
  const response = await api.post<QueueApiResponse>('/queues/create', data);
  return response.data;
};
export const getCurrentServingNumber = async (counterId: string): Promise<string> => {
  const response = await api.get<string>(`/queues/now-serving/counter/${counterId}`);
  return response.data;
};
