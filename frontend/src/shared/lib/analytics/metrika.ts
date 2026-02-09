type MetrikaPrimitive = string | number | boolean;
type MetrikaParams = Record<string, MetrikaPrimitive | null | undefined>;

export const METRIKA_GOALS = {
  SessionStart: 'session_start',
  PageView: 'page_view',
  AuthLoginAttempt: 'auth_login_attempt',
  AuthLoginSuccess: 'auth_login_success',
  AuthLoginFailure: 'auth_login_failure',
  AuthRegisterAttempt: 'auth_register_attempt',
  AuthRegisterSuccess: 'auth_register_success',
  AuthRegisterFailure: 'auth_register_failure',
  HomeConnectClick: 'home_connect_click',
  HomeCreateRoomClick: 'home_create_room_click',
  HomeHistoryClick: 'home_history_click',
  HomeCollectionOpen: 'home_collection_open',
  RoomCreateAttempt: 'room_create_attempt',
  RoomCreateSuccess: 'room_create_success',
  RoomCreateFailure: 'room_create_failure',
  RoomConnectAttempt: 'room_connect_attempt',
  RoomConnectSuccess: 'room_connect_success',
  RoomConnectFailure: 'room_connect_failure',
  RoomVoteOpen: 'room_vote_open',
  RoomVoteYes: 'room_vote_yes',
  RoomVoteNo: 'room_vote_no',
  RoomLeave: 'room_leave',
  RoomDrawingOpen: 'room_drawing_open',
  RoomShowResultsClick: 'room_show_results_click',
  RoomResultsOpen: 'room_results_open',
  RoomResultsMatch: 'room_results_match',
  RoomResultsNoMatch: 'room_results_no_match',
  RoomDrawingsOpen: 'room_drawings_open',
  Logout: 'logout',
} as const;

export type MetrikaGoalName = (typeof METRIKA_GOALS)[keyof typeof METRIKA_GOALS];

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const METRIKA_SCRIPT_ID = 'yandex-metrika-tag';
const counterId = Number(import.meta.env.VITE_YANDEX_METRIKA_ID);
const isEnabled = Number.isFinite(counterId) && counterId > 0;
let initialized = false;
let sessionTracked = false;
let lastPagePath = '';
let lastPageAt = 0;

const sanitizeParams = (params?: MetrikaParams) => {
  if (!params) return undefined;

  const payload: Record<string, MetrikaPrimitive> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      payload[key] = value;
    }
  });

  return Object.keys(payload).length ? payload : undefined;
};

const createYmStub = () => {
  if (typeof window.ym === 'function') return;

  const queue: unknown[][] = [];
  const stub = (...args: unknown[]) => {
    queue.push(args);
  };

  Object.defineProperty(stub, 'a', {
    value: queue,
    writable: true,
    configurable: true,
  });

  window.ym = stub as (...args: unknown[]) => void;
};

const loadMetrikaScript = () => {
  if (document.getElementById(METRIKA_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = METRIKA_SCRIPT_ID;
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(script);
};

const sendYm = (...args: unknown[]) => {
  if (!isEnabled) return;
  if (typeof window.ym !== 'function') return;
  window.ym(counterId, ...args);
};

export const initMetrika = () => {
  if (!isEnabled || initialized || typeof window === 'undefined') return;

  createYmStub();
  loadMetrikaScript();
  sendYm('init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
  initialized = true;

  if (!sessionTracked) {
    trackGoal(METRIKA_GOALS.SessionStart);
    sessionTracked = true;
  }
};

export const trackGoal = (goal: MetrikaGoalName, params?: MetrikaParams) => {
  if (!isEnabled) return;
  const goalParams = sanitizeParams(params);
  if (goalParams) {
    sendYm('reachGoal', goal, goalParams);
    return;
  }
  sendYm('reachGoal', goal);
};

export const trackPageView = (
  pathname: string,
  options?: { title?: string; search?: string; hash?: string },
) => {
  if (!isEnabled) return;

  const search = options?.search ?? '';
  const hash = options?.hash ?? '';
  const fullPath = `${pathname}${search}${hash}`;
  const now = Date.now();

  if (lastPagePath === fullPath && now - lastPageAt < 500) return;
  lastPagePath = fullPath;
  lastPageAt = now;

  const pageTitle = options?.title ?? document.title;
  sendYm('hit', fullPath, { title: pageTitle });
  trackGoal(METRIKA_GOALS.PageView, { path: fullPath });
};

export const metrikaEnabled = isEnabled;
