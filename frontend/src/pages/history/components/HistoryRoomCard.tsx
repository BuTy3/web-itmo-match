import { Link } from 'react-router-dom';
import type { HistoryRoom } from '../../../shared/api/types';

export const HistoryRoomCard = ({ room }: { room: HistoryRoom }) => {
  return (
    <Link className="history-card" to={`/history/${room.id}`} aria-label={`Открыть ${room.name}`}>
      <div className="history-card__image">
        <img className="history-card__img" src={room.url_image} alt={room.name} />
      </div>

      <div className="history-card__info">
        <div className="history-card__name">{room.name}</div>
        <div className="history-card__type">{room.type}</div>
        <div className="history-card__date">{room.date}</div>
      </div>
    </Link>
  );
};

