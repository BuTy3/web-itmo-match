import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import { getRoomResults } from '../../shared/api/rooms';
import type { MatchedItem } from '../../shared/api/types';
import './rooms.css';

export const RoomResultsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMatch, setHasMatch] = useState(false);
  const [matchedItems, setMatchedItems] = useState<MatchedItem[]>([]);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    let cancelled = false;

    const loadResults = async () => {
      setLoading(true);
      setError(null);

      const response = await getRoomResults(id);

      if (cancelled) return;

      if (!response.ok) {
        setError(response.message || 'Не удалось загрузить результаты');
        setLoading(false);
        return;
      }

      setHasMatch(response.has_match);
      setMatchedItems(response.matched_items);
      setLoading(false);
    };

    void loadResults();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <Box
        className="room-results-page"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="room-results-page" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Ошибка
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Вернуться на главную
        </Button>
      </Box>
    );
  }

  // No match state
  if (!hasMatch) {
    return (
      <Box
        className="room-results-page"
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography className="no-match-title">
          Совпадений не было :(
        </Typography>
        <Typography className="no-match-subtitle">
          Но не стоит расстраиваться,
          <br />
          можете попробовать запустить выбор
          <br />
          с другой коллекцией
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 4 }}
        >
          На главную
        </Button>
      </Box>
    );
  }

  // Match state - single or multiple items
  const isSingle = matchedItems.length === 1;

  return (
    <Box className="room-results-page">
      {/* Match Title */}
      <Box className="match-title">
        <span>Match!</span>
        <CheckIcon className="match-checkmark" sx={{ fontSize: '4rem' }} />
      </Box>

      {/* Subtitle */}
      <Typography className="match-subtitle">
        Все проголосовали именно за {isSingle ? 'эту карточку' : 'эти карточки'}{' '}
        🎉
      </Typography>

      {/* Matched Cards */}
      <Box className="results-cards-container">
        {matchedItems.map((item) => (
          <Box
            key={item.id}
            className="result-card"
            sx={{
              background: `linear-gradient(180deg, transparent 0%, transparent 60%, ${theme.palette.secondary.main} 60%, ${theme.palette.primary.main} 100%)`,
            }}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="result-card-image"
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 220,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.200',
                }}
              >
                <Typography color="text.secondary">Нет изображения</Typography>
              </Box>
            )}
            <Box
              className="result-card-content"
              sx={{
                background: `linear-gradient(180deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
              }}
            >
              <Typography className="result-card-title">{item.title}</Typography>
              {item.description && (
                <Typography className="result-card-description">
                  {item.description}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Back button */}
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{ mt: 5 }}
      >
        На главную
      </Button>
    </Box>
  );
};

