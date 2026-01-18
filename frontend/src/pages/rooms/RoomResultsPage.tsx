import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './rooms.css';

const getHasMatch = (search: string) => {
  const params = new URLSearchParams(search);
  const value = params.get('match');
  if (value === null) return true;
  return value !== '0';
};

export const RoomResultsPage = () => {
  const { id_room } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hasMatch = getHasMatch(location.search);
  const roomId = id_room ?? 'unknown';

  return (
    <div className="room-page">
      <div>
        <h1 className="room-title">Комната: результаты</h1>
      </div>

      <div className="room-results">
        {hasMatch ? (
          <>
            <h2 className="room-results__headline">Match!</h2>
            <p className="room-results__text">
              Все проголосовали именно за эту карточку
            </p>
            <div className="room-results-card">
              <div className="room-results-card__image">
                <img src="/itmo-logo-1.png" alt="Результат" />
              </div>
              <div className="room-results-card__info">
                <div className="room-results-card__title">
                  Мираж на Большом
                </div>
                <div>Описание...</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="room-results__headline">Совпадений не было :(</h2>
            <p className="room-results__text">
              Но не стоит расстраиваться, можете попробовать запустить выбор с
              другой коллекцией
            </p>
          </>
        )}

        <div className="room-actions">
          <button
            type="button"
            className="room-button room-button--ghost"
            onClick={() => navigate(`/rooms/${roomId}/drowing_res`)}
          >
            Рисунки пользователей
          </button>
          <button type="button" className="room-button" onClick={() => navigate('/')}>
            Выйти из комнаты
          </button>
        </div>
      </div>
    </div>
  );
};
