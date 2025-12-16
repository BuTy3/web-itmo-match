import { Box, Typography } from '@mui/material';

export const ThemeMenu = () => {
  return (
    <Box
      sx={{
        width: '160px',
        height: '195px',
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: '0px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        p: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        zIndex: 3000,
      }}
    >
      {/* Color 1 */}
      <Typography sx={{ fontSize: '18px', fontWeight: 500 }}>
        Цвет 1
      </Typography>
      <Box sx={{ display: 'flex', gap: '10px' }}>
        <ColorSwatch color="#4124F4" />
        <ColorSwatch color="#CC30EF" />
        <ColorSwatch color="#DCEF30" />
      </Box>

      {/* Color 2 */}
      <Typography sx={{ fontSize: '18px', fontWeight: 500 }}>
        Цвет 2
      </Typography>
      <Box sx={{ display: 'flex', gap: '10px' }}>
        <ColorSwatch color="#3AEF30" />
        <ColorSwatch color="#4124F4" />
        <ColorSwatch color="#EF3030" />
      </Box>

      {/* Background */}
      <Typography sx={{ fontSize: '18px', fontWeight: 500 }}>
        Фон
      </Typography>
      <Box sx={{ display: 'flex', gap: '10px' }}>
        <ColorSwatch color="#0E0C1B" />
        <ColorSwatch color="#5E5E5E" />
        <ColorSwatch color="#EFEEEE" />
      </Box>
    </Box>
  );
};

const ColorSwatch = ({ color }: { color: string }) => (
  <Box
    sx={{
      width: '24px',
      height: '24px',
      borderRadius: '4px',
      backgroundColor: color,
      cursor: 'pointer',
      border: '1px solid #cccccc',
      '&:hover': { opacity: 0.8 },
    }}
  />
);
