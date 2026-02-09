import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chooseRoomCard, fetchRoomState } from '../../shared/api/rooms';
import { METRIKA_GOALS, trackGoal } from '../../shared/lib/analytics/metrika';
import './rooms.css';

type RoomCardState = {
  nick: string;
  profile_picture_url?: string | null;
  name_card: string;
  description: string;
  owner_nick?: string | null;
};

const fallbackCard: RoomCardState = {
  nick: 'Никнейм',
  profile_picture_url: null,
  name_card: 'Название карточки',
  description: 'Описание...',
  owner_nick: null,
};

export const RoomPage = () => {
  const navigate = useNavigate();
  const { id_room } = useParams<{ id_room: string }>();
  const [card, setCard] = useState<RoomCardState>(fallbackCard);
  const [waiting, setWaiting] = useState(false);

  const showRequestError = useCallback((err: unknown) => {
    const status =
      typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    let message = 'Упс, какие-то проблемы с соединением.';
    if (status === 401) message = 'Сессия истекла. Войдите снова.';
    if (status === 403) message = 'Недостаточно прав для этого действия.';
    if (status === 500) message = 'Ошибка сервера. Попробуйте позже.';

    window.alert(message);
  }, []);

  const requestRoomState = useCallback(async () => {
    if (!id_room) return;
    try {
      const resp = await fetchRoomState({ id_room });
      if (!resp.ok) {
        if (resp.message === 'WAITING_FOR_PARTICIPANTS') {
          setWaiting(true);
          return;
        }
        if (resp.message === 'ROOM_SESSION_MISSING') {
          localStorage.removeItem('activeRoomId');
          localStorage.removeItem('activeRoomPath');
          navigate('/home', { replace: true });
          return;
        }
        navigate('/home', { replace: true });
        return;
      }
      setWaiting(false);
      if (resp.redirect || resp.next) {
        const nextPath = resp.redirect ?? resp.next;
        if (nextPath) {
          const normalized = nextPath.startsWith('/') ? nextPath : `/rooms/${id_room}/${nextPath}`;
          navigate(normalized, { replace: true });
          return;
        }
      }
      setCard({
        nick: resp.nick,
        owner_nick: resp.owner_nick ?? null,
        profile_picture_url: resp.profile_picture_url ?? null,
        name_card: resp.name_card,
        description: resp.description,
      });
      trackGoal(METRIKA_GOALS.RoomVoteOpen, { room_id: id_room });
      localStorage.setItem('activeRoomId', id_room);
      localStorage.setItem('activeRoomPath', `/rooms/${id_room}`);
    } catch (err) {
      showRequestError(err);
      navigate('/home', { replace: true });
    }
  }, [id_room, navigate, showRequestError]);

  useEffect(() => {
    if (!id_room) {
      navigate('/home', { replace: true });
      return;
    }

    const run = async () => {
      await requestRoomState();
    };

    void run();

    return undefined;
  }, [id_room, navigate, requestRoomState]);

  const handleChoose = async (choose: 0 | 1 | 2) => {
    if (!id_room) return;
    if (choose === 1) {
      trackGoal(METRIKA_GOALS.RoomVoteYes, { room_id: id_room });
    }
    if (choose === 2) {
      trackGoal(METRIKA_GOALS.RoomVoteNo, { room_id: id_room });
    }
    if (choose === 0) {
      trackGoal(METRIKA_GOALS.RoomLeave, {
        room_id: id_room,
        stage: 'voting',
      });
    }
    try {
      const resp = await chooseRoomCard({ id_room, choose });
      if (!resp.ok) {
        if (resp.message === 'WAITING_FOR_PARTICIPANTS') {
          setWaiting(true);
          return;
        }
        if (resp.message === 'ROOM_SESSION_MISSING') {
          localStorage.removeItem('activeRoomId');
          localStorage.removeItem('activeRoomPath');
          navigate('/home', { replace: true });
          return;
        }
        navigate('/home', { replace: true });
        return;
      }

      if (choose === 0) {
        localStorage.removeItem('activeRoomId');
        localStorage.removeItem('activeRoomPath');
        navigate('/home', { replace: true });
        return;
      }

      const nextPath = resp.redirect ?? resp.next;
      if (nextPath) {
        const normalized = nextPath.startsWith('/') ? nextPath : `/rooms/${id_room}/${nextPath}`;
        navigate(normalized);
        return;
      }

      if (resp.name_card || resp.description || resp.nick) {
        setCard((prev) => ({
          nick: resp.nick ?? prev.nick,
          owner_nick: resp.owner_nick ?? prev.owner_nick,
          profile_picture_url: resp.profile_picture_url ?? prev.profile_picture_url,
          name_card: resp.name_card ?? prev.name_card,
          description: resp.description ?? prev.description,
        }));
      }
    } catch (err) {
      showRequestError(err);
      navigate('/home', { replace: true });
    }
  };

  useEffect(() => {
    if (!waiting || !id_room) return;
    const timeoutId = window.setTimeout(async () => {
      try {
        const resp = await fetchRoomState({ id_room });
        if (!resp.ok) return;
        setWaiting(false);
        setCard({
          nick: resp.nick,
          owner_nick: resp.owner_nick ?? null,
          profile_picture_url: resp.profile_picture_url ?? null,
          name_card: resp.name_card,
          description: resp.description,
        });
      } catch (err) {
        console.error('Failed to poll room state', err);
      }
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [id_room, waiting]);

  return (
    <div className="rooms-page">
      <h1 className="rooms-title">Комната</h1>
      <p className="room-subtitle">ID комнаты: {id_room ?? '—'}</p>

      <div className="rooms-room-layout">
        {waiting ? (
          <div className="room-card room-card--ghost">
            <div className="room-form__label">Ожидаем подключения участников...</div>
            <button
              type="button"
              className="room-button room-button--ghost"
              onClick={requestRoomState}
            >
              Обновить
            </button>
          </div>
        ) : null}
        {!waiting ? (
          <>
            <div className="rooms-card">
              <div className="rooms-card__header">
                <div className="rooms-card__avatar" />
                <div className="rooms-card__nick">{card.owner_nick ?? card.nick}</div>
              </div>
              <div className="rooms-card__image">
                {card.profile_picture_url ? (
                  <img src={card.profile_picture_url} alt={card.name_card} />
                ) : null}
              </div>
              <div className="rooms-card__footer">
                <div className="rooms-card__title">{card.name_card}</div>
                <div className="rooms-card__description">{card.description}</div>
              </div>
            </div>

            <div className="rooms-room-actions">
              <button
                className="rooms-action-button rooms-action-button--no"
                onClick={() => handleChoose(2)}
                type="button"
              >
                Нет
              </button>
              <button
                className="rooms-action-button rooms-action-button--yes"
                onClick={() => handleChoose(1)}
                type="button"
              >
                Да
              </button>
            </div>

            <button className="rooms-exit-button" onClick={() => handleChoose(0)} type="button">
              Выйти из комнаты
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};
