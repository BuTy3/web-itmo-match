import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/model/authSlice';
import uiReducer, { type ThemeMode } from '../features/ui/model/uiSlice';

const THEME_MODE_STORAGE_KEY = 'theme_mode';

const getStoredThemeMode = (): ThemeMode | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : undefined;
  } catch {
    return undefined;
  }
};

const persistThemeMode = (mode: ThemeMode) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
};

const uiInitialState = uiReducer(undefined, { type: '@@INIT' });
const storedThemeMode = getStoredThemeMode();
const preloadedState = storedThemeMode
  ? { ui: { ...uiInitialState, themeMode: storedThemeMode } }
  : undefined;

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
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
