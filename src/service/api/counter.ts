import { api } from './api';
export interface CounterApiResponse {
  counterId: string;
  counterName: string;
  counterNumber: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}
export const getCounters = async (): Promise<CounterApiResponse[]> => {
  const response = await api.get<CounterApiResponse[]>('/counters');
  return response.data;
};
export const getCountersByBranch = async (branchId: string): Promise<CounterApiResponse[]> => {
  const response = await api.get<CounterApiResponse[]>(`/counters/by-branch/${branchId}`);
  return response.data;
};