import { Link } from 'react-router-dom';
import type { HistoryRoom } from '../../../shared/api/types';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23EF3030'/%3E%3Cstop offset='100%25' stop-color='%234124F4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23D9D9D9'/%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='url(%23g)' opacity='0.25'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='28' fill='%23666'%3ENo image%3C/text%3E%3C/svg%3E";

export const HistoryRoomCard = ({
  room,
  disableLink = false,
}: {
  room: HistoryRoom;
  disableLink?: boolean;
}) => {
  const imgSrc = room.url_image || FALLBACK_IMAGE;

  if (disableLink) {
    return (
      <div className="history-card" aria-label={`Открыть ${room.name}`}>
        {room.url_image && (
          <div className="history-card__image">
            <img className="history-card__img" src={imgSrc} alt={room.name} loading="lazy" />
          </div>
        )}

        <div className="history-card__info">
          <div className="history-card__name">{room.name}</div>
          <div className="history-card__type">{room.type}</div>
          <div className="history-card__date">{room.date}</div>
        </div>
      </div>
    );
  }

  return (
    <Link className="history-card" to={`/history/${room.id}`} aria-label={`Открыть ${room.name}`}>
      {room.url_image && (
      <div className="history-card__image">
        <img className="history-card__img" src={imgSrc} alt={room.name} loading="lazy" />
      </div>
      )}

      <div className="history-card__info">
        <div className="history-card__name">{room.name}</div>
        <div className="history-card__type">{room.type}</div>
        <div className="history-card__date">{room.date}</div>
      </div>
    </Link>
  );
};
