import { createTheme } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import type { ThemeColors } from '../../../features/ui/model/uiSlice';

export const SIDEBAR_WIDTH_EXPANDED = 192;
export const SIDEBAR_WIDTH_COLLAPSED = 90;

export const createAppTheme = (mode: PaletteMode, colors: ThemeColors) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: colors.background,
        paper: '#FFFFFF',
      },
      text: {
        primary: mode === 'dark' ? '#FFFFFF' : '#000000',
      },
    },
    typography: {
      fontFamily:
        'Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontSize: 48,
        fontWeight: 700,
        lineHeight: 1.2,
      },
      body1: {
        fontSize: 16,
      },
    },
  });
