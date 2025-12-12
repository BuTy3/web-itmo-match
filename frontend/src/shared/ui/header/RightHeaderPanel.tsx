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
        marginLeft: '900px'
      }}
    >

      {/* ====================== AVATAR (67×67) ====================== */}
      <Box
        sx={{
          width: '67px',
          height: '67px',
          position: 'relative',
          borderRadius: '50%',
        }}
      >
        {/* Outer Circle (border ring) */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '4px solid #8874F6',
          }}
        />

        {/* Inner Gray Circle 51×51 */}
        <Box
          sx={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '51px',
            height: '51px',
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
              width: '32px',
              height: '32px',
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

      {/* ====================== GAP 1 → 85 px ====================== */}
      <Box sx={{ width: '18px' }} />

      {/* ====================== USERNAME BOX (154×42) ====================== */}
      <Box
        sx={{
          width: '154px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontSize: '35px', color: '#3E3B3B' }}>
          {username}
        </Typography>
      </Box>

      {/* ====================== GAP 2 → 175 px ====================== */}
      <Box sx={{ width: '18px' }} />

      {/* ====================== DIVIDER 1 (1×46) ====================== */}
      <Box
        sx={{
          width: '1px',
          height: '46px',
          backgroundColor: '#3E3B3B',
        }}
      />

      {/* ====================== GAP 3 → 21 px ====================== */}
      <Box sx={{ width: '18px' }} />

      {/* ====================== LOGOUT BUTTON (56×56) ====================== */}
      <Box
        sx={{
          width: '56px',
          height: '56px',
          borderRadius: '8px',
          border: '2px solid #4124F4',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* logout SVG mask */}
        <Box
          sx={{
            width: '32px',
            height: '32px',
            backgroundColor: '#4124F4',
            maskImage: 'url(/icons/logout-vector.svg)',
            WebkitMaskImage: 'url(/icons/logout-vector.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
          }}
        />
      </Box>

      {/* ====================== GAP 4 → 76 px ====================== */}
      <Box sx={{ width: '18px' }} />

      {/* ====================== DIVIDER 2 (1×46) ====================== */}
      <Box
        sx={{
          width: '1px',
          height: '46px',
          backgroundColor: '#3E3B3B',
        }}
      />

      {/* ====================== GAP 5 → 14 px ====================== */}
      <Box sx={{ width: '10px' }} />

      {/* ====================== THEME TOGGLE BUTTON (56×56) ====================== */}
      <Box
        sx={{
          width: '56px',
          height: '56px',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={() => setMenuOpen((s) => !s)}
      >
        {/* Outer 38×38 half-white / half-red */}
        <Box
          sx={{
            position: 'absolute',
            top: '9px',
            left: '9px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(90deg, #FFFFFF 50%, #EF3030 50%)',
          }}
        />

        {/* Inner circle (scaled 0.7) */}
        <Box
          sx={{
            position: 'absolute',
            top: '9px',
            left: '9px',
            width: '38px',
            height: '38px',
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
