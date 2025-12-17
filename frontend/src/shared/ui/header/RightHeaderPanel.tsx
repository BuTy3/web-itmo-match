import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeMenu } from './ThemeMenu.tsx';

export const RightHeaderPanel = ({ username }: { username: string }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
            border: { xs: '3px solid #8874F6', md: '4px solid #8874F6' },
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
          {/* user icon masked */}
          <Box
            sx={{
              width: { xs: '20px', sm: '24px', md: '32px' },
              height: { xs: '20px', sm: '24px', md: '32px' },
              backgroundColor: '#918888',
              maskImage: 'url("/icons/user-outline.svg")',
              WebkitMaskImage: 'url("/icons/user-outline.svg")',
              maskRepeat: 'no-repeat',
              maskSize: 'contain',
              maskPosition: 'center',
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
          border: '2px solid #4124F4',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
        }}
      >
        {/* logout SVG mask */}
        <Box
          sx={{
            width: { xs: '24px', md: '32px' },
            height: { xs: '24px', md: '32px' },
            backgroundColor: '#4124F4',
            maskImage: 'url(/icons/logout-vector.svg)',
            WebkitMaskImage: 'url(/icons/logout-vector.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
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
            background: 'linear-gradient(90deg, #FFFFFF 50%, #EF3030 50%)',
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
            background: 'linear-gradient(90deg, #F03030 50%, #4124F4 50%)',
            transform: 'scale(0.7)',
          }}
        />
      </Box>

      {/* THEME MENU */}
      {menuOpen && <ThemeMenu />}
    </Box>
  );
};
