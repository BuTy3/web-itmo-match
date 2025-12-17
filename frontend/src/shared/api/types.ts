export type User = {
  id: string;
  email: string;
  name?: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type Collection = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
};

export type CollectionItem = {
  id: string;
  collectionId: string;
  title: string;
};

export type Room = {
  id: string;
  name: string;
  createdAt: string;
};

export type HistoryRoom = {
  id: string;
  name: string;
  url_image: string;
  type: string;
  description: string;
  date: string;
};
