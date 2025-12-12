import { useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { register } from '../../shared/api/auth';

export const RegisterPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!login || !password) {
      setError('Заполните все поля');
      return;
    }

    if (password !== passwordRepeat) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setLoading(true);
      const resp = await register({ login, password });
      if (resp.ok) {
        setSuccess('Пользователь создан');
        setLogin('');
        setPassword('');
        setPasswordRepeat('');
      } else {
        setError(resp.message || 'Не удалось зарегистрироваться');
      }
    } catch (err) {
      setError('Ошибка запроса. Проверьте соединение с сервером.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background: 'linear-gradient(135deg, #cf2d3a 0%, #5b2bc4 100%)',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 676,
          minHeight: 878,
          borderRadius: 4,
          p: { xs: 3, sm: 5 },
          bgcolor: 'rgba(255,255,255,0.94)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              ITMO
            </Typography>

            <Stack spacing={2} sx={{ maxWidth: 520, width: '100%' }}>
              <TextField
                label="Никнейм"
                fullWidth
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
              <TextField
                label="Пароль"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="Повторите пароль"
                type="password"
                fullWidth
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
              />
            </Stack>

            {error && (
              <Alert severity="error" sx={{ maxWidth: 520, width: '100%' }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ maxWidth: 520, width: '100%' }}>
                {success}
              </Alert>
            )}

            <Stack spacing={1.5} sx={{ maxWidth: 520, width: '100%' }}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                fullWidth
              >
                Уже зарегистрирован
              </Button>

              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                Зарегистрироваться
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" align="center">
              Если возникли проблемы, напишите сюда
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};
