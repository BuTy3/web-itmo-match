import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { chooseRoomCard, fetchRoomState } from '../../shared/api/rooms';
import './rooms.css';

type RoomCardState = {
  nick: string;
  profile_picture_url?: string | null;
  name_card: string;
  description: string;
};

const fallbackCard: RoomCardState = {
  nick: 'Никнейм',
  profile_picture_url: null,
  name_card: 'Название карточки',
  description: 'Описание...',
};

export const RoomPage = () => {
  const navigate = useNavigate();
  const { id_room } = useParams<{ id_room: string }>();
  const token = useSelector((state: RootState) => state.auth.accessToken) ?? '';
  const [card, setCard] = useState<RoomCardState>(fallbackCard);

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
        const resp = await fetchRoomState({ token, id_room });
        if (!resp.ok) {
          navigate('/home', { replace: true });
          return;
        }
        if (cancelled) return;
        setCard({
          nick: resp.nick,
          profile_picture_url: resp.profile_picture_url ?? null,
          name_card: resp.name_card,
          description: resp.description,
        });
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

  const handleChoose = async (choose: 0 | 1 | 2) => {
    if (!id_room) return;
    try {
      const resp = await chooseRoomCard({ id_room, token, choose });
      if (!resp.ok) {
        navigate('/home', { replace: true });
        return;
      }

      if (choose === 0) {
        navigate('/home', { replace: true });
        return;
      }

      const nextPath = resp.redirect ?? resp.next;
      if (nextPath) {
        const normalized = nextPath.startsWith('/')
          ? nextPath
          : `/rooms/${id_room}/${nextPath}`;
        navigate(normalized);
        return;
      }

      if (resp.name_card || resp.description || resp.nick) {
        setCard((prev) => ({
          nick: resp.nick ?? prev.nick,
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

  return (
    <div className="rooms-page">
      <h1 className="rooms-title">Комната</h1>

      <div className="rooms-room-layout">
        <div className="rooms-card">
          <div className="rooms-card__header">
            <div className="rooms-card__avatar" />
            <div className="rooms-card__nick">{card.nick}</div>
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
      </div>

    </div>
  );
};
