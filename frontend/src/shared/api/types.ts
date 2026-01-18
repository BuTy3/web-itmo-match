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
  url_image: string | null;
  type: string;
  description: string;
  date: string;
};

// История комнаты (из main)
export type HistoryRoomCreator = {
  id: string;
  display_name: string;
  avatar_url: string | null;
};

export type HistoryRoomParticipant = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  joined_at: string;
  finished_at: string | null;
};

export type HistoryRoomDetails = {
  id: string;
  name: string;
  topic: string;
  match_mode: string;
  status: string;
  access_mode: string;
  created_at: string;
  closed_at: string | null;
  date: string;
  result: unknown;
  creator: HistoryRoomCreator;
  participants: HistoryRoomParticipant[];
};

// Room voting types (из rooms-results)
export type VotingItem = {
  id: string;
  title: string;
  description?: string;
  image_url: string | null;
  suggested_by: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type RoomVotingState = {
  room_id: string;
  room_name: string;
  current_item: VotingItem | null;
  total_items: number;
  voted_count: number;
  is_finished: boolean;
  all_finished: boolean;
};

export type VoteResponse = {
  ok: boolean;
  message?: string;
  next_item?: VotingItem | null;
  is_finished: boolean;
  all_finished: boolean;
  redirect_to?: 'drawing' | 'drawing_res' | 'results';
};

export type MatchedItem = {
  id: string;
  title: string;
  description?: string;
  image_url: string | null;
};

export type RoomResults = {
  ok: boolean;
  has_match: boolean;
  matched_items: MatchedItem[];
  message?: string;
};