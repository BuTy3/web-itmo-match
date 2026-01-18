import { apiClient } from './client';
import type {
  Room,
  RoomVotingState,
  VoteResponse,
  RoomResults,
} from './types';

const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Concept Jam',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-2',
    name: 'AI Assisted Drawing',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-3',
    name: 'UX Feedback',
    createdAt: new Date().toISOString(),
  },
];

export const getRooms = (): Promise<Room[]> => {
  return Promise.resolve([...mockRooms]);
};

export const getRoomById = (id: string): Promise<Room | null> => {
  const room = mockRooms.find((item) => item.id === id) ?? null;
  return Promise.resolve(room);
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
