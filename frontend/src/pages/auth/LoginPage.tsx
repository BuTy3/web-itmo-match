import { useEffect, useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../shared/api/auth';
import type { RootState, AppDispatch } from '../../app/store';
import { loginSuccess } from '../../features/auth/model/authSlice';
import { ThemeToggleButton } from '../../shared/ui/header/ThemeToggleButton';
import { METRIKA_GOALS, trackGoal } from '../../shared/lib/analytics/metrika';

export const LoginPage = () => {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const authFieldSx = {
    '& .MuiInputBase-input': { color: '#1f1f1f' },
    '& .MuiInputLabel-root': { color: '#1f1f1f' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1f1f1f' },
  };

  useEffect(() => {
    if (accessToken) {
      navigate('/home', { replace: true });
    }
  }, [accessToken, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginValue || !password) {
      trackGoal(METRIKA_GOALS.AuthLoginFailure, {
        reason: 'empty_fields',
      });
      setError('Заполните все поля');
      return;
    }

    try {
      trackGoal(METRIKA_GOALS.AuthLoginAttempt, {
        has_login: Boolean(loginValue.trim()),
      });
      setLoading(true);
      const resp = await login({ login: loginValue, password });
      if (resp.ok && resp.token) {
        trackGoal(METRIKA_GOALS.AuthLoginSuccess);
        dispatch(loginSuccess({ user: { login: loginValue }, accessToken: resp.token }));
        setSuccess('Успешный вход');
        localStorage.setItem('nickname', loginValue);
        localStorage.setItem('accessToken', resp.token);
        navigate('/home');
      } else {
        trackGoal(METRIKA_GOALS.AuthLoginFailure, {
          reason: resp.message ?? 'invalid_credentials',
        });
        setError(resp.message || 'Неверный логин или пароль');
      }
    } catch (error) {
      trackGoal(METRIKA_GOALS.AuthLoginFailure, { reason: 'request_failed' });
      console.error('Login request failed', error);
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
                sx={authFieldSx}
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
              />
              <TextField
                label="Пароль"
                type="password"
                fullWidth
                size="small"
                sx={authFieldSx}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: { xs: 1.25, md: 1.6 }, fontSize: { xs: 14, md: 16 } }}
              >
                Войти
              </Button>

              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                fullWidth
                onClick={() =>
                  trackGoal(METRIKA_GOALS.AuthRegisterAttempt, { source: 'login_page_link' })
                }
                sx={{ py: { xs: 1.25, md: 1.6 }, fontSize: { xs: 14, md: 16 } }}
              >
                Регистрация
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
