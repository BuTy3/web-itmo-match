import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import {
  checkConnectRoomAccess,
  connectRoom,
  getUserCollections,
  type RoomCollection,
} from '../../shared/api/rooms';
import './rooms.css';

const getCollectionLabel = (collection: RoomCollection) =>
  collection.title?.trim() ||
  collection.description?.trim() ||
  collection.type?.trim() ||
  `Коллекция ${collection.id}`;

export const RoomConnectPage = () => {
  const navigate = useNavigate();
  const { id_room } = useParams<{ id_room: string }>();
  const token = useSelector((state: RootState) => state.auth.accessToken) ?? '';
  const [collections, setCollections] = useState<RoomCollection[]>([]);
  const [collectionId, setCollectionId] = useState<string | number | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showRequestError = (err: unknown) => {
    const status =
      typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    let message = 'Упс, какие-то проблемы с соединением.';
    if (status === 401) message = 'Сессия истекла. Войдите снова.';
    if (status === 403) message = 'Недостаточно прав для этого действия.';
    if (status === 500) message = 'Ошибка сервера. Попробуйте позже.';

    window.alert(message);
  };

  useEffect(() => {
    if (!token || !id_room) {
      navigate('/home', { replace: true });
      return;
    }
    let cancelled = false;

    const run = async () => {
      try {
        const accessResp = await checkConnectRoomAccess({ token, id_room });
        if (!accessResp.ok) {
          navigate('/home', { replace: true });
          return;
        }

        const collectionsResp = await getUserCollections({ token });
        if (cancelled) return;
        if (collectionsResp.ok) {
          setCollections(collectionsResp.collections);
        }
      } catch (err) {
        if (cancelled) return;
        showRequestError(err);
        navigate('/home', { replace: true });
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [id_room, navigate, token]);

  const selectedCollection = useMemo(
    () => collections.find((collection) => String(collection.id) === String(collectionId)),
    [collectionId, collections],
  );

  const listHeight = useMemo(() => {
    if (collections.length === 0) return 90;
    const rawHeight = collections.length * 34 + 32;
    return Math.min(260, rawHeight);
  }, [collections.length]);

  const handleCollectionSelect = (id: string | number) => {
    setCollectionId(id);
    setCollectionOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!collectionId) {
      setError('Выберите коллекцию.');
      return;
    }

    if (password.trim() && password.trim().length < 4) {
      setError('Пароль должен быть не менее 4 символов.');
      return;
    }

    setSubmitting(true);

    try {
      const resp = await connectRoom({
        id_room: id_room ?? '',
        token,
        password: password.trim() || undefined,
        collection_id: collectionId,
      });

      if (!resp.ok) {
        navigate('/home', { replace: true });
        return;
      }

      navigate(`/rooms/${id_room}`);
    } catch (err) {
      showRequestError(err);
      navigate('/home', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rooms-page">
      <h1 className="rooms-title">Подключение к комнате</h1>

      <form className="rooms-form rooms-connect-form" onSubmit={handleSubmit}>
        <div className="rooms-col">
          <label className="rooms-field">
            <span className="rooms-field__label">Введите пароль</span>
            <input
              className="rooms-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder=""
            />
          </label>
        </div>

        <div className="rooms-col">
          <div className="rooms-field">
            <span className="rooms-field__label">Выберите коллекцию</span>
            <div className="rooms-select-wrapper">
              <button
                type="button"
                className={`rooms-select${selectedCollection ? '' : ' rooms-select--placeholder'}`}
                onClick={() => setCollectionOpen((prev) => !prev)}
                aria-expanded={collectionOpen}
              >
                {selectedCollection ? getCollectionLabel(selectedCollection) : '---...---'}
              </button>
              {collectionOpen && (
                <div
                  className="rooms-collection-list"
                  role="listbox"
                  style={{ maxHeight: listHeight }}
                >
                  {collections.length === 0 ? (
                    <div className="rooms-collection-empty">Коллекций пока нет</div>
                  ) : (
                    collections.map((collection) => (
                      <button
                        key={collection.id}
                        type="button"
                        className="rooms-collection-item"
                        data-active={String(collection.id) === String(collectionId)}
                        onClick={() => handleCollectionSelect(collection.id)}
                      >
                        {getCollectionLabel(collection)}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div
            className="rooms-select-spacer"
            style={{ height: collectionOpen ? listHeight + 12 : 0 }}
          />
        </div>

        <div className="rooms-duo-actions">
          <button
            className="rooms-secondary-button rooms-secondary-button--ghost"
            type="button"
            onClick={() => navigate('/home')}
          >
            Отключиться
          </button>
          <button className="rooms-secondary-button" type="submit" disabled={submitting}>
            Подключиться
          </button>
        </div>
      </form>

      {error && <div className="rooms-error">{error}</div>}
    </div>
  );
};
