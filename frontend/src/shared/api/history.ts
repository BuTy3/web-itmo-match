import { apiClient } from './client';
import type { HistoryRoom, RoomHistoryDetail } from './types';

export type HistoryFilters = {
  name?: string;
  type?: string;
  date?: string;
};

export type HistoryResponse =
  | { ok: true; rooms: HistoryRoom[] }
  | { ok: false; message: string };

export type RoomHistoryResponse =
  | { ok: true; room: RoomHistoryDetail }
  | { ok: false; message: string };

const mockRooms: HistoryRoom[] = [
  {
    id: 'room-1',
    name: 'Тест',
    url_image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/ITMO_University%27s_main_building%2C_August_2016.jpg/960px-ITMO_University%27s_main_building%2C_August_2016.jpg",
    type: 'тест',
    description: '',
    date: '18.12.2025',
  },
];

const includesCaseInsensitive = (value: string, query: string) =>
  value.toLowerCase().includes(query.trim().toLowerCase());

export const getHistory = async (payload: {
  filters?: HistoryFilters;
}): Promise<HistoryResponse> => {
  try {
    const params = new URLSearchParams();
    if (payload.filters?.name) params.append('name', payload.filters.name);
    if (payload.filters?.type) params.append('type', payload.filters.type);
    if (payload.filters?.date) params.append('date', payload.filters.date);

    const queryString = params.toString();
    const url = queryString ? `/history?${queryString}` : '/history';

    const { data } = await apiClient.get<HistoryResponse>(url);
    return data;
  } catch {
    const filters = payload.filters ?? {};

    const filteredRooms = mockRooms.filter((room) => {
      if (filters.name && !includesCaseInsensitive(room.name, filters.name)) return false;
      if (filters.type && room.type !== filters.type) return false;
      if (filters.date && room.date !== filters.date) return false;
      return true;
    });

    return Promise.resolve({ ok: true, rooms: filteredRooms });
  }
};

export const getRoomHistory = async (roomId: string): Promise<RoomHistoryResponse> => {
  try {
    const { data } = await apiClient.get<RoomHistoryResponse>(`/history/${roomId}`);
    return data;
  } catch (error: any) {
    return {
      ok: false,
      message: error.response?.data?.message || 'Failed to load room history',
    };
  }
};
