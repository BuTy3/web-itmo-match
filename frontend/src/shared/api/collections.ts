import { apiClient } from './client';

export type CollectionListItem = {
  id: number;
  url_image: string | null;
  type: string;
  description: string | null;
  items: {
    item_id: number;
    url_image: string | null;
    description: string | null;
  }[];
};

export type CollectionsResponse =
  | { ok: true; collections: CollectionListItem[] }
  | { ok: false; message: string };

export type CollectionDetails = {
  id: number;
  ownerId: number;
  urlImage: string | null;
  imagePath: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: number;
    collectionId: number;
    urlImage: string | null;
    imagePath: string | null;
    description: string | null;
  }[];
};

export type CollectionDetailsResponse =
  | { ok: true; collection: CollectionDetails }
  | { ok: false; message: string };

export type ConstructorResponse =
  | { ok: true; new_id: number }
  | { ok: false; message: string };

export type ConstructorStateResponse =
  | { ok: true; new_id: number; item_id: number }
  | { ok: false; message: string; new_id?: number };

export type CreateItemResponse =
  | { ok: true; new_id: number; item_id: number }
  | { ok: true; collection_id: number }
  | { ok: false; message: string; new_id?: number; item_id?: number };

export type DeleteResponse =
  | { ok: true; id: number }
  | { ok: false; message: string };

export const getMyCollections = async (): Promise<CollectionsResponse> => {
  const { data } = await apiClient.post<CollectionsResponse>('/home');
  return data;
};

export const getCollectionDetails = async (id: number): Promise<CollectionDetailsResponse> => {
  const { data } = await apiClient.get<CollectionDetailsResponse>(`/collections/${id}`);
  return data;
};

export const createConstructor = async (): Promise<ConstructorResponse> => {
  const { data } = await apiClient.post<ConstructorResponse>('/collections/constructor');
  return data;
};

export const saveConstructorMeta = async (
  id: number,
  payload: { url_image?: string | null; image?: string | null; description: string },
): Promise<ConstructorResponse> => {
  const { data } = await apiClient.post<ConstructorResponse>(`/collections/constructor/${id}`, payload);
  return data;
};

export const loadConstructorState = async (id: number): Promise<ConstructorStateResponse> => {
  const { data } = await apiClient.post<ConstructorStateResponse>(`/collections/constructor/${id}`);
  return data;
};

export const createConstructorItem = async (payload: {
  item_id?: number | null;
  url_image?: string | null;
  image?: string | null;
  description: string;
  next?: boolean;
  save_exit?: boolean;
}): Promise<CreateItemResponse> => {
  const { data } = await apiClient.post<CreateItemResponse>('/collections/constructor/item', payload);
  return data;
};

export const deleteCollection = async (id: number): Promise<DeleteResponse> => {
  const { data } = await apiClient.delete<DeleteResponse>(`/collections/${id}`);
  return data;
};

export const deleteCollectionItem = async (
  collectionId: number,
  itemId: number,
): Promise<DeleteResponse> => {
  const { data } = await apiClient.delete<DeleteResponse>(`/collections/${collectionId}/items/${itemId}`);
  return data;
};
