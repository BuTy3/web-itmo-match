import { Box, Typography, TextField, Button, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const roomsPanelStyles = {
    p: 3,
    borderRadius: 3,
    border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
    backgroundColor: alpha(theme.palette.secondary.main, 0.08),
  };
  const collectionsPanelStyles = {
    p: 3,
    borderRadius: 3,
    border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Заголовок страницы */}
      <Typography variant="h4" sx={{ mb: 3 }}>
        Главная
      </Typography>

      {/* Блок "Комнаты" */}
      <Box sx={roomsPanelStyles}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Комнаты
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Введите id"
            sx={{ maxWidth: 260 }}
            color="secondary"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              const trimmed = roomId.trim();
              if (!trimmed) return;
              navigate(`/rooms/connect/${trimmed}`);
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/rooms/create')}
          >
            Создать комнату
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/history')}
          >
            История комнат
          </Button>
        </Stack>
      </Box>

      {/* Блок "Коллекции" */}
      <Box sx={collectionsPanelStyles}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Коллекции
        </Typography>

        {/* сюда потом добавите фильтры и карточки по макету */}
      </Box>
    </Box>
  );
};
