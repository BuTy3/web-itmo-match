import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, TextField, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import {
  createConstructor,
  createConstructorItem,
  deleteCollection,
  deleteCollectionItem,
  getCollectionDetails,
  getMyCollections,
  loadConstructorState,
  saveConstructorMeta,
  type CollectionDetails,
  type CollectionListItem,
} from '../../shared/api/collections';
import './collections.css';

type CollectionItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  index: number;
};

type Collection = {
  id: number;
  title: string;
  type: string;
  description: string;
  image: string;
  items: CollectionItem[];
};

type ViewMode =
  | 'list'
  | 'collectionForm'
  | 'itemForm'
  | 'collectionDetail'
  | 'itemView';

const gradient = 'linear-gradient(135deg, #ff5f6d 0%, #845bff 100%)';
const sampleImage =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Palace_Bridge_SPB_%28img2%29.jpg/640px-Palace_Bridge_SPB_%28img2%29.jpg';

const defaultDescription =
  'Python developer (разработчик на питоне) — это программист, который использует Python...';

const buildTitle = (value: string | null | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 32) : fallback;
};

const pickCollectionImage = (value: string | null | undefined, items: { url_image?: string | null; urlImage?: string | null }[]) => {
  if (value && value.trim()) return value;
  const firstItemImage = items[0]?.url_image ?? items[0]?.urlImage ?? null;
  if (firstItemImage && firstItemImage.trim()) return firstItemImage;
  return sampleImage;
};

const mapListCollection = (collection: CollectionListItem): Collection => ({
  id: collection.id,
  title: buildTitle(collection.description, 'Коллекция'),
  type: collection.type ?? '',
  description: collection.description ?? '',
  image: pickCollectionImage(collection.url_image, collection.items),
  items: collection.items.map((item) => ({
    id: item.item_id,
    index: item.item_id,
    title: buildTitle(item.description, `Элемент ${item.item_id}`),
    description: item.description ?? '',
    image: item.url_image ?? sampleImage,
  })),
});

const mapDetailsCollection = (collection: CollectionDetails): Collection => ({
  id: collection.id,
  title: buildTitle(collection.description, 'Коллекция'),
  type: 'DEFAULT',
  description: collection.description ?? '',
  image: pickCollectionImage(collection.urlImage, collection.items),
  items: collection.items.map((item) => ({
    id: item.id,
    index: item.id,
    title: buildTitle(item.description, `Элемент ${item.id}`),
    description: item.description ?? '',
    image: item.urlImage ?? sampleImage,
  })),
});

