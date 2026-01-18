import { apiClient } from './client';
import type {
  RoomVotingState,
  VoteResponse,
  RoomResults,
} from './types';

export type RoomAccessResponse =
    | { ok: true; collection_choose?: number | boolean }
    | { ok: false; message: string };

export type RoomCreatePayload = {
  token: string;
  name: string;
  type_match: 1 | 2;
  password?: string;
  type_collections: 1 | 2;
  collection_id: number | string;
};

export type RoomCreateResponse =
    | { ok: true; id_room?: number | string; room_id?: number | string; id?: number | string }
    | { ok: false; message: string };

export type RoomConnectPayload = {
  token: string;
  password?: string;
  collection_id: number | string;
};

export type RoomConnectResponse =
    | { ok: true }
    | { ok: false; message: string };

export type RoomStateResponse =
    | {
  ok: true;
  nick: string;
  profile_picture_url?: string | null;
  name_card: string;
  description: string;
  redirect?: string;
  next?: string;
}
    | { ok: false; message: string };

export type RoomChoosePayload = {
  token: string;
  choose: 0 | 1 | 2;
};

export type RoomChooseResponse =
    | {
  ok: true;
  nick?: string;
  profile_picture_url?: string | null;
  name_card?: string;
  description?: string;
  redirect?: string;
  next?: string;
}
    | { ok: false; message: string };

export type RoomCollection = {
  id: number | string;
  title?: string | null;
  type?: string | null;
  description?: string | null;
};

export type RoomCollectionsResponse =
    | { ok: true; collections: RoomCollection[] }
    | { ok: false; message: string };

export const checkCreateRoomAccess = async (
    payload: { token: string },
): Promise<RoomAccessResponse> => {
  const { data } = await apiClient.post<RoomAccessResponse>('/rooms/create', payload);
  return data;
};

export const createRoom = async (
    payload: RoomCreatePayload,
): Promise<RoomCreateResponse> => {
  const { data } = await apiClient.post<RoomCreateResponse>('/rooms/create', payload);
  return data;
};

export const checkConnectRoomAccess = async (
    payload: { token: string; id_room: string | number },
): Promise<RoomAccessResponse> => {
  const { id_room, token } = payload;
  const { data } = await apiClient.post<RoomAccessResponse>(`/rooms/connect/${id_room}`, {
    token,
  });
  return data;
};

export const connectRoom = async (
    payload: { id_room: string | number } & RoomConnectPayload,
): Promise<RoomConnectResponse> => {
  const { id_room, ...body } = payload;
  const { data } = await apiClient.post<RoomConnectResponse>(
      `/rooms/connect/${id_room}`,
      body,
  );
  return data;
};

export const fetchRoomState = async (
    payload: { token: string; id_room: string | number },
): Promise<RoomStateResponse> => {
  const { id_room, token } = payload;
  const { data } = await apiClient.post<RoomStateResponse>(`/rooms/${id_room}`, {
    token,
  });
  return data;
};

export const chooseRoomCard = async (
    payload: { id_room: string | number } & RoomChoosePayload,
): Promise<RoomChooseResponse> => {
  const { id_room, ...body } = payload;
  const { data } = await apiClient.post<RoomChooseResponse>(`/rooms/${id_room}`, body);
  return data;
};

export const getUserCollections = async (
    payload: { token: string },
): Promise<RoomCollectionsResponse> => {
  const { data } = await apiClient.post<RoomCollectionsResponse>('/home', payload);
  return data;
};

// Get room voting state (current item to vote on)
export const getRoomVotingState = async (
  roomId: string,
): Promise<{ ok: boolean; data?: RoomVotingState; message?: string }> => {
  try {
    const response = await apiClient.get<RoomVotingState>(
      `/rooms/${roomId}/voting`,
    );
    return { ok: true, data: response.data };
  } catch (error: any) {
    return {
      ok: false,
      message: error.response?.data?.message || 'Не удалось загрузить данные комнаты',
    };
  }
};

// Submit vote for current item
export const submitVote = async (
  roomId: string,
  itemId: string,
  vote: boolean,
): Promise<VoteResponse> => {
  try {
    const response = await apiClient.post<VoteResponse>(
      `/rooms/${roomId}/vote`,
      { item_id: itemId, vote },
    );
    return response.data;
  } catch (error: any) {
    return {
      ok: false,
      message: error.response?.data?.message || 'Ошибка при голосовании',
      is_finished: false,
      all_finished: false,
    };
  }
};

// Get room results
export const getRoomResults = async (
  roomId: string,
): Promise<RoomResults> => {
  try {
    const response = await apiClient.get<RoomResults>(
      `/rooms/${roomId}/results`,
    );
    return response.data;
  } catch (error: any) {
    return {
      ok: false,
      has_match: false,
      matched_items: [],
      message: error.response?.data?.message || 'Не удалось загрузить результаты',
    };
  }
};

// Leave room
export const leaveRoom = async (
  roomId: string,
): Promise<{ ok: boolean; message?: string }> => {
  try {
    await apiClient.post(`/rooms/${roomId}/leave`);
    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      message: error.response?.data?.message || 'Ошибка при выходе из комнаты',
    };
  }
};