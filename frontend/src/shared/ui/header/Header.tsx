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
      <Box
        sx={{
          width: '100%',
          maxWidth: '1500px',
          height: '74px',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 3 },
          boxSizing: 'border-box',
        }}
      >
        {/* LEFT SIDE — TITLE */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          <Typography
            noWrap
            sx={{
              fontSize: { xs: '32px', sm: '44px', md: '55px' },
              fontWeight: 500,
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* RIGHT SIDE */}
        <RightHeaderPanel username={username} />
      </Box>
    </Box>
  );
};
