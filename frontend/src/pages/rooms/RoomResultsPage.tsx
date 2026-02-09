import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoomResults, leaveRoom } from '../../shared/api/rooms';
import './rooms.css';

export const RoomResultsPage = () => {
  const { id_room } = useParams();
  const navigate = useNavigate();
  const roomId = id_room ?? 'unknown';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedItems, setMatchedItems] = useState<
    { title: string; description?: string; image_url: string | null }[]
  >([]);
  const [hasMatch, setHasMatch] = useState(false);

  useEffect(() => {
    if (!id_room) {
      navigate('/home', { replace: true });
      return;
    }

    localStorage.setItem('activeRoomId', id_room);
    localStorage.setItem('activeRoomPath', `/rooms/${id_room}/results`);

    let mounted = true;

    const loadResults = async () => {
      try {
        const fallback = await getRoomResults(id_room);
        if (!mounted) return;
        if (fallback.ok) {
          setMatchedItems(fallback.matched_items);
          setHasMatch(fallback.has_match || fallback.matched_items.length > 0);
          setError(null);
        } else {
          setError(fallback.message || 'Не удалось загрузить результаты');
        }
      } catch (err) {
        console.error('Failed to load room results', err);
        if (mounted) setError('Не удалось загрузить результаты');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadResults();

    return () => {
      mounted = false;
    };
  }, [id_room, navigate]);

  const resolvedHasMatch = matchedItems.length > 0 ? true : hasMatch;

  return (
    <div className="room-page">
      <div>
        <h1 className="room-title">Комната: результаты</h1>
        <p className="room-subtitle">ID комнаты: {id_room ?? '—'}</p>
      </div>

      <div className="room-results">
        {error ? (
          <p className="room-results__text">{error}</p>
        ) : loading ? (
          <p className="room-results__text">Загрузка...</p>
        ) : resolvedHasMatch ? (
          <>
            <h2 className="room-results__headline">Match!</h2>
            <p className="room-results__text">
              Все проголосовали именно за эту карточку
            </p>
            <div className="room-results-grid">
              {matchedItems.map((item, index) => (
                <div key={item.id || index} className="room-results-card">
                  <div className="room-results-card__image">
                    <img
                      src={item.image_url || '/itmo-logo-1.png'}
                      alt={item.title || 'Результат'}
                    />
                  </div>
                  <div className="room-results-card__info">
                    <div className="room-results-card__title">
                      {item.title || 'Результат'}
                    </div>
                    <div>{item.description || 'Описание...'}</div>
                  </div>
                </div>
              ))}
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
            disabled={loading}
          >
            Рисунки пользователей
          </button>
          <button
            type="button"
            className="room-button"
            onClick={async () => {
              if (id_room) {
                await leaveRoom(id_room);
              }
              localStorage.removeItem('activeRoomId');
              localStorage.removeItem('activeRoomPath');
              navigate('/');
            }}
            disabled={loading}
          >
            Выйти из комнаты
          </button>
        </div>
      </div>
    </div>
  );
};