const Card = ({
  title,
  subtitle,
  image,
  onClick,
}: {
  title: string;
  subtitle?: string;
  image: string;
  onClick: () => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: 'pointer',
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

const CollectionsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams<{ '*': string }>();
  const segments = (params['*'] ?? '').split('/').filter(Boolean);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const isConstructor = segments[0] === 'constructor';
  const collectionId = useMemo(() => {
    const raw = isConstructor ? segments[1] : segments[0];
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [isConstructor, segments]);

  const itemId = useMemo(() => {
    const raw = isConstructor ? segments[2] : segments[1];
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [isConstructor, segments]);

  const viewMode: ViewMode = useMemo(() => {
    if (!segments.length) return 'list';
    if (isConstructor && collectionId) return itemId ? 'itemForm' : 'collectionForm';
    if (collectionId) return itemId ? 'itemView' : 'collectionDetail';
    return 'list';
  }, [collectionId, isConstructor, itemId, segments.length]);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [filters, setFilters] = useState({ name: '', type: '' });
  const [collectionForm, setCollectionForm] = useState({
    title: '',
    image: '',
    description: '',
  });
  const [itemForm, setItemForm] = useState({
    title: '',
    image: '',
    description: '',
  });

  const currentItem = useMemo(() => {
    if (!selectedCollection || !itemId) return null;
    return selectedCollection.items.find((it) => it.id === itemId) ?? null;
  }, [selectedCollection, itemId]);

  const nameOptions = useMemo(() => {
    const unique = new Set(collections.map((collection) => collection.title).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [collections]);

  const typeOptions = useMemo(() => {
    const unique = new Set(collections.map((collection) => collection.type).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [collections]);

  const filteredCollections = useMemo(() => {
    return collections.filter((collection) => {
      if (filters.name && collection.title !== filters.name) return false;
      if (filters.type && collection.type !== filters.type) return false;
      return true;
    });
  }, [collections, filters.name, filters.type]);

  const pageSurface = theme.palette.background.paper;
  const panelBorder = `1px solid ${alpha(theme.palette.text.primary, 0.18)}`;

  useEffect(() => {
    if (!accessToken) {
      setCollections([]);
      return;
    }
    if (viewMode !== 'list') return;

    let active = true;
    const load = async () => {
      try {
        const response = await getMyCollections();
        if (!active) return;
        if (response.ok) {
          setCollections(response.collections.map(mapListCollection));
        } else {
          setCollections([]);
        }
      } catch {
        if (!active) return;
        setCollections([]);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [accessToken, viewMode]);

  useEffect(() => {
    if (!accessToken) {
      setSelectedCollection(null);
      return;
    }
    if (!collectionId) return;
    if (viewMode !== 'collectionDetail' && viewMode !== 'itemView') return;

    let active = true;
    const load = async () => {
      try {
        const response = await getCollectionDetails(collectionId);
        if (!active) return;
        if (response.ok) {
          setSelectedCollection(mapDetailsCollection(response.collection));
        } else {
          setSelectedCollection(null);
        }
      } catch {
        if (!active) return;
        setSelectedCollection(null);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [accessToken, collectionId, viewMode]);

  const handleAddCollection = async () => {
    if (!accessToken) return;
    try {
      const response = await createConstructor();
      if (response.ok) {
        navigate(`/collections/constructor/${response.new_id}`);
      }
    } catch {
      // ignore
    }
  };

  const handleOpenCollection = (id: number) => navigate(`/collections/${id}`);
  const handleOpenItem = (colId: number, itId: number) => navigate(`/collections/${colId}/${itId}`);
  const handleBackToList = () => navigate('/collections');
  const handleDeleteCollection = async () => {
    if (!collectionId) return;
    const confirmed = window.confirm('Удалить коллекцию? Это действие нельзя отменить.');
    if (!confirmed) return;
    try {
      const response = await deleteCollection(collectionId);
      if (response.ok) {
        navigate('/collections');
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteItem = async () => {
    if (!collectionId || !itemId) return;
    const confirmed = window.confirm('Удалить элемент коллекции? Это действие нельзя отменить.');
    if (!confirmed) return;
    try {
      const response = await deleteCollectionItem(collectionId, itemId);
      if (response.ok) {
        navigate(`/collections/${collectionId}`);
      }
    } catch {
      // ignore
    }
  };

  const goNextFromCollection = async () => {
    if (!collectionId || !accessToken) return;

    const description =
      collectionForm.description.trim() || collectionForm.title.trim() || defaultDescription;

    try {
      const saved = await saveConstructorMeta(collectionId, {
        description,
        url_image: collectionForm.image.trim() || null,
      });

      if (!saved.ok) return;

      const state = await loadConstructorState(saved.new_id);
      if (state.ok) {
        navigate(`/collections/constructor/${state.new_id}/${state.item_id}`);
      }
    } catch {
      // ignore
    }
  };

  const saveItem = async (finish: boolean) => {
    if (!collectionId || !accessToken) return;

    const description = itemForm.description.trim() || itemForm.title.trim() || 'Описание...';
    const payload = {
      item_id: itemId,
      description,
      url_image: itemForm.image.trim() || null,
      next: !finish,
      save_exit: finish,
    };

    try {
      const response = await createConstructorItem(payload);

      if (!response.ok) return;

      if ('collection_id' in response) {
        setItemForm({ title: '', image: '', description: '' });
        navigate(`/collections/${response.collection_id}`);
        return;
      }

      const nextItemId = response.item_id + 1;
      setItemForm({ title: '', image: '', description: '' });
      navigate(`/collections/constructor/${collectionId}/${nextItemId}`);
    } catch {
      // ignore
    }
  };

  const renderList = () => (
    <Box
      sx={{
        backgroundColor: pageSurface,
        border: panelBorder,
        p: 3,
      }}
    >
      <Typography sx={{ fontSize: 28, fontWeight: 700 }}>Коллекции</Typography>

      <div className="collections-filters">
        <select
          className={`collections-filter collections-filter--select${
            filters.name ? ' collections-filter--active' : ''
          }`}
          value={filters.name}
          onChange={(event) => setFilters((prev) => ({ ...prev, name: event.target.value }))}
          aria-label="Фильтр по названию"
        >
          <option value="">Название</option>
          {nameOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          className={`collections-filter collections-filter--select${
            filters.type ? ' collections-filter--active' : ''
          }`}
          value={filters.type}
          onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
          aria-label="Фильтр по типу"
        >
          <option value="">Тип</option>
          {typeOptions.map((type) => (
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
        {filteredCollections.map((c) => (
          <Card
            key={c.id}
            title={c.title}
            subtitle={c.type}
            image={c.image}
            onClick={() => handleOpenCollection(c.id)}
          />
        ))}

        <Box
          onClick={() => void handleAddCollection()}
          sx={{
            cursor: 'pointer',
            borderRadius: 2,
            width: 170,
            minHeight: 200,
            background: gradient,
            color: '#fff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            fontWeight: 700,
            userSelect: 'none',
          }}
        >
          +
        </Box>
      </Box>
    </Box>
  );

  const renderCollectionForm = () => (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 3 }}>Коллекции</Typography>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Название"
            value={collectionForm.title}
            onChange={(e) => setCollectionForm((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            label="Ссылка на картинку"
            value={collectionForm.image}
            onChange={(e) => setCollectionForm((p) => ({ ...p, image: e.target.value }))}
          />
          <TextField
            label="Описание"
            multiline
            minRows={5}
            value={collectionForm.description}
            onChange={(e) => setCollectionForm((p) => ({ ...p, description: e.target.value }))}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', mt: 1 }}>
            <Button variant="contained" onClick={() => void goNextFromCollection()}>
              Перейти далее
            </Button>
            <Button variant="outlined" onClick={handleBackToList}>
              Вернуться к коллекциям
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            width: 200,
            height: 220,
            borderRadius: 2,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 22,
            fontWeight: 500,
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
            userSelect: 'none',
          }}
        >
          Ваше фото
        </Box>
      </Box>
    </Box>
  );

  const renderItemForm = () => (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 3 }}>Коллекции</Typography>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Название элемента"
            value={itemForm.title}
            onChange={(e) => setItemForm((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            label="Ссылка на картинку"
            value={itemForm.image}
            onChange={(e) => setItemForm((p) => ({ ...p, image: e.target.value }))}
          />
          <TextField
            label="Описание"
            multiline
            minRows={5}
            value={itemForm.description}
            onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', mt: 1 }}>
            <Button variant="outlined" onClick={() => void saveItem(false)}>
              Создать ещё
            </Button>
            <Button variant="contained" onClick={() => void saveItem(true)}>
              Сохранить и закончить
            </Button>
            <Button variant="outlined" onClick={handleBackToList}>
              Вернуться к коллекциям
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 200,
              height: 220,
              borderRadius: 2,
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 22,
              fontWeight: 500,
              textAlign: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
              userSelect: 'none',
            }}
          >
            Ваше фото
          </Box>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            Элемент номер: {itemId ?? 1}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const renderCollectionDetail = () => {
    if (!selectedCollection) return null;

    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 2 }}>Коллекции</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
                {selectedCollection.title}
              </Typography>
              <Button variant="outlined" onClick={handleBackToList}>
                К коллекциям
              </Button>
              <Button variant="outlined" color="error" onClick={() => void handleDeleteCollection()}>
                Удалить
              </Button>
            </Box>
            <Typography sx={{ whiteSpace: 'pre-line', color: 'text.primary' }}>
              {selectedCollection.description}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={selectedCollection.image}
              alt={selectedCollection.title}
              sx={{ width: 200, height: 200, borderRadius: 2, objectFit: 'cover' }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            mt: 3,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 170px))',
            gap: 2,
          }}
        >
          {selectedCollection.items.map((it) => (
            <Card
              key={it.id}
              title={it.title}
              subtitle={it.description}
              image={it.image}
              onClick={() => handleOpenItem(selectedCollection.id, it.id)}
            />
          ))}
        </Box>
      </Box>
    );
  };

  const renderItemView = () => {
    if (!selectedCollection || !currentItem) return null;

    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 2 }}>Коллекции</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
                {currentItem.title}
              </Typography>
              <Button variant="outlined" onClick={() => handleOpenCollection(selectedCollection.id)}>
                К коллекции
              </Button>
              <Button variant="outlined" color="error" onClick={() => void handleDeleteItem()}>
                Удалить
              </Button>
            </Box>

            <Typography sx={{ whiteSpace: 'pre-line', color: 'text.primary' }}>
              {currentItem.description}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={currentItem.image}
              alt={currentItem.title}
              sx={{ width: 200, height: 200, borderRadius: 2, objectFit: 'cover' }}
            />
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              Элемент номер: {currentItem.index}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  if (viewMode === 'collectionForm') return renderCollectionForm();
  if (viewMode === 'itemForm') return renderItemForm();
  if (viewMode === 'collectionDetail') return renderCollectionDetail();
  if (viewMode === 'itemView') return renderItemView();
  return renderList();
};

export default CollectionsPage;
