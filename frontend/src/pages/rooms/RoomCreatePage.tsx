import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCollections } from '../../shared/api/home';
import { createRoom } from '../../shared/api/rooms';
import type { HomeCollection } from '../../shared/api/types';
import { METRIKA_GOALS, trackGoal } from '../../shared/lib/analytics/metrika';
import './rooms.css';

const buildCollectionLabel = (collection: HomeCollection) =>
  collection.title || collection.description || collection.type || `Коллекция ${collection.id}`;

export const RoomCreatePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [collections, setCollections] = useState<HomeCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | string>('');
  const [matchMode, setMatchMode] = useState<'first' | 'all'>('first');
  const [collectionMode, setCollectionMode] = useState<'single' | 'multiple'>('single');

  useEffect(() => {
    let mounted = true;

    const loadCollections = async () => {
      try {
        const resp = await getUserCollections();
        if (!mounted) return;
        if (resp.ok) {
          setCollections(resp.collections);
          setSelectedCollectionId(resp.collections[0]?.id ?? '');
          setError(null);
        } else {
          setError(resp.message || 'Не удалось загрузить коллекции');
        }
      } catch (err) {
        console.error('Failed to load collections', err);
        if (mounted) setError('Не удалось загрузить коллекции');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCollections();

    return () => {
      mounted = false;
    };
  }, []);

  const hasCollections = collections.length > 0;
  const collectionOptions = useMemo(
    () =>
      collections.map((collection) => ({
        id: collection.id,
        label: buildCollectionLabel(collection),
      })),
    [collections],
  );

  const handleCreate = async () => {
    if (!name.trim()) {
      trackGoal(METRIKA_GOALS.RoomCreateFailure, { reason: 'empty_room_name' });
      window.alert('Введите название комнаты.');
      return;
    }
    const normalizedCollectionId = Number(selectedCollectionId);
    if (!Number.isFinite(normalizedCollectionId) || normalizedCollectionId <= 0) {
      trackGoal(METRIKA_GOALS.RoomCreateFailure, { reason: 'no_collection' });
      window.alert('Выберите коллекцию.');
      return;
    }

    try {
      trackGoal(METRIKA_GOALS.RoomCreateAttempt, {
        match_mode: matchMode,
        collection_mode: collectionMode,
        has_password: Boolean(password.trim()),
      });
      const payload = {
        name: name.trim(),
        type_match: matchMode === 'first' ? 1 : 2,
        type_collections: collectionMode === 'single' ? 1 : 2,
        password: password.trim() || undefined,
        collection_id:
          collectionMode === 'multiple' ? [normalizedCollectionId] : normalizedCollectionId,
      } as const;

      const resp = await createRoom(payload);
      if (!resp.ok) {
        trackGoal(METRIKA_GOALS.RoomCreateFailure, {
          reason: resp.message ?? 'create_failed',
        });
        window.alert(resp.message || 'Не удалось создать комнату');
        return;
      }

      const id = resp.id_room ?? resp.room_id ?? resp.id;
      if (!id) {
        trackGoal(METRIKA_GOALS.RoomCreateFailure, { reason: 'missing_room_id' });
        window.alert('Не удалось получить id комнаты');
        return;
      }

      trackGoal(METRIKA_GOALS.RoomCreateSuccess, {
        room_id: String(id),
      });
      localStorage.setItem('activeRoomId', String(id));
      localStorage.setItem('activeRoomPath', `/rooms/${id}`);
      navigate(`/rooms/${id}`);
    } catch (err) {
      trackGoal(METRIKA_GOALS.RoomCreateFailure, { reason: 'request_failed' });
      console.error('Failed to create room', err);
      window.alert('Не удалось создать комнату');
    }
  };

  return (
    <div className="room-page">
      <div>
        <h1 className="room-title">Создание комнаты</h1>
      </div>

      <div className="room-card room-card--ghost">
        <div className="room-form">
          <div className="room-form__field" style={{ gridArea: 'name' }}>
            <label className="room-form__label" htmlFor="room-name">
              Название
            </label>
            <input
              id="room-name"
              className="room-form__input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Название комнаты"
            />
          </div>

          <div className="room-form__field" style={{ gridArea: 'modes' }}>
            <label className="room-form__label">Режим</label>
            <div className="room-form__checkbox-group">
              <label className="room-form__checkbox">
                <input
                  type="checkbox"
                  checked={matchMode === 'first'}
                  onChange={() => setMatchMode('first')}
                />
                До первого совпадения
              </label>
              <label className="room-form__checkbox">
                <input
                  type="checkbox"
                  checked={matchMode === 'all'}
                  onChange={() => setMatchMode('all')}
                />
                Все совпадения
              </label>
            </div>
          </div>

          <div className="room-form__field room-form__collection">
            <label className="room-form__label">Коллекции</label>
            <div className="room-form__collection-box">
              <select
                className="room-form__select room-form__select--list"
                size={8}
                value={selectedCollectionId}
                onChange={(event) => setSelectedCollectionId(event.target.value)}
                aria-label="Выбор коллекции"
                disabled={!hasCollections || loading}
              >
                {collectionOptions.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.label}
                  </option>
                ))}
              </select>
            </div>
            {loading && <span className="room-form__label">Загрузка...</span>}
            {!loading && error && <span className="room-form__label">{error}</span>}
          </div>

          <div className="room-form__field" style={{ gridArea: 'password' }}>
            <label className="room-form__label" htmlFor="room-password">
              Пароль
            </label>
            <input
              id="room-password"
              className="room-form__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••"
            />
          </div>

          <div className="room-form__field" style={{ gridArea: 'access' }}>
            <label className="room-form__label">Коллекции</label>
            <div className="room-form__checkbox-group">
              <label className="room-form__checkbox">
                <input
                  type="checkbox"
                  checked={collectionMode === 'single'}
                  onChange={() => setCollectionMode('single')}
                />
                Одна коллекция
              </label>
              <label className="room-form__checkbox">
                <input
                  type="checkbox"
                  checked={collectionMode === 'multiple'}
                  onChange={() => setCollectionMode('multiple')}
                />
                Несколько коллекций
              </label>
            </div>
          </div>
        </div>

        <div className="room-form__footer">
          <button type="button" className="room-button" onClick={handleCreate} disabled={loading}>
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};
