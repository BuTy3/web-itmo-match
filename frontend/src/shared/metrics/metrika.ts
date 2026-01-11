const METRIKA_SCRIPT_ID = 'yandex-metrika-tag';

type YmFn = (counterId: number, method: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    ym?: YmFn & { a?: unknown[]; l?: number };
  }
}

const getCounterId = (): number | null => {
  const rawId = import.meta.env.VITE_YANDEX_METRIKA_ID;
  const parsed = Number(rawId);
  return Number.isFinite(parsed) ? parsed : null;
};

const ensureMetrika = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const counterId = getCounterId();
  if (!counterId) {
    return;
  }

  if (!window.ym) {
    const ymStub: YmFn & { a?: unknown[]; l?: number } = (
      counter: number,
      method: string,
      ...args: unknown[]
    ) => {
      if (!ymStub.a) {
        ymStub.a = [];
      }
      ymStub.a.push([counter, method, ...args]);
    };
    ymStub.l = Date.now();
    window.ym = ymStub;
  }

  if (document.getElementById(METRIKA_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement('script');
  script.id = METRIKA_SCRIPT_ID;
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);

  window.ym(counterId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
};

const callYm = (method: string, ...args: unknown[]) => {
  const counterId = getCounterId();
  if (!counterId) {
    return;
  }

  ensureMetrika();
  window.ym?.(counterId, method, ...args);
};

export const trackPageView = (path: string) => {
  callYm('hit', path);
};

export const trackPageTime = (
  pageKey: 'drawing' | 'room' | 'room_drawing',
  path: string,
  seconds: number,
) => {
  if (seconds <= 0) {
    return;
  }

  callYm('reachGoal', 'time_on_page', { page: pageKey, path, seconds });
};

export const trackTotalTime = (seconds: number) => {
  if (seconds <= 0) {
    return;
  }

  callYm('reachGoal', 'total_time_on_site', { seconds });
};

export { ensureMetrika };
