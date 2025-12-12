import React from 'react';
import { Box, Typography } from '@mui/material';
import { RightHeaderPanel } from './RightHeaderPanel';

type HeaderProps = {
  title: string;
  username: string;
  sidebarWidth: number;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  username,
  sidebarWidth,
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: `${sidebarWidth}px`,
        width: `calc(100% - ${sidebarWidth}px)`,
        height: '74px',
        backgroundColor: '#FFFFFF',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        borderBottom: 'none',
      }}
    >
      {/* INTERNAL HEADER CONTENT (maxWidth 1677px + 223px offset) */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '1677px',
          height: '74px',
          ml: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* LEFT SIDE — TITLE */}
        <Box
          sx={{
            width: '209px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: '55px', fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>

        {/* RIGHT SIDE */}
        <RightHeaderPanel username={username} />
      </Box>
    </Box>
  );
};
