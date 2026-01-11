import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageTime, trackPageView } from './metrika';

const ROOM_DRAWING_MATCH = /^\/rooms\/[^/]+\/d(?:r)?owing\/?$/;
const ROOM_MATCH = /^\/rooms\/[^/]+\/?$/;

const getTrackedPageKey = (path: string) => {
  if (path === '/drawing') {
    return 'drawing';
  }
  if (ROOM_DRAWING_MATCH.test(path)) {
    return 'room_drawing';
  }
  if (ROOM_MATCH.test(path)) {
    return 'room';
  }
  return null;
};

export const MetrikaRouteTracker = () => {
  const location = useLocation();
  const lastPathRef = useRef(location.pathname);
  const lastStartRef = useRef(Date.now());

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (lastPathRef.current === location.pathname) {
      return;
    }

    const prevPath = lastPathRef.current;
    const prevKey = getTrackedPageKey(prevPath);
    if (prevKey) {
      const seconds = Math.round((Date.now() - lastStartRef.current) / 1000);
      trackPageTime(prevKey, prevPath, seconds);
    }

    lastPathRef.current = location.pathname;
    lastStartRef.current = Date.now();
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      const prevPath = lastPathRef.current;
      const prevKey = getTrackedPageKey(prevPath);
      if (!prevKey) {
        return;
      }

      const seconds = Math.round((Date.now() - lastStartRef.current) / 1000);
      trackPageTime(prevKey, prevPath, seconds);
    };
  }, []);

  return null;
};
