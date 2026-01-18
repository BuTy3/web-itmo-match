import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { DrawingCanvas } from '../drawing/components/DrawingCanvas';
import { ToolBar } from '../drawing/components/ToolBar';
import type { AppDispatch, RootState } from '../../app/store';
import {
  setParticipants,
  upsertDrawing,
  type RoomParticipant,
} from '../../features/rooms/model/roomsSlice';
import './rooms.css';
import '../drawing/drawing.css';

// TODO: заменить на реальные данные участников из API комнаты.
const buildFallbackParticipants = (
  currentUserId: string,
  nickname: string,
): RoomParticipant[] => [
  { id: currentUserId, nickname },
  { id: 'nick-1', nickname: 'Ник1' },
  { id: 'nick-2', nickname: 'Ник2' },
];

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
    if (!participants.length) {
      dispatch(
        setParticipants({
          roomId,
          participants: buildFallbackParticipants(currentUserId, nickname),
        }),
      );
    }
  }, [currentUserId, dispatch, nickname, participants.length, roomId]);

  const handleSnapshot = (dataUrl: string) => {
    dispatch(
      upsertDrawing({
        roomId,
        userId: currentUserId,
        nickname,
        dataUrl,
      }),
    );
  };

  return (
    <div className="room-page">
      <div>
        <h1 className="room-title">Комната</h1>
        <p className="room-drawing-hint">
          Пока остальные голосуют, нарисуйте: типичный ИТМОшник
        </p>
      </div>

      <div className="room-drawing-layout">
        <DrawingCanvas
          tool={tool}
          color={color}
          brushSize={brushSize}
          clearSignal={clearSignal}
          onSnapshot={handleSnapshot}
          initialImage={drawing || null}
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
          onClick={() => navigate(`/rooms/${roomId}/results`)}
        >
          Результаты
        </button>
        <button type="button" className="room-button" onClick={() => navigate('/')}>
          Выйти из комнаты
        </button>
      </div>
    </div>
  );
};
