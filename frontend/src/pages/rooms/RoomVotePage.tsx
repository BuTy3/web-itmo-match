import { useNavigate, useParams } from 'react-router-dom';
import './rooms.css';

export const RoomVotePage = () => {
  const navigate = useNavigate();
  const { id_room } = useParams();

  const handleVote = () => {
    if (!id_room) return;
    navigate(`/rooms/${id_room}/drawing`);
  };

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="room-page">
      <h1 className="room-title">Комната</h1>

      <div className="room-vote">
        <div className="room-vote-card">
          <div className="room-vote-card__image">
            <img src="/itmo-logo-1.png" alt="Карточка" />
          </div>
          <div className="room-vote-card__content">
            <div className="room-vote-card__title">
              Мираж синема на Большом
            </div>
            <div>Описание...</div>
          </div>
        </div>

        <div className="room-vote-actions">
          <button
            type="button"
            className="room-vote-actions__no"
            onClick={handleVote}
          >
            Нет
          </button>
          <button
            type="button"
            className="room-vote-actions__yes"
            onClick={handleVote}
          >
            Да
          </button>
        </div>

        <button type="button" className="room-button" onClick={handleExit}>
          Выйти из комнаты
        </button>
      </div>
    </div>
  );
};
