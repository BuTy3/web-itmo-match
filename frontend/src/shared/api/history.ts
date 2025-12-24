import { apiClient } from './client';
import type { HistoryRoom, HistoryRoomDetails } from './types';

export type HistoryFilters = {
  name?: string;
  type?: string;
  date?: string;
};

export type HistoryResponse =
  | { ok: true; rooms: HistoryRoom[] }
  | { ok: false; message: string };

export type RoomHistoryResponse =
  | { ok: true; room: HistoryRoomDetails }
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

const placeholderRoomDetails: HistoryRoomDetails = {
  id: '0',
  name: 'Название...',
  topic: 'Тип...',
  match_mode: 'WATCH_ALL',
  status: 'CLOSED',
  access_mode: 'PUBLIC',
  created_at: new Date().toISOString(),
  closed_at: new Date().toISOString(),
  date: '01.01.2025',
  result: {
    name: 'Название...',
    description: 'Описание...',
    image_url: null,
  },
  creator: { id: '1', display_name: 'Никнейм', avatar_url: null },
  participants: [
    {
      user_id: '1',
      display_name: 'name1',
      avatar_url: null,
      joined_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    },
    {
      user_id: '2',
      display_name: 'name2',
      avatar_url: null,
      joined_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    },
  ],
};

const parsePositiveInt = (value: unknown) => {
  const parsed = typeof value === 'string' ? Number(value) : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.trunc(parsed);
};

export const getRoomHistory = async (payload: {
  token: string;
  id_room: string | number;
}): Promise<RoomHistoryResponse> => {
  const idRoomRaw = String(payload.id_room);

  // "Заглушка" (используется когда нет ответа от бэка)
  if (idRoomRaw === '0' || idRoomRaw === 'room-1') {
    return { ok: true, room: placeholderRoomDetails };
  }

  const idRoom = parsePositiveInt(idRoomRaw);
  if (!idRoom) {
    return { ok: false, message: 'Некорректный id комнаты' };
  }

  try {
    const { data } = await apiClient.get<RoomHistoryResponse>(`/history/${idRoom}`);
    return data;
  } catch {
    if (String(placeholderRoomDetails.id) === String(idRoom)) {
      return { ok: true, room: placeholderRoomDetails };
    }
    return { ok: false, message: 'Не удалось загрузить историю комнаты' };
  }
};
