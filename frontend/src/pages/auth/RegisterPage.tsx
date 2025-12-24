import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../../shared/api/auth';
import type { AppDispatch } from '../../app/store';
import { loginSuccess } from '../../features/auth/model/authSlice';
import { ThemeToggleButton } from '../../shared/ui/header/ThemeToggleButton';

export const RegisterPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

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
      if (resp.ok && resp.token) {
        dispatch(loginSuccess({ user: { login }, accessToken: resp.token }));
        setSuccess('Пользователь создан');
        localStorage.setItem('nickname', login);
        localStorage.setItem('accessToken', resp.token);
        navigate('/');
        setLogin('');
        setPassword('');
        setPasswordRepeat('');
      } else {
        setError(resp.message || 'Не удалось зарегистрироваться');
      }
    } catch (error) {
      console.error('Register request failed', error);
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
          height: 'min(878px, calc(100dvh - 64px))',
          maxHeight: 'calc(100dvh - 32px)',
          borderRadius: 4,
          p: { xs: 2, sm: 4, md: 5 },
          bgcolor: 'rgba(255,255,255,0.94)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <ThemeToggleButton
          sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
          menuSx={{ top: 'calc(100% + 12px)', right: 0 }}
        />

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            height: '100%',
            width: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack
            spacing={0}
            alignItems="center"
            sx={{ gap: { xs: 2, sm: 2.5, md: 3 }, my: 'auto' }}
          >
            <Box
              component="img"
              src="/itmo-logo-1.png"
              alt="ITMO"
              sx={{ maxWidth: 360, width: '100%', height: 'auto' }}
            />

            <Stack spacing={0} sx={{ maxWidth: 520, width: '100%', gap: { xs: 1.5, md: 2 } }}>
              <TextField
                label="Никнейм"
                fullWidth
                size="small"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
              <TextField
                label="Пароль"
                type="password"
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="Повторите пароль"
                type="password"
                fullWidth
                size="small"
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
            <Stack spacing={0} sx={{ maxWidth: 520, width: '100%', gap: { xs: 1.25, md: 1.5 } }}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                fullWidth
                sx={{ py: { xs: 1.25, md: 1.6 }, fontSize: { xs: 14, md: 16 } }}
              >
                Уже зарегистрирован
              </Button>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: { xs: 1.25, md: 1.6 }, fontSize: { xs: 14, md: 16 } }}
              >
                Зарегистрироваться
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" align="center">
              <MuiLink
                href="https://docs.google.com/forms/d/e/1FAIpQLSeIP1uebWz4RujMdUqtLVDX5pBTkmBfpwCqq3Sn3ZLL9h5c2A/viewform?usp=dialog"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
              >
                Если возникли проблемы, напишите сюда
              </MuiLink>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};
