import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Header } from '../shared/ui/header/Header';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import HomeIcon from '@mui/icons-material/Home';
import CollectionsIcon from '@mui/icons-material/Collections';
import BrushIcon from '@mui/icons-material/Brush';
import HistoryIcon from '@mui/icons-material/History';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { BrandLogo } from '../shared/ui/logo/BrandLogo';
import {
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from '../shared/ui/theme/theme';
import type { RootState } from './store';

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactElement;
};

const navItems: NavItem[] = [
  { label: 'Главная', path: '/home', icon: <HomeIcon /> },
  { label: 'Коллекции', path: '/collections', icon: <CollectionsIcon /> },
  { label: 'История', path: '/history', icon: <HistoryIcon /> },
  { label: 'Рисование', path: '/drawing', icon: <BrushIcon /> },
];

const LOGO_BOX_SIZE = 90;
const MENU_ITEM_GAP = 24;

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const username = useSelector(
    (state: RootState) => state.auth.user?.login ?? 'Никнейм',
  );

  useEffect(() => {
    if (!accessToken) {
      navigate('/login', { replace: true });
    }
  }, [accessToken, navigate]);

  const drawerWidth = sidebarOpen
    ? SIDEBAR_WIDTH_EXPANDED
    : SIDEBAR_WIDTH_COLLAPSED;

  const pageTitleMap: Record<string, string> = {
    '/home': 'Главная',
    '/collections': 'Коллекции',
    '/history': 'История',
    '/histore': 'История',
    '/drawing': 'Рисование',
    '/rooms/create': 'Создание комнаты',
  };

  const pageTitle =
    pageTitleMap[location.pathname] ??
    (location.pathname.startsWith('/history') ||
    location.pathname.startsWith('/histore')
      ? 'История'
      : location.pathname.startsWith('/home')
      ? 'Главная'
      : location.pathname.startsWith('/rooms/connect')
      ? 'Подключение к комнате'
      : location.pathname.startsWith('/rooms/')
      ? 'Комната'
      : 'Страница');

  const theme = useTheme();
  const accentColor = theme.palette.secondary.main;
  const pageBackground = theme.palette.background.default;
  const activeNavBg = alpha(accentColor, 0.18);
  const hoverNavBg = alpha(accentColor, 0.1);
  const sidebarBorderColor = alpha(accentColor, 0.35);

  return (
    // ВНЕШНИЙ КОНТЕЙНЕР: центрируем макет фиксированной ширины
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: pageBackground,
      }}
    >
      {/* КОНТЕЙНЕР МАКЕТА (ширина фигмы) */}
      <Box
        sx={{
          display: 'flex',
          width: '1900px',      // фиксируем ширину макета
          minHeight: '100vh',
        }}
      >
        {/* SIDEBAR */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: theme.palette.background.paper,
              borderRight: `1px solid ${sidebarBorderColor}`,
              position: 'relative',
              overflow: 'visible',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              alignItems: 'flex-start',
              pb: 2,
            }}
          >
            {/* ЛОГО — 90×90 */}
            <Box
              sx={{
                width: LOGO_BOX_SIZE,
                height: LOGO_BOX_SIZE,
                mt: '20px',
                ml: sidebarOpen ? '20px' : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BrandLogo />
            </Box>

            {/* МЕНЮ */}
            <List sx={{ width: '100%', mt: '105px' }}>
              {navItems.map((item, index) => {
                const active =
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`);

                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      width: sidebarOpen ? 173 : 58,
                      height: sidebarOpen ? 41 : 42,
                      ml: '15px',
                      mb:
                        index === navItems.length - 1
                          ? 0
                          : `${MENU_ITEM_GAP}px`,
                      px: 0,
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      bgcolor: active ? activeNavBg : 'transparent',
                      borderRadius: 2,
                      borderLeft: sidebarOpen
                        ? `4px solid ${active ? accentColor : 'transparent'}`
                        : '4px solid transparent',
                      transition: 'background-color 0.2s ease, border-color 0.2s ease',
                      '&:hover': {
                        bgcolor: active ? activeNavBg : hoverNavBg,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        width: 36,
                        height: 36,
                        mr: sidebarOpen ? '9px' : 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.text.primary,
                        ...(active && {
                          color: accentColor,
                        }),
                        '& svg': { fontSize: 24 },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {sidebarOpen && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: 18,
                          color: active
                            ? accentColor
                            : theme.palette.text.primary,
                          fontWeight: active ? 600 : 400,
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>

            {/* КНОПКА СВОРАЧИВАНИЯ */}
            <Box
              sx={{
                position: 'absolute',
                top: 167,
                right: -18,
                width: 35,
                height: 35,
                borderRadius: '50%',
                bgcolor: theme.palette.background.paper,
                border: `2px solid ${sidebarBorderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 4px rgba(0,0,0,0.12)',
                cursor: 'pointer',
                zIndex: 1300,
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  bgcolor: activeNavBg,
                  borderColor: accentColor,
                },
              }}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              {sidebarOpen ? (
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              )}
            </Box>
          </Box>
        </Drawer>

        {/* ПРАВАЯ ЧАСТЬ */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          {/* ШАПКА */}
          <Header
            title={pageTitle}
            username={username}
            sidebarWidth={drawerWidth}
          />

          {/* КОНТЕНТ */}
          <Box sx={{ mt: '74px', px: 8, py: 4 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
