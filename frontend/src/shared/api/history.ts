import { apiClient } from './client';
import type { HistoryRoom } from './types';

export type HistoryFilters = {
  name?: string;
  type?: string;
  date?: string;
};

export type HistoryResponse =
  | { ok: true; rooms: HistoryRoom[] }
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
  token: string;
  filters?: HistoryFilters;
}): Promise<HistoryResponse> => {
  try {
    const { data } = await apiClient.post<HistoryResponse>('/history', {
      token: payload.token,
      filters: payload.filters,
    });
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
