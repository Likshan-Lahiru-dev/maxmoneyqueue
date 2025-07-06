import { api } from './api';
export interface QueueType {
  queueTypeId: string;
  queueName: string;
  description: string;
}
export const getTiers = async (): Promise<QueueType[]> => {
  const response = await api.get<QueueType[]>('/queue-types/get-all');
  return response.data;
};