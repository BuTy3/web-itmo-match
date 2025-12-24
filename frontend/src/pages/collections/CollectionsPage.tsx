
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, TextField, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

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

const createMockItems = (): CollectionItem[] =>
  Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    index: i + 1,
    title: 'Название',
    description: 'Описание описание описание...',
    image: sampleImage,
  }));

const createMockCollections = (): Collection[] =>
  Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: 'Название',
    type: 'Тип тип тип',
    description: defaultDescription,
    image: sampleImage,
    items: createMockItems(),
  }));

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

  // ✅ FIX: корректный парсинг wildcard для routes: 'collections/*'
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

  const [collections, setCollections] = useState<Collection[]>(createMockCollections);
  const [drafts, setDrafts] = useState<Record<string, Collection>>({});
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

  const nextId = useMemo(
    () => Math.max(0, ...collections.map((c) => c.id)) + 1,
    [collections],
  );

  // drafts init
  useEffect(() => {
    if (!isConstructor || !collectionId) return;
    const key = String(collectionId);
    setDrafts((prev) =>
      prev[key]
        ? prev
        : {
            ...prev,
            [key]: {
              id: collectionId,
              title: '',
              type: 'Тип тип тип',
              description: '',
              image: '',
              items: [],
            },
          },
    );
  }, [isConstructor, collectionId]);

  const selectedCollection = useMemo(() => {
    if (!collectionId || isConstructor) return null;
    return collections.find((c) => c.id === collectionId) ?? null;
  }, [collections, collectionId, isConstructor]);

  const draft = useMemo(() => {
    if (!collectionId) return null;
    return drafts[String(collectionId)] ?? null;
  }, [collectionId, drafts]);

  const currentItem = useMemo(() => {
    if (!selectedCollection || !itemId) return null;
    return selectedCollection.items.find((it) => it.id === itemId) ?? null;
  }, [selectedCollection, itemId]);

  const pageSurface = theme.palette.background.paper;
  const panelBorder = `1px solid ${alpha(theme.palette.text.primary, 0.18)}`;

  const handleAddCollection = () => navigate(`/collections/constructor/${nextId}`);
  const handleOpenCollection = (id: number) => navigate(`/collections/${id}`);
  const handleOpenItem = (colId: number, itId: number) => navigate(`/collections/${colId}/${itId}`);
  const handleBackToList = () => navigate('/collections');

  const saveCollectionDraft = () => {
    if (!collectionId) return;
    const key = String(collectionId);
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? {
          id: collectionId,
          title: '',
          type: 'Тип тип тип',
          description: '',
          image: '',
          items: [],
        }),
        title: collectionForm.title || 'Название',
        image: collectionForm.image || sampleImage,
        description: collectionForm.description || defaultDescription,
      },
    }));
  };

  const goNextFromCollection = () => {
    if (!collectionId) return;
    saveCollectionDraft();
    const count = draft?.items.length ?? 0;
    navigate(`/collections/constructor/${collectionId}/${count + 1}`);
  };

  const saveItem = (finish: boolean) => {
    if (!collectionId || !draft) return;

    const newItemId = itemId ?? draft.items.length + 1;
    const newItem: CollectionItem = {
      id: newItemId,
      index: newItemId,
      title: itemForm.title || 'Название',
      description: itemForm.description || 'Описание описание описание...',
      image: itemForm.image || sampleImage,
    };

    const updatedDraft: Collection = {
      ...draft,
      items: [...draft.items.filter((x) => x.id !== newItemId), newItem].sort((a, b) => a.id - b.id),
    };

    setDrafts((prev) => ({ ...prev, [String(collectionId)]: updatedDraft }));

    if (finish) {
      setCollections((prev) => {
        const idx = prev.findIndex((c) => c.id === updatedDraft.id);
        if (idx === -1) return [...prev, updatedDraft];
        const copy = [...prev];
        copy[idx] = updatedDraft;
        return copy;
      });
      navigate(`/collections/${updatedDraft.id}`);
      return;
    }

    setItemForm({ title: '', image: '', description: '' });
    navigate(`/collections/constructor/${collectionId}/${newItemId + 1}`);
  };

  const renderList = () => (
    <Box
      sx={{
        backgroundColor: pageSurface,
        border: panelBorder,
        p: 3,
      }}
    >
      <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 2 }}>Коллекции</Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 170px))',
          gap: 2,
        }}
      >
        {collections.map((c) => (
          <Card
            key={c.id}
            title={c.title}
            subtitle={c.type}
            image={c.image}
            onClick={() => handleOpenCollection(c.id)}
          />
        ))}

        <Box
          onClick={handleAddCollection}
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
            <Button variant="contained" onClick={goNextFromCollection}>
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
            <Button variant="outlined" onClick={() => saveItem(false)}>
              Создать ещё
            </Button>
            <Button variant="contained" onClick={() => saveItem(true)}>
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
            Элемент номер: {itemId ?? (draft?.items.length ?? 0) + 1}
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
