import { createTheme } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import type { ThemeColors } from '../../../features/ui/model/uiSlice';

export const SIDEBAR_WIDTH_EXPANDED = 192;
export const SIDEBAR_WIDTH_COLLAPSED = 90;

export const createAppTheme = (mode: PaletteMode, colors: ThemeColors) =>
  createTheme({
    palette: {
      mode,
      primary: { main: colors.primary },
      secondary: { main: colors.secondary },

      background: {
        default: mode === 'dark' ? '#0d111a' : '#f4f5f7',
        paper: mode === 'dark' ? '#151a23' : '#ffffff',
      },

      text: {
        primary: mode === 'dark' ? '#f2f4f8' : '#1f1f1f',
        secondary: mode === 'dark' ? '#c7cad1' : '#3e3b3b',
      },

      // (опционально, но удобно для бордеров/разделителей)
      divider: mode === 'dark' ? 'rgba(242,244,248,0.16)' : 'rgba(31,31,31,0.16)',
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: (t) => ({
          ':root': {
            colorScheme: t.palette.mode,
          },
          html: { height: '100%' },
          body: {
            height: '100%',
            margin: 0,
            backgroundColor: t.palette.background.default,
            color: t.palette.text.primary,
          },
          '#root': { height: '100%' },
          a: { color: 'inherit' },

          // ✅ важное: поля ввода/текстарии тоже читаемые в dark
          input: { color: t.palette.text.primary },
          textarea: { color: t.palette.text.primary },
        }),
      },

      // ✅ базовые компоненты МУИ сами берут цвета из theme.palette
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
    },

    typography: {
      fontFamily: 'Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontSize: 48, fontWeight: 700, lineHeight: 1.2 },
      body1: { fontSize: 16 },
    },
  });
