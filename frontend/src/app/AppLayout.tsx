import type { ReactElement } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import HomeIcon from '@mui/icons-material/Home';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import BrushIcon from '@mui/icons-material/Brush';
import { toggleTheme } from '../features/ui/model/uiSlice';
import type { AppDispatch } from './store';

type NavItem = {
  label: string;
  path: string;
  icon: ReactElement;
};

const drawerWidth = 260;

const navItems: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: <HomeIcon />,
  },
  {
    label: 'Collections',
    path: '/collections',
    icon: <CollectionsBookmarkIcon />,
  },
  {
    label: 'Drawing',
    path: '/drawing',
    icon: <BrushIcon />,
  },
];

export const AppLayout = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        color="primary"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ITMO Match
          </Typography>
          <IconButton color="inherit" onClick={handleToggleTheme} aria-label="toggle theme">
            <Brightness4Icon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => (
              <ListItem disablePadding key={item.path}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  end={item.path === '/'}
                  sx={{
                    '&.active': {
                      backgroundColor: 'action.selected',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${drawerWidth}px`,
          px: 3,
          py: 4,
        }}
      >
        <Toolbar />
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            width: '100%',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
