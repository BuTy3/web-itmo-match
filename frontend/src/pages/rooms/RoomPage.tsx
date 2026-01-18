import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Avatar, CircularProgress } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { getRoomVotingState, submitVote, leaveRoom } from '../../shared/api/rooms';
import type { RoomVotingState, VotingItem } from '../../shared/api/types';
import './rooms.css';

export const RoomPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomVotingState | null>(null);
  const [currentItem, setCurrentItem] = useState<VotingItem | null>(null);
  const [voting, setVoting] = useState(false);

  const loadRoomState = useCallback(async () => {
    if (!id) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);

    const response = await getRoomVotingState(id);

    if (!response.ok || !response.data) {
      setError(response.message || 'Ошибка загрузки комнаты');
      setLoading(false);
      return;
    }

    setRoomState(response.data);
    setCurrentItem(response.data.current_item);

    // If voting already finished, redirect to results
    if (response.data.all_finished) {
      navigate(`/rooms/${id}/results`);
      return;
    }

    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    void loadRoomState();
  }, [loadRoomState]);

  const handleVote = async (vote: boolean) => {
    if (!id || !currentItem || voting) return;

    setVoting(true);

    const response = await submitVote(id, currentItem.id, vote);

    if (!response.ok) {
      setError(response.message || 'Ошибка при голосовании');
      setVoting(false);
      return;
    }

    // Handle redirect based on response
    if (response.redirect_to) {
      switch (response.redirect_to) {
        case 'drawing':
          navigate(`/rooms/${id}/drawing`);
          return;
        case 'drawing_res':
          navigate(`/rooms/${id}/drawing_res`);
          return;
        case 'results':
          navigate(`/rooms/${id}/results`);
          return;
      }
    }

    // If all finished, go to results
    if (response.all_finished) {
      navigate(`/rooms/${id}/results`);
      return;
    }

    // If user finished but others haven't, go to drawing
    if (response.is_finished && !response.all_finished) {
      navigate(`/rooms/${id}/drawing`);
      return;
    }

    // Otherwise, show next item
    if (response.next_item) {
      setCurrentItem(response.next_item);
    } else if (response.is_finished) {
      // User finished voting
      navigate(`/rooms/${id}/drawing`);
      return;
    }

    setVoting(false);
  };

  const handleLeaveRoom = async () => {
    if (!id) return;

    const response = await leaveRoom(id);
    if (response.ok) {
      navigate('/');
    } else {
      setError(response.message || 'Ошибка при выходе');
    }
  };

  if (loading) {
    return (
      <Box className="room-page" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error || !roomState) {
    return (
      <Box className="room-page" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Ошибка
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {error || 'Комната не найдена'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Вернуться на главную
        </Button>
      </Box>
    );
  }

  if (!currentItem) {
    return (
      <Box className="room-page" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Голосование завершено
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Ожидаем остальных участников...
        </Typography>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box className="room-page">
      {/* Voting Card */}
      <Box
        className="voting-card"
        sx={{
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.secondary.main, 0.3)} 100%)`,
          borderRadius: 3,
          overflow: 'hidden',
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header with avatar and nickname */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.2),
          }}
        >
          <Avatar
            src={currentItem.suggested_by.avatar_url || undefined}
            sx={{ width: 40, height: 40, bgcolor: 'white' }}
          />
          <Typography variant="subtitle1" fontWeight={500}>
            {currentItem.suggested_by.display_name}
          </Typography>
        </Box>

        {/* Image */}
        <Box
          sx={{
            width: '100%',
            height: 280,
            overflow: 'hidden',
          }}
        >
          {currentItem.image_url ? (
            <img
              src={currentItem.image_url}
              alt={currentItem.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.grey[500], 0.2),
              }}
            >
              <Typography color="text.secondary">Нет изображения</Typography>
            </Box>
          )}
        </Box>

        {/* Title */}
        <Box
          sx={{
            p: 2.5,
            background: `linear-gradient(180deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            {currentItem.title}
          </Typography>
        </Box>
      </Box>

      {/* Vote Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="contained"
          onClick={() => handleVote(false)}
          disabled={voting}
          sx={{
            bgcolor: '#E57373',
            color: 'white',
            px: 5,
            py: 1.2,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#EF5350',
            },
            '&:disabled': {
              bgcolor: alpha('#E57373', 0.5),
              color: 'white',
            },
          }}
        >
          Нет
        </Button>
        <Button
          variant="contained"
          onClick={() => handleVote(true)}
          disabled={voting}
          sx={{
            bgcolor: '#81C784',
            color: 'white',
            px: 5,
            py: 1.2,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#66BB6A',
            },
            '&:disabled': {
              bgcolor: alpha('#81C784', 0.5),
              color: 'white',
            },
          }}
        >
          Да
        </Button>
      </Box>

      {/* Leave Room Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleLeaveRoom}
          sx={{
            background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            px: 4,
            py: 1,
            borderRadius: 3,
            fontSize: '0.95rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              background: `linear-gradient(90deg, ${alpha(theme.palette.secondary.main, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
            },
          }}
        >
          Выйти из комнаты
        </Button>
      </Box>
    </Box>
  );
};

