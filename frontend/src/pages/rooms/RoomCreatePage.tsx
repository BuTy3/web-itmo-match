import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './rooms.css';

const COLLECTIONS = [
  'Коллекция 1',
  'Коллекция 2',
  'Коллекция 3',
  'Коллекция 4',
  'Коллекция 5',
  'Коллекция 6',
  'Коллекция 7',
  'Коллекция 8',
];

export const RoomCreatePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(COLLECTIONS[0]);
  const [matchMode, setMatchMode] = useState<'first' | 'all'>('first');
  const [collectionMode, setCollectionMode] = useState<'single' | 'multiple'>(
    'single',
  );

  const roomId = useMemo(
    () => `room-${Math.floor(Date.now() / 1000)}`,
    [],
  );

  const handleCreate = () => {
    navigate(`/rooms/connect/${roomId}`, {
      state: {
        name,
        password,
        selectedCollection,
        matchMode,
        collectionMode,
      },
    });
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
                value={selectedCollection}
                onChange={(event) => setSelectedCollection(event.target.value)}
                aria-label="Выбор коллекции"
              >
                {COLLECTIONS.map((collection) => (
                  <option key={collection} value={collection}>
                    {collection}
                  </option>
                ))}
              </select>
            </div>
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
          <button type="button" className="room-button" onClick={handleCreate}>
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};
