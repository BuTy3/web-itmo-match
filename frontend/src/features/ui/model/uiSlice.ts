import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  primary: string;
  secondary: string;
};

export type ThemeColorKey = keyof ThemeColors;

interface UiState {
  themeMode: ThemeMode;
  themeColors: ThemeColors;
}

const initialState: UiState = {
  themeMode: 'light',
  themeColors: {
    primary: '#4225F4',
    secondary: '#F32222',
  },
};


const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
    setThemeColor(
      state,
      action: PayloadAction<{ key: ThemeColorKey; color: string }>,
    ) {
      state.themeColors[action.payload.key] = action.payload.color;
    },
  },
});

export const { toggleTheme, setThemeMode, setThemeColor } = uiSlice.actions;
export default uiSlice.reducer;
