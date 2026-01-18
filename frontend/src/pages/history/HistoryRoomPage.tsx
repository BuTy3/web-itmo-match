import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoomHistory } from '../../shared/api/history';
import type { RoomHistoryDetail } from '../../shared/api/types';
import './history.css';

export const HistoryRoomPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomHistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/history');
      return;
    }

    let cancelled = false;

    const loadRoom = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getRoomHistory(id);

        if (cancelled) return;

        if (!response.ok) {
          setError(response.message || 'Не удалось загрузить историю комнаты');
          return;
        }

        setRoom(response.room);
      } catch (err) {
        if (cancelled) return;
        setError('Ошибка при загрузке данных');
        console.error('Error loading room history:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRoom();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-title">Загрузка...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="history-page">
        <div className="history-title">Ошибка</div>
        <p>{error || 'Комната не найдена'}</p>
        <button onClick={() => navigate('/history')}>Вернуться к истории</button>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="history-page">
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/history')} style={{ marginBottom: '20px' }}>
          ← Назад к истории
        </button>
      </div>

      <h1 className="history-title">{room.name}</h1>

      <div style={{ marginBottom: '30px' }}>
        <h2>Информация о комнате</h2>
        <div style={{ marginTop: '15px' }}>
          <p><strong>Тема:</strong> {room.topic || 'Не указана'}</p>
          <p><strong>Режим матчинга:</strong> {room.match_mode === 'FIRST_MATCH' ? 'Первый матч' : 'Просмотр всех'}</p>
          <p><strong>Статус:</strong> {room.status === 'CLOSED' ? 'Закрыта' : room.status}</p>
          <p><strong>Режим доступа:</strong> {room.access_mode === 'PUBLIC' ? 'Публичная' : 'Приватная'}</p>
          <p><strong>Создана:</strong> {formatDateTime(room.created_at)}</p>
          {room.closed_at && (
            <p><strong>Закрыта:</strong> {formatDateTime(room.closed_at)}</p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Создатель</h2>
        <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {room.creator.avatar_url && (
            <img
              src={room.creator.avatar_url}
              alt={room.creator.display_name}
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            />
          )}
          <span>{room.creator.display_name}</span>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Участники ({room.participants.length})</h2>
        <div style={{ marginTop: '15px' }}>
          {room.participants.map((participant) => (
            <div
              key={participant.user_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
            >
              {participant.avatar_url && (
                <img
                  src={participant.avatar_url}
                  alt={participant.display_name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div><strong>{participant.display_name}</strong></div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  Присоединился: {formatDateTime(participant.joined_at)}
                </div>
                {participant.finished_at && (
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    Завершил: {formatDateTime(participant.finished_at)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {room.result && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Результат матчинга</h2>
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(room.result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
