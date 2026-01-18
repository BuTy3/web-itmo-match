import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/model/authSlice.ts';
import uiReducer from '../features/ui/model/uiSlice';
import roomsReducer from '../features/rooms/model/roomsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    rooms: roomsReducer,
  },
  preloadedState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

let lastThemeMode = store.getState().ui.themeMode;
store.subscribe(() => {
  const nextThemeMode = store.getState().ui.themeMode;
  if (nextThemeMode !== lastThemeMode) {
    lastThemeMode = nextThemeMode;
    persistThemeMode(nextThemeMode);
  }
});
