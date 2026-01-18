import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../app/store';
import { setThemeColor, type ThemeColorKey } from '../../../features/ui/model/uiSlice';

const COLOR_GROUPS: Array<{
  key: ThemeColorKey;
  label: string;
  colors: string[];
}> = [
  {
    key: 'primary',
    label: 'Основной цвет 1',
    colors: ['#4124F4', '#CC30EF', '#DCEF30'],
  },
  {
    key: 'secondary',
    label: 'Основной цвет 2',
    colors: ['#3AEF30', '#4124F4', '#EF3030'],
  },
];

export const ThemeMenu = ({ sx }: { sx?: SxProps<Theme> }) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedColors = useSelector(
    (state: RootState) => state.ui.themeColors,
  );
  const theme = useTheme();

  const handleSelect = (key: ThemeColorKey, color: string) => {
    dispatch(setThemeColor({ key, color }));
  };

  return (
    <Box
      sx={{
        width: 248,
        minHeight: 215,
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        backgroundColor: theme.palette.background.paper,
        borderRadius: '12px',
        boxShadow: theme.shadows[6],
        p: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 3000,
        border: `1px solid ${theme.palette.divider}`,
        ...sx,
      }}
    >
      {COLOR_GROUPS.map((group) => (
        <Box key={group.key}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
            {group.label}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {group.colors.map((color) => (
              <ColorSwatch
                key={`${group.key}-${color}`}
                color={color}
                selected={selectedColors[group.key] === color}
                onClick={() => handleSelect(group.key, color)}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

type ColorSwatchProps = {
  color: string;
  selected: boolean;
  onClick: () => void;
};

const ColorSwatch = ({ color, selected, onClick }: ColorSwatchProps) => {
  const theme = useTheme();
  const borderColor = selected ? theme.palette.text.primary : theme.palette.divider;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        width: 32,
        height: 32,
        borderRadius: '8px',
        backgroundColor: color,
        cursor: 'pointer',
        border: selected ? `2px solid ${borderColor}` : `1px solid ${borderColor}`,
        outline: selected ? `2px solid ${color}` : 'none',
        outlineOffset: '2px',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: selected ? theme.shadows[3] : 'none',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[4],
        },
      }}
    />
  );
};
