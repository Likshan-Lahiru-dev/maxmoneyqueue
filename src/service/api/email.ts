import { api } from './api';
interface SendQueueEmailRequest {
  email: string;
  queueNumber: string;
  customerName: string;
  estimatedWaitTime: number;
}
export const sendQueueEmail = async (data: SendQueueEmailRequest): Promise<void> => {
  await api.post('/queue-email', data);
};