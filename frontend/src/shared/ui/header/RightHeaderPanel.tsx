import { useState } from 'react';
import { Box, Typography, ClickAwayListener } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ThemeMenu } from './ThemeMenu';
import { logout } from '../../../features/auth/model/authSlice';
import type { AppDispatch } from '../../../app/store';

export const RightHeaderPanel = ({ username }: { username: string }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          height: '74px',
          minWidth: 0,
          maxWidth: '100%',
          gap: { xs: '10px', sm: '12px', md: '18px' },
        }}
      >
        {/* ====================== AVATAR (67×67) ====================== */}
        <Box
          sx={{
            width: { xs: '48px', sm: '56px', md: '67px' },
            height: { xs: '48px', sm: '56px', md: '67px' },
            position: 'relative',
            borderRadius: '50%',
            flex: '0 0 auto',
          }}
        >
          {/* Outer Circle (border ring) */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: {
                xs: `3px solid ${theme.palette.primary.main}`,
                md: `4px solid ${theme.palette.primary.main}`,
              },
            }}
          />

          {/* Inner Gray Circle 51×51 */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: '6px', sm: '7px', md: '8px' },
              left: { xs: '6px', sm: '7px', md: '8px' },
              width: { xs: '36px', sm: '42px', md: '51px' },
              height: { xs: '36px', sm: '42px', md: '51px' },
              borderRadius: '50%',
              backgroundColor: '#D9D9D9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src="/icons/user-outline.svg"
              alt="Аватар профиля"
              sx={{
                width: { xs: '20px', sm: '24px', md: '32px' },
                height: { xs: '20px', sm: '24px', md: '32px' },
              }}
            />
          </Box>
        </Box>

        {/* ====================== USERNAME BOX (154×42) ====================== */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            flex: '0 1 auto',
            maxWidth: { xs: '140px', sm: '220px', md: '320px' },
          }}
        >
          <Typography
            noWrap
            sx={{
              fontSize: { xs: '16px', sm: '20px', md: '35px' },
              color: '#3E3B3B',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {username}
          </Typography>
        </Box>

        {/* ====================== DIVIDER 1 (1×46) ====================== */}
        <Box
          sx={{
            width: '1px',
            height: '46px',
            backgroundColor: '#3E3B3B',
            display: { xs: 'none', md: 'block' },
          }}
        />

        {/* ====================== LOGOUT BUTTON (56×56) ====================== */}
        <Box
          sx={{
            width: { xs: '44px', sm: '50px', md: '56px' },
            height: { xs: '44px', sm: '50px', md: '56px' },
            borderRadius: '8px',
            border: `2px solid ${theme.palette.primary.main}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
          }}
          onClick={handleLogout}
        >
          <Box
            component="img"
            src="/icons/logout-vector.svg"
            alt="Выйти"
            sx={{
              width: { xs: '24px', md: '32px' },
              height: { xs: '24px', md: '32px' },
            }}
          />
        </Box>

        {/* ====================== DIVIDER 2 (1×46) ====================== */}
        <Box
          sx={{
            width: '1px',
            height: '46px',
            backgroundColor: '#3E3B3B',
            display: { xs: 'none', md: 'block' },
          }}
        />

        {/* ====================== THEME TOGGLE BUTTON (56×56) ====================== */}
        <Box
          sx={{
            width: { xs: '44px', sm: '50px', md: '56px' },
            height: { xs: '44px', sm: '50px', md: '56px' },
            cursor: 'pointer',
            position: 'relative',
            flex: '0 0 auto',
          }}
          onClick={() => setMenuOpen((s) => !s)}
        >
          {/* Outer 38×38 half-white / half-red */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: '7px', sm: '8px', md: '9px' },
              left: { xs: '7px', sm: '8px', md: '9px' },
              width: { xs: '30px', sm: '34px', md: '38px' },
              height: { xs: '30px', sm: '34px', md: '38px' },
              borderRadius: '50%',
              background: `linear-gradient(90deg, ${theme.palette.background.paper} 50%, ${theme.palette.secondary.main} 50%)`,
            }}
          />

          {/* Inner circle (scaled 0.7) */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: '7px', sm: '8px', md: '9px' },
              left: { xs: '7px', sm: '8px', md: '9px' },
              width: { xs: '30px', sm: '34px', md: '38px' },
              height: { xs: '30px', sm: '34px', md: '38px' },
              borderRadius: '50%',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 50%)`,
              transform: 'scale(0.7)',
            }}
          />
        </Box>

        {/* THEME MENU */}
        {menuOpen && <ThemeMenu />}
      </Box>
    </ClickAwayListener>
  );
};
