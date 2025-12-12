import { Box, Typography, TextField, Button, Stack } from '@mui/material';

export const HomePage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Заголовок страницы */}
      <Typography variant="h4" sx={{ mb: 3 }}>
        Главная
      </Typography>

      {/* Блок "Комнаты" */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Комнаты
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Введите id"
            sx={{ maxWidth: 260 }}
          />
          <Button variant="contained">Создать комнату</Button>
          <Button variant="outlined">История комнат</Button>
        </Stack>
      </Box>

      {/* Блок "Коллекции" */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Коллекции
        </Typography>

        {/* сюда потом добавите фильтры и карточки по макету */}
      </Box>
    </Box>
  );
};
