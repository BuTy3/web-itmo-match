import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../../shared/api/history';
import type { HistoryRoom } from '../../shared/api/types';
import { HistoryRoomCard } from './components/HistoryRoomCard';
import './history.css';

const HISTORY_PLACEHOLDER_IMAGE = 'https://i.ytimg.com/vi/ilUPzCADxoA/maxresdefault.jpg';

type FiltersState = {
  name: string;
  type: string;
  date: string;
};

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<HistoryRoom[]>([]);
  const [filters, setFilters] = useState<FiltersState>({ name: '', type: '', date: '' });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const resp = await getHistory({
        filters: {
          name: filters.name || undefined,
          type: filters.type || undefined,
          date: filters.date || undefined,
        },
      });

      if (cancelled) return;

      if (!resp.ok) {
        navigate('/home');
        return;
      }

      setRooms(resp.rooms);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [filters.date, filters.name, filters.type, navigate]);

  const nameOptions = useMemo(() => {
    const unique = new Set(rooms.map((room) => room.name));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rooms]);

  const typeOptions = useMemo(() => {
    const unique = new Set(rooms.map((room) => room.type));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rooms]);

  const roomsToShow = useMemo(() => {
    if (rooms.length) return rooms;
    return [
      {
        id: '0',
        name: 'Пример комнаты',
        url_image: HISTORY_PLACEHOLDER_IMAGE,
        type: 'Демо',
        description: 'Заглушка истории',
        date: '—',
      },
    ];
  }, [rooms]);

  return (
    <div className="history-page">
      <h1 className="history-title">История</h1>

      <div className="history-filters">
        <select
          className={`history-filter history-filter--select${
            filters.name ? ' history-filter--active' : ''
          }`}
          value={filters.name}
          onChange={(event) => setFilters((prev) => ({ ...prev, name: event.target.value }))}
          aria-label="Фильтр по названию"
        >
          <option value="">Название</option>
          {nameOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          className={`history-filter history-filter--select${
            filters.type ? ' history-filter--active' : ''
          }`}
          value={filters.type}
          onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
          aria-label="Фильтр по типу"
        >
          <option value="">Тип</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          className={`history-filter${filters.date ? ' history-filter--active' : ''}`}
          value={filters.date}
          onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
          placeholder="Дата"
          aria-label="Фильтр по дате"
        />
      </div>

      <div className="history-grid">
        {roomsToShow.map((room) => (
          <HistoryRoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
};
