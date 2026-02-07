import { useState } from 'react';
import { Box, ClickAwayListener } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../app/store';
import { toggleTheme } from '../../../features/ui/model/uiSlice';
import type { SxProps, Theme } from '@mui/material/styles';
import { ThemeMenu } from './ThemeMenu';

type ThemeToggleButtonProps = {
  sx?: SxProps<Theme>;
  buttonSx?: SxProps<Theme>;
  menuSx?: SxProps<Theme>;
};

export const ThemeToggleButton = ({
  sx,
  buttonSx,
  menuSx,
}: ThemeToggleButtonProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const handleToggle = () => {
    dispatch(toggleTheme());
    setMenuOpen((open) => !open);
  };

  return (
    <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
      <Box sx={{ position: 'relative', ...sx }}>
        <Box
          sx={{
            width: { xs: '44px', sm: '50px', md: '56px' },
            height: { xs: '44px', sm: '50px', md: '56px' },
            cursor: 'pointer',
            position: 'relative',
            ...buttonSx,
          }}
          onClick={handleToggle}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuOpen((open) => !open);
          }}
        >
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

        {menuOpen && <ThemeMenu sx={menuSx} />}
      </Box>
    </ClickAwayListener>
  );
};
