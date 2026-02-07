import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type RoomParticipant = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
};

export type RoomDrawing = {
  userId: string;
  nickname: string;
  dataUrl: string;
  updatedAt: number;
};

type RoomsState = {
  participantsByRoom: Record<string, RoomParticipant[]>;
  drawingsByRoom: Record<string, Record<string, RoomDrawing>>;
};

const initialState: RoomsState = {
  participantsByRoom: {},
  drawingsByRoom: {},
};

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setParticipants(
      state,
      action: PayloadAction<{ roomId: string; participants: RoomParticipant[] }>,
    ) {
      state.participantsByRoom[action.payload.roomId] =
        action.payload.participants;
    },
    upsertDrawing(
      state,
      action: PayloadAction<{
        roomId: string;
        userId: string;
        nickname: string;
        dataUrl: string;
      }>,
    ) {
      const { roomId, userId, nickname, dataUrl } = action.payload;
      if (!state.drawingsByRoom[roomId]) {
        state.drawingsByRoom[roomId] = {};
      }
      state.drawingsByRoom[roomId][userId] = {
        userId,
        nickname,
        dataUrl,
        updatedAt: Date.now(),
      };
    },
  },
});

export const { setParticipants, upsertDrawing } = roomsSlice.actions;
export default roomsSlice.reducer;
