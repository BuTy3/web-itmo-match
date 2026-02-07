import axios, { AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { store } from '../../app/store';
import { logout } from '../../features/auth/model/authSlice';

const baseURL = import.meta.env.VITE_API_URL ?? '';

console.log('API baseURL =', baseURL); // временно для проверки

export const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;

    if (token) {
      const headers =
        config.headers instanceof AxiosHeaders
          ? config.headers
          : new AxiosHeaders(config.headers);

      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('nickname');
      store.dispatch(logout());
    }
    return Promise.reject(error);
  },
);
