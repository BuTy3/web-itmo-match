import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState } from '../../app/store';
import type { RoomParticipant } from '../../features/rooms/model/roomsSlice';
import { getRoomDrawingsResults } from '../../shared/api/rooms';
import { METRIKA_GOALS, trackGoal } from '../../shared/lib/analytics/metrika';
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
  const nickname = useSelector((state: RootState) => state.auth.user?.login) ?? 'Никнейм';
  const [remoteDrawings, setRemoteDrawings] = useState<
    { id: string; name: string; imageUrl?: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const roomId = id_room ?? 'unknown';
  const participantsFromStore = useSelector(
    (state: RootState) => state.rooms.participantsByRoom[roomId],
  );
  const drawings = useSelector((state: RootState) => state.rooms.drawingsByRoom[roomId]) ?? {};

  const resolvedParticipants = useMemo(() => {
    const participants = participantsFromStore ?? [];
    return participants.length ? participants : buildFallbackParticipants(nickname);
  }, [nickname, participantsFromStore]);

  useEffect(() => {
    if (!id_room) {
      navigate('/home', { replace: true });
      return;
    }

    localStorage.setItem('activeRoomId', id_room);
    localStorage.setItem('activeRoomPath', `/rooms/${id_room}/drawing_res`);

    let mounted = true;

    const loadResults = async () => {
      try {
        const resp = await getRoomDrawingsResults(id_room);
        if (!mounted) return;
        if (resp.ok) {
          trackGoal(METRIKA_GOALS.RoomDrawingsOpen, {
            room_id: id_room,
            drawings_count: resp.drawings.length,
          });
          setRemoteDrawings(
            resp.drawings.map((drawing, index) => ({
              id: drawing.user_id || String(index),
              name: drawing.nickname || `Участник ${index + 1}`,
              imageUrl: drawing.snapshot ?? null,
            })),
          );
        }
      } catch (err) {
        console.error('Failed to load drawings results', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadResults();

    return () => {
      mounted = false;
    };
  }, [id_room, navigate]);

  const drawingsToShow =
    remoteDrawings.length > 0
      ? remoteDrawings
      : resolvedParticipants.map((participant) => ({
          id: participant.id,
          name: participant.nickname,
          imageUrl: drawings[participant.id]?.dataUrl ?? null,
        }));

  return (
    <div className="room-page">
      <div>
        <h1 className="room-title">Комната: рисунки</h1>
        <p className="room-subtitle">Рисунки пользователей</p>
        <p className="room-subtitle">ID комнаты: {id_room ?? '—'}</p>
      </div>

      <div className="room-drawings-panel">
        <div className="room-drawings-grid">
          {drawingsToShow.map((participant) => {
            const drawing = participant.imageUrl ?? '';
            return (
              <div key={participant.id} className="room-drawings-card">
                <div className="room-drawings-card__image">
                  {drawing ? (
                    <img src={drawing} alt={`Рисунок ${participant.name}`} />
                  ) : (
                    <span>Нет рисунка</span>
                  )}
                </div>
                <div className="room-drawings-card__name">{participant.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="room-actions">
        <button
          type="button"
          className="room-button"
          onClick={() => {
            trackGoal(METRIKA_GOALS.RoomLeave, {
              room_id: roomId,
              stage: 'drawings_results',
            });
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
  );
};
