import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

const LOGO_SIZE = 90; // внешний квадрат
const TILE_RADIUS = 2; // скругление углов квадратиков — можешь подбирать 4–8

export function BrandLogo() {
  const theme = useTheme();
  const primaryGradient = `linear-gradient(180deg, ${
    theme.palette.primary.main
  } 0%, ${alpha(theme.palette.primary.main, 0.45)} 100%)`;
  const secondaryGradient = `linear-gradient(180deg, ${
    theme.palette.secondary.main
  } 0%, ${alpha(theme.palette.secondary.main, 0.45)} 100%)`;

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
          background: secondaryGradient,
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
          background: primaryGradient,
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
          background: secondaryGradient,
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
          background: primaryGradient,
        }}
      />
    </Box>
  );
}
