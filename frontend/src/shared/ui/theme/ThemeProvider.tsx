import { useMemo, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import type { RootState } from '../../../app/store';
import { createAppTheme } from './theme';
import './reset.css';

type AppThemeProviderProps = {
  children: ReactNode;
};

const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const { themeMode, themeColors } = useSelector((state: RootState) => state.ui);
  const theme = useMemo(() => createAppTheme(themeMode, themeColors), [themeMode, themeColors]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
