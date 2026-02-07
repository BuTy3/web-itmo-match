import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { getUserCollections } from '../../shared/api/home';
import type { HomeCollection } from '../../shared/api/types';
import '../history/history.css';

const gradient = 'linear-gradient(135deg, #ff5f6d 0%, #845bff 100%)';
const sampleImage =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Palace_Bridge_SPB_%28img2%29.jpg/640px-Palace_Bridge_SPB_%28img2%29.jpg';

const buildTitle = (value: string | null | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 32) : fallback;
};

const pickCollectionImage = (collection: HomeCollection) => {
  if (collection.url_image && collection.url_image.trim()) return collection.url_image;
  const firstItemImage = collection.items[0]?.url_image ?? null;
  if (firstItemImage && firstItemImage.trim()) return firstItemImage;
  return sampleImage;
};

const Card = ({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle?: string;
  image: string;
}) => (
  <Box
    sx={{
      borderRadius: 2,
      overflow: 'hidden',
      background: gradient,
      color: '#fff',
      boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
      width: 170,
      minHeight: 200,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Box
      sx={{
        height: 90,
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0,
      }}
    />
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ fontWeight: 700, fontSize: 16, lineHeight: '20px' }}>{title}</Box>
      {subtitle ? (
        <Box sx={{ fontSize: 13, opacity: 0.85, lineHeight: '16px' }}>{subtitle}</Box>
      ) : null}
    </Box>
  </Box>
);

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
        const resp = await getUserCollections();
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Главная
      </Typography>

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

      <Box sx={collectionsPanelStyles}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Коллекции
        </Typography>

        {collectionsError && (
          <Alert severity="error" sx={{ maxWidth: 520, mb: 2 }}>
            {collectionsError}
          </Alert>
        )}

        <div className="history-filters" style={{ marginBottom: 18 }}>
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
        </div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 170px))',
            gap: 2,
          }}
        >
          {previewCollections.map((collection) => (
            <Box
              key={collection.id}
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/collections/${collection.id}`)}
            >
              <Card
                title={buildTitle(collection.description, 'Коллекция')}
                subtitle={collection.type ?? undefined}
                image={pickCollectionImage(collection)}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
