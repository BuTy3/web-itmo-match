import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { getReadyCollections, searchRoom } from '../../shared/api/home';
import type { HomeCollection } from '../../shared/api/types';
import '../history/history.css';

export const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<HomeCollection[]>([]);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [collectionFilters, setCollectionFilters] = useState({
    description: '',
    type: '',
    items: 'all',
  });
  const [roomId, setRoomId] = useState('');
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
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

  useEffect(() => {
    let mounted = true;

    const loadCollections = async () => {
      try {
        const resp = await getReadyCollections();
        if (!mounted) return;
        if (resp.ok) {
          setCollections(resp.collections);
          setCollectionsError(null);
        } else {
          setCollectionsError(resp.message || 'Не удалось загрузить коллекции');
        }
      } catch (error) {
        console.error('Failed to load ready collections', error);
        if (mounted) {
          setCollectionsError('Не удалось загрузить коллекции');
        }
      }
    };

    loadCollections();

    return () => {
      mounted = false;
    };
  }, []);

  const collectionTypeOptions = useMemo(() => {
    const unique = new Set(collections.map((collection) => collection.type).filter(Boolean));
    return Array.from(unique) as string[];
  }, [collections]);

  const filteredCollections = useMemo(() => {
    return collections.filter((collection) => {
      if (
        collectionFilters.description &&
        !(collection.description ?? '')
          .toLowerCase()
          .includes(collectionFilters.description.toLowerCase())
      ) {
        return false;
      }
      if (collectionFilters.type && collection.type !== collectionFilters.type) return false;
      if (collectionFilters.items === 'with' && collection.items.length === 0) return false;
      if (collectionFilters.items === 'empty' && collection.items.length > 0) return false;
      return true;
    });
  }, [collections, collectionFilters]);

  const previewCollections = useMemo(
    () => filteredCollections.slice(0, 6),
    [filteredCollections],
  );

  const handleSearchRoom = async () => {
    setRoomError(null);
    const idNum = Number(roomId);

    if (!Number.isFinite(idNum) || idNum <= 0 || !Number.isInteger(idNum)) {
      setRoomError('Введите корректный id комнаты');
      return;
    }

    try {
      setRoomLoading(true);
      const resp = await searchRoom({ id: idNum });
      if (resp.ok) {
        navigate(`/rooms/connect/${resp.id_room}`);
      } else {
        setRoomError(resp.message || 'Комната не найдена');
      }
    } catch (error) {
      console.error('Room search failed', error);
      setRoomError('Не удалось найти комнату');
    } finally {
      setRoomLoading(false);
    }
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
            inputProps={{ inputMode: 'numeric' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchRoom}
            disabled={roomLoading}
          >
            Найти комнату
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/history')}
          >
            История комнат
          </Button>
        </Stack>

        {roomError && (
          <Alert severity="error" sx={{ maxWidth: 420 }}>
            {roomError}
          </Alert>
        )}
      </Box>

      {/* Блок "Коллекции" */}
      <Box sx={collectionsPanelStyles}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Коллекции
        </Typography>

        {collectionsError && (
          <Alert severity="error" sx={{ maxWidth: 520, mb: 2 }}>
            {collectionsError}
          </Alert>
        )}

        <div className="history-filters">
          <input
            className={`history-filter${
              collectionFilters.description ? ' history-filter--active' : ''
            }`}
            type="text"
            placeholder="Описание"
            aria-label="Фильтр по описанию"
            value={collectionFilters.description}
            onChange={(event) =>
              setCollectionFilters((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
          <select
            className={`history-filter history-filter--select${
              collectionFilters.type ? ' history-filter--active' : ''
            }`}
            aria-label="Фильтр по типу"
            value={collectionFilters.type}
            onChange={(event) =>
              setCollectionFilters((prev) => ({
                ...prev,
                type: event.target.value,
              }))
            }
          >
            <option value="">Тип</option>
            {collectionTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            className={`history-filter history-filter--select${
              collectionFilters.items !== 'all' ? ' history-filter--active' : ''
            }`}
            aria-label="Фильтр по наличию элементов"
            value={collectionFilters.items}
            onChange={(event) =>
              setCollectionFilters((prev) => ({
                ...prev,
                items: event.target.value,
              }))
            }
          >
            <option value="all">Все коллекции</option>
            <option value="with">С элементами</option>
            <option value="empty">Без элементов</option>
          </select>
        </div>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {previewCollections.map((collection) => (
            <Box
              key={collection.id}
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={collection.url_image ?? '/itmo-logo-1.png'}
                alt={collection.description ?? 'Коллекция'}
                sx={{ width: '100%', height: 140, objectFit: 'cover' }}
              />
              <Box sx={{ p: 1.5 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {collection.type ?? 'Без типа'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {collection.description ?? 'Нет описания'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
