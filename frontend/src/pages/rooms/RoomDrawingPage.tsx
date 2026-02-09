import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { DrawingCanvas } from '../drawing/components/DrawingCanvas';
import { ToolBar } from '../drawing/components/ToolBar';
import type { AppDispatch, RootState } from '../../app/store';
import { setParticipants, upsertDrawing } from '../../features/rooms/model/roomsSlice';
import {
  fetchRoomDrawing,
  getRoomResults,
  submitRoomDrawing,
  type DrawingPoint,
} from '../../shared/api/rooms';
import './rooms.css';
import '../drawing/drawing.css';

type Tool = 'pen' | 'eraser';

export const RoomDrawingPage = () => {
  const { id_room } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const nickname =
    useSelector((state: RootState) => state.auth.user?.login) ?? 'Никнейм';

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1c1c1e');
  const [brushSize] = useState(8);
  const [clearSignal, setClearSignal] = useState(0);
  const [topic, setTopic] = useState<string | null>(null);
  const [points, setPoints] = useState<DrawingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const snapshotRef = useRef<string | null>(null);

  const roomId = id_room ?? 'unknown';
  const currentUserId = useMemo(() => nickname || 'me', [nickname]);
  const participants =
    useSelector((state: RootState) => state.rooms.participantsByRoom[roomId]) ??
    [];
  const drawing =
    useSelector(
      (state: RootState) => state.rooms.drawingsByRoom[roomId]?.[currentUserId],
    )?.dataUrl ?? '';

  useEffect(() => {
    if (!id_room) {
      navigate('/home', { replace: true });
      return;
    }

    localStorage.setItem('activeRoomId', id_room);
    localStorage.setItem('activeRoomPath', `/rooms/${id_room}/drowing`);

    let mounted = true;

    const loadDrawing = async () => {
      try {
        const resp = await fetchRoomDrawing({ id_room });
        if (!mounted) return;
        if (!resp.ok) {
          window.alert(resp.message || 'Не удалось загрузить рисунок');
          return;
        }
        if (resp.redirect) {
          const nextPath = resp.redirect.startsWith('/')
            ? resp.redirect
            : `/rooms/${id_room}/${resp.redirect}`;
          navigate(nextPath, { replace: true });
          return;
        }
        setTopic(resp.topic ?? null);
        if (resp.participants?.length) {
          dispatch(
            setParticipants({
              roomId,
              participants: resp.participants.map((participant) => ({
                id: participant.id,
                nickname: participant.nickname,
              })),
            }),
          );
        }
        if (resp.points) {
          setPoints(resp.points);
        }
        if (resp.snapshot) {
          snapshotRef.current = resp.snapshot;
          dispatch(
            upsertDrawing({
              roomId,
              userId: currentUserId,
              nickname,
              dataUrl: resp.snapshot,
            }),
          );
        }
      } catch (err) {
        console.error('Failed to load drawing', err);
        if (mounted) window.alert('Не удалось загрузить рисунок');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDrawing();

    return () => {
      mounted = false;
    };
  }, [currentUserId, dispatch, id_room, navigate, nickname, roomId]);

  useEffect(() => {
    if (!participants.length && nickname) {
      dispatch(
        setParticipants({
          roomId,
          participants: [{ id: currentUserId, nickname }],
        }),
      );
    }
  }, [currentUserId, dispatch, nickname, participants.length, roomId]);

  const handleSnapshot = (dataUrl: string) => {
    snapshotRef.current = dataUrl || null;
    dispatch(
      upsertDrawing({
        roomId,
        userId: currentUserId,
        nickname,
        dataUrl,
      }),
    );
  };

  const handlePointsChange = async (nextPoints: DrawingPoint[]) => {
    if (!id_room) return;
    setPoints(nextPoints);
    try {
      const resp = await submitRoomDrawing({
        id_room,
        points: nextPoints,
        snapshot: snapshotRef.current,
      });
      if (!resp.ok) {
        console.warn('Failed to save drawing', resp);
      }
      if (resp.ok && resp.redirect) {
        const nextPath = resp.redirect.startsWith('/')
          ? resp.redirect
          : `/rooms/${id_room}/${resp.redirect}`;
        navigate(nextPath, { replace: true });
      }
    } catch (err) {
      console.error('Failed to save drawing', err);
    }
  };

  const handleShowResults = async () => {
    if (!id_room) return;
    try {
      const resp = await getRoomResults(id_room);
      if (!resp.ok) {
        window.alert(resp.message || 'Не удалось загрузить результаты');
        return;
      }
      if (resp.message === 'Voting still in progress') {
        window.alert('Еще не все проголосовали. Подождите остальных.');
        return;
      }
      navigate(`/rooms/${roomId}/results`);
    } catch (err) {
      console.error('Failed to check room results', err);
      window.alert('Не удалось проверить результаты');
    }
  };

  return (
    <div className="room-page">
      <div>
        <h1 className="room-title">Комната</h1>
        <p className="room-subtitle">ID комнаты: {id_room ?? '—'}</p>
        <p className="room-drawing-hint">
          {topic
            ? `Пока остальные голосуют, нарисуйте: ${topic}`
            : 'Пока остальные голосуют, нарисуйте: типичный ИТМОшник'}
        </p>
      </div>

      <div className="room-drawing-layout">
        <DrawingCanvas
          tool={tool}
          color={color}
          brushSize={brushSize}
          clearSignal={clearSignal}
          onSnapshot={handleSnapshot}
          onPointsChange={handlePointsChange}
          initialImage={drawing || null}
          initialPoints={points}
        />

        <ToolBar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          onClear={() => {
            setClearSignal((x) => x + 1);
          }}
        />

        <div className="room-participants">
          {participants.map((participant) => (
            <div key={participant.id} className="room-participant">
              <div className="room-participant__avatar" />
              <div className="room-participant__name">
                {participant.nickname}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="room-actions">
        <button
          type="button"
          className="room-button room-button--ghost"
          onClick={handleShowResults}
          disabled={loading}
        >
          Результаты
        </button>
        <button
          type="button"
          className="room-button"
          onClick={() => {
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
