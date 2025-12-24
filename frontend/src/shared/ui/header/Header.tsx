import { Box, Typography } from '@mui/material';
import { RightHeaderPanel } from './RightHeaderPanel';
import { alpha, useTheme } from '@mui/material/styles';

type HeaderProps = {
  title: string;
  username: string;
  sidebarWidth: number;
};

export const Header: React.FC<HeaderProps> = ({ title, username, sidebarWidth }) => {
  const theme = useTheme();
  const borderColor = alpha(theme.palette.secondary.main, 0.35);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: `${sidebarWidth}px`,
        width: `calc(100% - ${sidebarWidth}px)`,
        height: '74px',
        bgcolor: theme.palette.background.paper, // ✅ темнеет в dark
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        borderBottom: `3px solid ${borderColor}`,
        boxShadow: `0px 6px 16px ${alpha(theme.palette.secondary.main, 0.12)}`,
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
        <Box sx={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: 0 }}>
          <Typography
            noWrap
            sx={{
              fontSize: { xs: '32px', sm: '44px', md: '55px' },
              fontWeight: 500,
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: theme.palette.text.primary, // ✅ текст светлый в dark
            }}
          >
            {title}
          </Typography>
        </Box>

        <RightHeaderPanel username={username} />
      </Box>
    </Box>
  );
};
