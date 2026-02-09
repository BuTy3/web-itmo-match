import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserCollections } from '../../shared/api/home';
import { checkConnectRoomAccess, connectRoom, type RoomCollection } from '../../shared/api/rooms';
import './rooms.css';

const buildCollectionLabel = (collection: RoomCollection) =>
  collection.title || collection.type || `Коллекция ${collection.id}`;

export const RoomConnectPage = () => {
  const navigate = useNavigate();
  const { id_room } = useParams();
  const [password, setPassword] = useState('');
  const [collections, setCollections] = useState<RoomCollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | string>('');
  const [collectionRequired, setCollectionRequired] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id_room) {
      navigate('/home', { replace: true });
      return;
    }

    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const access = await checkConnectRoomAccess({
          id_room,
          password: password.trim() || undefined,
        });
        if (!mounted) return;
        if (!access.ok) {
          const message =
            access.message === 'Password is required'
              ? 'Введите пароль'
              : access.message || 'Комната недоступна';
          setError(message);
          return;
        }

        if (Array.isArray(access.collection_choose)) {
          setCollections(access.collection_choose);
          setSelectedCollectionId(access.collection_choose[0]?.id ?? '');
          setCollectionRequired(true);
          if (!access.collection_choose.length) {
            setError('Нет доступных коллекций для подключения');
          } else {
            setError(null);
          }
        } else if (access.collection_choose === false) {
          setCollections([]);
          setSelectedCollectionId('');
          setCollectionRequired(false);
          setError(null);
        } else {
          const resp = await getUserCollections();
          if (!mounted) return;
          if (resp.ok) {
            setCollections(resp.collections);
            setSelectedCollectionId(resp.collections[0]?.id ?? '');
            setCollectionRequired(true);
            setError(null);
          } else {
            setError(resp.message || 'Не удалось загрузить коллекции');
          }
        }
      } catch (err) {
        const message =
          typeof err === 'object' && err !== null && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        console.error('Failed to load room data', err);
        if (mounted) setError(message || 'Не удалось загрузить данные комнаты');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id_room, navigate, password]);

  const collectionOptions = useMemo(
    () =>
      collections.map((collection) => ({
        id: collection.id,
        label: buildCollectionLabel(collection),
      })),
    [collections],
  );

  const handleConnect = async () => {
    if (!id_room) return;
    if (collectionRequired && !selectedCollectionId) {
      window.alert('Выберите коллекцию.');
      return;
    }

    try {
      const resp = await connectRoom({
        id_room,
        password: password.trim() || undefined,
        ...(collectionRequired ? { collection_id: selectedCollectionId } : {}),
      });

      if (!resp.ok) {
        window.alert(resp.message || 'Не удалось подключиться');
        return;
      }

      localStorage.setItem('activeRoomId', String(id_room));
      localStorage.setItem('activeRoomPath', `/rooms/${id_room}`);
      navigate(`/rooms/${id_room}`);
    } catch (err) {
      console.error('Failed to connect to room', err);
      window.alert('Не удалось подключиться');
    }
  };

  return (
    <div className="room-page">
      <div>
        <h1 className="room-title">Подключение к комнате</h1>
        <p className="room-subtitle">Комната: {id_room ?? '—'}</p>
      </div>

      <div className="room-card room-card--ghost">
        <div className="room-connect-grid">
          <div className="room-form__field">
            <label className="room-form__label" htmlFor="room-connect-password">
              Введите пароль
            </label>
            <input
              id="room-connect-password"
              className="room-form__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••"
            />
          </div>

          <div className="room-form__field">
            <label className="room-form__label" htmlFor="room-connect-collection">
              Выберите коллекцию
            </label>
            {collectionRequired ? (
              <div className="room-form__collection-box">
                <select
                  id="room-connect-collection"
                  className="room-form__select room-form__select--list"
                  size={8}
                  value={selectedCollectionId}
                  onChange={(event) => setSelectedCollectionId(event.target.value)}
                  disabled={loading}
                >
                  {collectionOptions.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {loading && <span className="room-form__label">Загрузка...</span>}
            {!loading && error && <span className="room-form__label">{error}</span>}
            {!loading && !collectionRequired && (
              <span className="room-form__label">Коллекция выбрана создателем</span>
            )}
          </div>
        </div>

        <div className="room-actions">
          <button
            type="button"
            className="room-button room-button--ghost"
            onClick={() => navigate('/')}
          >
            Отключиться
          </button>
          <button
            type="button"
            className="room-button"
            onClick={handleConnect}
            disabled={loading}
          >
            Подключиться
          </button>
        </div>
      </div>
    </div>
  );
};
