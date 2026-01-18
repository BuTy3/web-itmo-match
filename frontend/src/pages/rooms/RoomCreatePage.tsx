import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import {
  checkCreateRoomAccess,
  createRoom,
  getUserCollections,
  type RoomCollection,
} from '../../shared/api/rooms';
import './rooms.css';

const getCollectionLabel = (collection: RoomCollection) =>
  collection.title?.trim() ||
  collection.description?.trim() ||
  collection.type?.trim() ||
  `Коллекция ${collection.id}`;

export const RoomCreatePage = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.accessToken) ?? '';
  const [collections, setCollections] = useState<RoomCollection[]>([]);
  const [collectionId, setCollectionId] = useState<string | number | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [name, setName] = useState('');
  const [typeMatch, setTypeMatch] = useState<1 | 2 | null>(null);
  const [typeCollections, setTypeCollections] = useState<1 | 2 | null>(null);
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
    if (!token) return;
    let cancelled = false;

    const run = async () => {
      try {
        const accessResp = await checkCreateRoomAccess({ token });
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
  }, [navigate, token]);

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

    if (!name.trim()) {
      setError('Введите название комнаты.');
      return;
    }

    if (!typeMatch) {
      setError('Выберите тип совпадений.');
      return;
    }

    if (!typeCollections) {
      setError('Выберите тип коллекций.');
      return;
    }

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
      const resp = await createRoom({
        token,
        name: name.trim(),
        type_match: typeMatch,
        password: password.trim() || undefined,
        type_collections: typeCollections,
        collection_id: collectionId,
      });

      if (!resp.ok) {
        navigate('/home', { replace: true });
        return;
      }

      const idRoom = resp.id_room ?? resp.room_id ?? resp.id;
      if (!idRoom) {
        setError('Не удалось получить id комнаты.');
        return;
      }

      navigate(`/rooms/${idRoom}`);
    } catch (err) {
      showRequestError(err);
      navigate('/home', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rooms-page">
      <h1 className="rooms-title">Создание комнаты</h1>

      <form className="rooms-form rooms-create-form" onSubmit={handleSubmit}>
        <div className="rooms-col">
          <label className="rooms-field">
            <span className="rooms-field__label">Название</span>
            <input
              className="rooms-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder=""
            />
          </label>

          <div className="rooms-field">
            <span className="rooms-field__label">Тип совпадений</span>
            <div className="rooms-option-group">
              <label className="rooms-option">
                <input
                  type="radio"
                  name="typeMatch"
                  value="1"
                  checked={typeMatch === 1}
                  onChange={() => setTypeMatch(1)}
                />
                <span className="rooms-option__box" />
                <span>До первого совпадения</span>
              </label>
              <label className="rooms-option">
                <input
                  type="radio"
                  name="typeMatch"
                  value="2"
                  checked={typeMatch === 2}
                  onChange={() => setTypeMatch(2)}
                />
                <span className="rooms-option__box" />
                <span>Все совпадения</span>
              </label>
            </div>
          </div>
        </div>

        <div className="rooms-col">
          <div className="rooms-field">
            <span className="rooms-field__label">Коллекция</span>
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

        <div className="rooms-col">
          <label className="rooms-field">
            <span className="rooms-field__label">Пароль</span>
            <input
              className="rooms-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder=""
            />
          </label>

          <div className="rooms-field">
            <span className="rooms-field__label">Тип коллекций</span>
            <div className="rooms-option-group">
              <label className="rooms-option">
                <input
                  type="radio"
                  name="typeCollections"
                  value="1"
                  checked={typeCollections === 1}
                  onChange={() => setTypeCollections(1)}
                />
                <span className="rooms-option__box" />
                <span>Одна коллекция</span>
              </label>
              <label className="rooms-option">
                <input
                  type="radio"
                  name="typeCollections"
                  value="2"
                  checked={typeCollections === 2}
                  onChange={() => setTypeCollections(2)}
                />
                <span className="rooms-option__box" />
                <span>Несколько коллекций</span>
              </label>
            </div>
          </div>
        </div>

        <div className="rooms-actions">
          <button className="rooms-button" type="submit" disabled={submitting}>
            Создать
          </button>
        </div>
      </form>

      {error && <div className="rooms-error">{error}</div>}
    </div>
  );
};
