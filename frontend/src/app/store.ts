import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/model/authSlice';
import uiReducer from '../features/ui/model/uiSlice';
import roomsReducer from '../features/rooms/model/roomsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    rooms: roomsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
