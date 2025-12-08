import { useMemo, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import type { RootState } from '../../../app/store';
import type { ThemeMode } from '../../../features/ui/model/uiSlice';
import { createAppTheme } from './theme';
import './reset.css';


type AppThemeProviderProps = {
  children: ReactNode;
};

const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const themeMode = useSelector<RootState, ThemeMode>((state) => state.ui.themeMode);
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
