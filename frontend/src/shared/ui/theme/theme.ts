import { createTheme } from '@mui/material';
import type { PaletteMode } from '@mui/material';

export const SIDEBAR_WIDTH_EXPANDED = 192;
export const SIDEBAR_WIDTH_COLLAPSED = 90;

export const sidebarBg = '#FDF7F7';
export const pageBg = '#FFFBFB';

export const createAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#4225F4',
      },
      secondary: {
        main: '#F32222',
      },
      background: {
        default: pageBg,
        paper: '#FFFFFF',
      },
      text: {
        primary: '#000000',
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
