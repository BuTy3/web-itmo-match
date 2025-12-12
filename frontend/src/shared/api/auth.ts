import { apiClient } from './client';

export type LoginPayload = {
  login: string;
  password: string;
};

export type RegisterPayload = {
  login: string;
  password: string;
};

export type AuthApiResponse = {
  ok: boolean;
  token?: string;
  message?: string;
};

export const login = async (payload: LoginPayload): Promise<AuthApiResponse> => {
  const { data } = await apiClient.post<AuthApiResponse>('/auth/login', payload);
  return data;
};

export const register = async (payload: RegisterPayload): Promise<AuthApiResponse> => {
  const { data } = await apiClient.post<AuthApiResponse>('/auth/register', payload);
  return data;
};
