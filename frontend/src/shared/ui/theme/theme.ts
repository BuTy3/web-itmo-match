import { createTheme } from '@mui/material';
import type { PaletteMode, ThemeOptions } from '@mui/material';


const getPalette = (mode: PaletteMode): ThemeOptions['palette'] => {
  if (mode === 'dark') {
    return {
      mode,
      primary: {
        main: '#90caf9',
        contrastText: '#0d1b2a',
      },
      secondary: {
        main: '#f48fb1',
        contrastText: '#0d1b2a',
      },
      background: {
        default: '#0d1b2a',
        paper: '#14213d',
      },
      text: {
        primary: '#f5f5f5',
        secondary: '#c1c9d6',
      },
    };
  }

  return {
    mode,
    primary: {
      main: '#0055ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6f61',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  };
};

const typography: ThemeOptions['typography'] = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontWeight: 600,
    fontSize: '3rem',
  },
  h2: {
    fontWeight: 600,
    fontSize: '2.5rem',
  },
  h3: {
    fontWeight: 600,
    fontSize: '2rem',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.75rem',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.5rem',
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.25rem',
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
};

export const createAppTheme = (mode: PaletteMode = 'light') => {
  return createTheme({
    palette: getPalette(mode),
    typography,
  });
};
