import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/model/authSlice';
import uiReducer from '../features/ui/model/uiSlice';
import roomsReducer from '../features/rooms/model/roomsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  rooms: roomsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const UI_STORAGE_KEY = 'ui-theme';

type PersistedUiState = {
  themeMode: 'light' | 'dark';
  themeColors: {
    primary: string;
    secondary: string;
  };
};

const loadUiState = (): Partial<RootState> | undefined => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return undefined;
  }

  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as PersistedUiState;
    if (
      parsed &&
      (parsed.themeMode === 'light' || parsed.themeMode === 'dark') &&
      parsed.themeColors &&
      typeof parsed.themeColors.primary === 'string' &&
      typeof parsed.themeColors.secondary === 'string'
    ) {
      return { ui: parsed };
    }
  } catch {
    return undefined;
  }

  return undefined;
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadUiState() as RootState | undefined,
});

let lastUiState = store.getState().ui;
store.subscribe(() => {
  const nextUiState = store.getState().ui;
  if (
    nextUiState.themeMode !== lastUiState.themeMode ||
    nextUiState.themeColors.primary !== lastUiState.themeColors.primary ||
    nextUiState.themeColors.secondary !== lastUiState.themeColors.secondary
  ) {
    lastUiState = nextUiState;
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(nextUiState));
    } catch {
      // Ignore write errors (storage full, blocked, etc.)
    }
  }
});

export type AppDispatch = typeof store.dispatch;
