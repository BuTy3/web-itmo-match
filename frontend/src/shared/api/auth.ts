import { apiClient } from './client';
import type { AuthResponse, User } from './types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
};

const mockUser: User = {
  id: 'mock-user-id',
  email: 'user@example.com',
  name: 'Mock User',
};

const buildAuthResponse = (overrides?: Partial<User>): AuthResponse => ({
  user: { ...mockUser, ...overrides },
  accessToken: 'mock-access-token',
});

void apiClient;

export const login = (payload: LoginPayload): Promise<AuthResponse> => {
  return Promise.resolve(buildAuthResponse({ email: payload.email }));
};

export const register = (payload: RegisterPayload): Promise<AuthResponse> => {
  return Promise.resolve(buildAuthResponse({ email: payload.email }));
};
