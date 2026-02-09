import { apiClient } from './client';
import type { RoomVotingState, VoteResponse, RoomResults } from './types';

export type RoomAccessResponse =
  | { ok: true; collection_choose?: RoomCollection[] | boolean }
  | { ok: false; message: string };

export type RoomCreatePayload = {
  name: string;
  type_match: 1 | 2;
  password?: string;
  type_collections: 1 | 2;
  collection_id: number | string | Array<number | string>;
};

export type RoomCreateResponse =
    | { ok: true; id_room?: number | string; room_id?: number | string; id?: number | string }
    | { ok: false; message: string };

export type RoomConnectPayload = {
  password?: string;
  collection_id?: number | string;
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
      owner_nick?: string | null;
      redirect?: string;
      next?: string;
    }
  | { ok: false; message: string };

export type RoomChoosePayload = {
  choose: 0 | 1 | 2;
};

export type RoomChooseResponse =
  | {
      ok: true;
      nick?: string;
      profile_picture_url?: string | null;
      name_card?: string;
      description?: string;
      owner_nick?: string | null;
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
  payload?: Record<string, never>,
): Promise<RoomAccessResponse> => {
  const { data } = await apiClient.post<RoomAccessResponse>('/rooms/create', payload);
  return data;
};

export const createRoom = async (
  payload: RoomCreatePayload,
): Promise<RoomCreateResponse> => {
  try {
    const { data } = await apiClient.post<RoomCreateResponse>('/rooms/create', payload);
    return data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      ok: false,
      message: err.response?.data?.message || 'Не удалось создать комнату',
    };
  }
};

export const checkConnectRoomAccess = async (
  payload: { id_room: string | number; password?: string },
): Promise<RoomAccessResponse> => {
  const { id_room, password } = payload;
  try {
    const { data } = await apiClient.post<RoomAccessResponse>(`/rooms/connect/${id_room}`, {
      check: true,
      password,
    });
    return data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      ok: false,
      message: err.response?.data?.message || 'Не удалось загрузить данные комнаты',
    };
  }
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
  payload: { id_room: string | number },
): Promise<RoomStateResponse> => {
  const { id_room } = payload;
  const { data } = await apiClient.post<RoomStateResponse>(`/rooms/${id_room}`);
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
  payload?: Record<string, never>,
): Promise<RoomCollectionsResponse> => {
  const { data } = await apiClient.post<RoomCollectionsResponse>('/home', payload);
  return data;
};

export type DrawingPoint = {
  x: number;
  y: number;
  color?: string | null;
};

export type RoomDrawingResponse =
  | {
      ok: true;
      topic?: string | null;
      participants?: Array<{ id: string; nickname: string }>;
      points?: DrawingPoint[] | null;
      snapshot?: string | null;
      redirect?: string;
    }
  | { ok: false; message: string; redirect?: string };

export type RoomDrawingSubmitResponse =
  | { ok: true; redirect?: string }
  | { ok: false; message: string };

export type RoomResultCard = {
  profile_picture_url?: string | null;
  name_card: string;
  description: string;
};

export type RoomDrawingResult = {
  user_id: string;
  nickname: string;
  snapshot: string | null;
};

export type RoomDrawingsResultsResponse =
  | { ok: true; drawings: RoomDrawingResult[] }
  | { ok: false; message: string };

export type RoomResultsCardsResponse =
  | { ok: true; cards: RoomResultCard[] }
  | { ok: false; message: string };

export const fetchRoomDrawing = async (
  payload: { id_room: string | number },
): Promise<RoomDrawingResponse> => {
  const { id_room } = payload;
  const { data } = await apiClient.post<RoomDrawingResponse>(`/rooms/${id_room}/drawing`);
  return data;
};

export const submitRoomDrawing = async (
  payload: { id_room: string | number; points?: DrawingPoint[]; snapshot?: string | null },
): Promise<RoomDrawingSubmitResponse> => {
  const { id_room, ...body } = payload;
  const { data } = await apiClient.post<RoomDrawingSubmitResponse>(
    `/rooms/${id_room}/drawing`,
    body,
  );
  return data;
};

export const getRoomCardsResults = async (
  roomId: string,
): Promise<RoomResultsCardsResponse> => {
  try {
    const response = await apiClient.get<RoomResults>(`/rooms/${roomId}/results`);
    if (response.data.ok) {
      return {
        ok: true,
        cards: response.data.matched_items.map((item) => ({
          name_card: item.title,
          description: item.description ?? '',
          profile_picture_url: item.image_url ?? null,
        })),
      };
    }
    return {
      ok: false,
      message: response.data.message || 'Не удалось загрузить результаты',
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      ok: false,
      message: err.response?.data?.message || 'Не удалось загрузить результаты',
    };
  }
};

export const getRoomDrawingsResults = async (
  roomId: string,
): Promise<RoomDrawingsResultsResponse> => {
  try {
    const response = await apiClient.get<RoomDrawingsResultsResponse>(
      `/rooms/${roomId}/drawings`,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      ok: false,
      message: err.response?.data?.message || 'Не удалось загрузить рисунки',
    };
  }
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
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      ok: false,
      message: err.response?.data?.message || 'Не удалось загрузить данные комнаты',
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
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      ok: false,
      message: err.response?.data?.message || 'Ошибка при голосовании',
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
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      ok: false,
      has_match: false,
      matched_items: [],
      message: err.response?.data?.message || 'Не удалось загрузить результаты',
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
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      ok: false,
      message: err.response?.data?.message || 'Ошибка при выходе из комнаты',
    };
  }
};
