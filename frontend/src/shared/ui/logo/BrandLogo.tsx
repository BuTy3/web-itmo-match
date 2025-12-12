import { Box } from '@mui/material';

const LOGO_SIZE = 90;          // внешний квадрат
const TILE_RADIUS = 2;         // скругление углов квадратиков — можешь подбирать 4–8

export function BrandLogo() {
  return (
    <Box
      sx={{
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ЛЕВЫЙ ВЕРХНИЙ — красный, 30×37.5, X=7.5, Y=7.5 */}
      <Box
        sx={{
          position: 'absolute',
          left: 7.5,
          top: 7.5,
          width: 30,
          height: 37.5,
          borderRadius: TILE_RADIUS,
          background: 'linear-gradient(180deg, #F32222 0%, #E67171 100%)',
        }}
      />

      {/* ПРАВЫЙ ВЕРХНИЙ — синий, 30×22.5, X=52.5, Y=7.5 */}
      <Box
        sx={{
          position: 'absolute',
          left: 52.5,
          top: 7.5,
          width: 30,
          height: 22.5,
          borderRadius: TILE_RADIUS,
          background: 'linear-gradient(180deg, #4225F4 0%, #2488D1 84%)',
        }}
      />

      {/* ЛЕВЫЙ НИЖНИЙ — красный, 30×22.5, X=7.5, Y=60 */}
      <Box
        sx={{
          position: 'absolute',
          left: 7.5,
          top: 60,
          width: 30,
          height: 22.5,
          borderRadius: TILE_RADIUS,
          background: 'linear-gradient(180deg, #F32222 0%, #E67171 100%)',
        }}
      />

      {/* ПРАВЫЙ НИЖНИЙ — синий, 30×37.5, X=52.5, Y=45 */}
      <Box
        sx={{
          position: 'absolute',
          left: 52.5,
          top: 45,
          width: 30,
          height: 37.5,
          borderRadius: TILE_RADIUS,
          background: 'linear-gradient(180deg, #4225F4 0%, #2488D1 84%)',
        }}
      />
    </Box>
  );
}
