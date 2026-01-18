import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export const RoomConnectPage = () => {
  const navigate = useNavigate();
  const { id_room } = useParams();
  const [password, setPassword] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(COLLECTIONS[0]);

  const handleConnect = () => {
    if (!id_room) return;
    navigate(`/rooms/${id_room}`);
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
            <div className="room-form__collection-box">
              <select
                id="room-connect-collection"
                className="room-form__select room-form__select--list"
                size={8}
                value={selectedCollection}
                onChange={(event) => setSelectedCollection(event.target.value)}
              >
                {COLLECTIONS.map((collection) => (
                  <option key={collection} value={collection}>
                    {collection}
                  </option>
                ))}
              </select>
            </div>
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
          <button type="button" className="room-button" onClick={handleConnect}>
            Подключиться
          </button>
        </div>
      </div>
    </div>
  );
};
