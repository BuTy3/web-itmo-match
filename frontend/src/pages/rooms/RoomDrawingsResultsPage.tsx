import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState } from '../../app/store';
import type { RoomParticipant } from '../../features/rooms/model/roomsSlice';
import './rooms.css';

// TODO: заменить на реальные данные участников из API комнаты.
const buildFallbackParticipants = (nickname: string): RoomParticipant[] => [
  { id: nickname || 'me', nickname: nickname || 'Никнейм' },
  { id: 'nick-1', nickname: 'Ник1' },
  { id: 'nick-2', nickname: 'Ник2' },
];

export const RoomDrawingsResultsPage = () => {
  const { id_room } = useParams();
  const navigate = useNavigate();
  const nickname =
    useSelector((state: RootState) => state.auth.user?.login) ?? 'Никнейм';

  const roomId = id_room ?? 'unknown';
  const participantsFromStore = useSelector(
    (state: RootState) => state.rooms.participantsByRoom[roomId],
  );
  const drawings =
    useSelector((state: RootState) => state.rooms.drawingsByRoom[roomId]) ?? {};

  const resolvedParticipants = useMemo(() => {
    const participants = participantsFromStore ?? [];
    return participants.length ? participants : buildFallbackParticipants(nickname);
  }, [nickname, participantsFromStore]);

  return (
    <div className="room-page">
      <div>
        <h1 className="room-title">Комната: рисунки</h1>
        <p className="room-subtitle">Рисунки пользователей</p>
      </div>

      <div className="room-drawings-panel">
        <div className="room-drawings-grid">
          {resolvedParticipants.map((participant) => {
            const drawing = drawings[participant.id]?.dataUrl ?? '';
            return (
              <div key={participant.id} className="room-drawings-card">
                <div className="room-drawings-card__image">
                  {drawing ? (
                    <img src={drawing} alt={`Рисунок ${participant.nickname}`} />
                  ) : (
                    <span>Нет рисунка</span>
                  )}
                </div>
                <div className="room-drawings-card__name">
                  {participant.nickname}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="room-actions">
        <button type="button" className="room-button" onClick={() => navigate('/')}>
          Выйти из комнаты
        </button>
      </div>
    </div>
  );
};
