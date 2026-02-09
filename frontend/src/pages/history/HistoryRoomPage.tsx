import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import type { RootState } from '../../app/store';
import { getRoomHistory } from '../../shared/api/history';
import type { HistoryRoomDetails } from '../../shared/api/types';
import { extractResultCards } from './historyRoom.utils';
import './history.css';

const FALLBACK_IMAGE = 'https://i.ytimg.com/vi/ilUPzCADxoA/maxresdefault.jpg';

export const HistoryRoomPage = () => {
  const { id_room, id } = useParams<{ id_room?: string; id?: string }>();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.accessToken) ?? '';
  const roomId = id_room ?? id ?? '';

  const [room, setRoom] = useState<HistoryRoomDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError('');
      setRoom(null);

      if (!roomId) {
        setError('Не указан id комнаты');
        setLoading(false);
        return;
      }

      if (!token) {
        setError('Нет токена авторизации');
        setLoading(false);
        return;
      }

      const resp = await getRoomHistory({ token, id_room: roomId });
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
  }, [roomId, token]);

  const resultCards = useMemo(() => extractResultCards(room?.result), [room?.result]);

  const participants = useMemo(() => {
    const names = room?.participants?.map((p) => p.display_name).filter(Boolean) ?? [];
    return Array.from(new Set(names));
  }, [room?.participants]);

  return (
    <div className="history-room-page">
      <h1 className="history-title">История</h1>

      <div className="history-room-subtitle">
        В комнате <span className="history-room-subtitle__name">{room?.name ?? '...'}</span>{' '}
        {resultCards.length === 0
          ? 'совпадений не было'
          : `участники выбрали ${resultCards.length > 1 ? 'эти карточки' : 'эту карточку'} 🤔`}
      </div>

      <div className="history-room-layout">
        {resultCards.length === 0 ? (
          <div className="history-room-card" aria-busy={loading}>
            <div className="history-room-card__text">
              <div className="history-room-card__title">Совпадений не было</div>
              <div className="history-room-card__description">
                Участники комнаты не выбрали общую карточку.
              </div>
            </div>
          </div>
        ) : resultCards.length > 1 ? (
          <div className="history-room-cards" aria-busy={loading}>
            {resultCards.map((card, index) => (
              <div key={`${card.name}-${index}`} className="history-room-card history-room-card--compact">
                <div className="history-room-card__image">
                  <img
                    className="history-room-card__img"
                    src={card.imageUrl || FALLBACK_IMAGE}
                    alt={card.name || 'Карточка'}
                  />
                </div>

                <div className="history-room-card__text">
                  <div className="history-room-card__title">{card.name || 'Название...'}</div>
                  <div className="history-room-card__description">{card.description || 'Описание...'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="history-room-card" aria-busy={loading}>
            <div className="history-room-card__image">
              <img
                className="history-room-card__img"
                src={resultCards[0].imageUrl || FALLBACK_IMAGE}
                alt={resultCards[0].name || 'Карточка'}
              />
            </div>

            <div className="history-room-card__text">
              <div className="history-room-card__title">{resultCards[0].name || 'Название...'}</div>
              <div className="history-room-card__description">
                {resultCards[0].description || 'Описание...'}
              </div>
            </div>
          </div>
        )}

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
