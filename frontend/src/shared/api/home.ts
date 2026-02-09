import { apiClient } from './client';
import type { HomeCollection } from './types';

export type HomeCollectionsResponse =
  | { ok: true; collections: HomeCollection[] }
  | { ok: false; message: string };

export type SearchRoomResponse = { ok: true; id_room: number } | { ok: false; message: string };

export const getReadyCollections = async (): Promise<HomeCollectionsResponse> => {
  const { data } = await apiClient.get<HomeCollectionsResponse>('/home');
  return data;
};

export const getUserCollections = async (): Promise<HomeCollectionsResponse> => {
  const { data } = await apiClient.post<HomeCollectionsResponse>('/home');
  return data;
};

export const searchRoom = async (payload: { id: number }): Promise<SearchRoomResponse> => {
  const { data } = await apiClient.post<SearchRoomResponse>('/home/search', {
    id: payload.id,
  });
  return data;
};
