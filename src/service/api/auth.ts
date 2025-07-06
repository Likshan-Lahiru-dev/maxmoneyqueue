import { api } from './api';
interface SignInRequest {
  email: string;
  password: string;
}
interface SignInResponse {
  token: string;
  message: string | null;
  staffName: string | null;
}
export const signIn = async (credentials: SignInRequest, counterId: string): Promise<SignInResponse> => {
  const response = await api.post<SignInResponse>(`/auth/signIn/${counterId}`, credentials);
  return response.data;
};