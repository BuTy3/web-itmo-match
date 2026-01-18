import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import type { RootState } from '../../app/store';
import { getRoomHistory } from '../../shared/api/history';
import type { HistoryRoomDetails } from '../../shared/api/types';
import { extractResultCard } from './historyRoom.utils';
import './history.css';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23EF3030'/%3E%3Cstop offset='100%25' stop-color='%234124F4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23D2D2D7'/%3E%3Crect width='100%25' height='100%25' fill='url(%23g)' opacity='0.18'/%3E%3C/svg%3E";

export const HistoryRoomPage = () => {
  const { id_room } = useParams<{ id_room: string }>();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.accessToken) ?? '';

  const [room, setRoom] = useState<HistoryRoomDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError('');
      setRoom(null);

      if (!id_room) {
        setError('Не указан id комнаты');
        setLoading(false);
        return;
      }

      if (!token) {
        setError('Нет токена авторизации');
        setLoading(false);
        return;
      }

      const resp = await getRoomHistory({ token, id_room });
      if (cancelled) return;

      if (!resp.ok) {
        setError(resp.message);
        setLoading(false);
        return;
      }

      setRoom(resp.room);
      setLoading(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [id_room, token]);

  const resultCard = useMemo(() => extractResultCard(room?.result), [room?.result]);
  const imageSrc = resultCard.imageUrl || FALLBACK_IMAGE;

  const participants = useMemo(() => {
    const names = room?.participants?.map((p) => p.display_name).filter(Boolean) ?? [];
    return Array.from(new Set(names));
  }, [room?.participants]);

  return (
    <div className="history-room-page">
      <h1 className="history-title">История</h1>

      <div className="history-room-subtitle">
        В комнате <span className="history-room-subtitle__name">{room?.name ?? '...'}</span>{' '}
        участники выбрали эту карточку 🤔
      </div>

      <div className="history-room-layout">
        <div className="history-room-card" aria-busy={loading}>
          <div className="history-room-card__image">
            <img className="history-room-card__img" src={imageSrc} alt={resultCard.name || 'Карточка'} />
          </div>

          <div className="history-room-card__text">
            <div className="history-room-card__title">{resultCard.name || 'Название...'}</div>
            <div className="history-room-card__description">{resultCard.description || 'Описание...'}</div>
          </div>
        </div>

        <div className="history-room-participants">
          <div className="history-room-participants__title">Участники комнаты:</div>
          <div className="history-room-participants__list" aria-busy={loading}>
            {error ? (
              <div className="history-room-participants__empty">{error}</div>
            ) : participants.length === 0 ? (
              <div className="history-room-participants__empty">
                {loading ? 'Загрузка...' : 'Нет участников'}
              </div>
            ) : (
              participants.map((name) => (
                <div key={name} className="history-room-participants__item">
                  {name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="history-room-actions">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/histore')}
          sx={{
            width: 'min(295px, 100%)',
            height: '61px',
            borderRadius: '16px',
            fontSize: '20px',
            textTransform: 'none',
          }}
        >
          Назад
        </Button>
      </div>
    </div>
  );
};
