import { apiClient } from './client';
import type { Room } from './types';

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

void apiClient;

export const getRooms = (): Promise<Room[]> => {
  return Promise.resolve([...mockRooms]);
};

export const getRoomById = (id: string): Promise<Room | null> => {
  const room = mockRooms.find((item) => item.id === id) ?? null;
  return Promise.resolve(room);
};
