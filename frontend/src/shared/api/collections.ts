import { apiClient } from './client';
import type { Collection, CollectionItem } from './types';

const mockCollections: Collection[] = [
  {
    id: 'collection-1',
    title: 'Primary Concepts',
    description: 'Base ideas for the ITMO Match UI kit.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'collection-2',
    title: 'Hackathon Drafts',
    description: 'Collaborative sketches from last season.',
    createdAt: new Date().toISOString(),
  },
];

const mockItems: CollectionItem[] = [
  { id: 'item-1', collectionId: 'collection-1', title: 'Landing hero' },
  { id: 'item-2', collectionId: 'collection-1', title: 'Color palette' },
  { id: 'item-3', collectionId: 'collection-2', title: 'Lobby screen' },
];

const createMockCollection = (payload: { title: string; description?: string }): Collection => ({
  id: `collection-${Date.now()}`,
  title: payload.title,
  description: payload.description,
  createdAt: new Date().toISOString(),
});

void apiClient;
void mockItems;

export const getCollections = (): Promise<Collection[]> => {
  return Promise.resolve([...mockCollections]);
};

export const getCollectionById = (id: string): Promise<Collection | null> => {
  const collection = mockCollections.find((item) => item.id === id) ?? null;
  return Promise.resolve(collection);
};

export const createCollection = (payload: { title: string; description?: string }): Promise<Collection> => {
  const newCollection = createMockCollection(payload);
  mockCollections.push(newCollection);
  return Promise.resolve(newCollection);
};
