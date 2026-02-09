export type WorkerDrawingPoint = {
  x: number;
  y: number;
  color?: string | null;
};

export type DrawingWorkerRequest = {
  requestId: number;
  points: WorkerDrawingPoint[];
};

export type DrawingWorkerResponse = {
  requestId: number;
  points: WorkerDrawingPoint[];
};

const roundTo = (value: number, fractionDigits = 2) => {
  const power = 10 ** fractionDigits;
  return Math.round(value * power) / power;
};

export const normalizeDrawingPoints = (points: WorkerDrawingPoint[]): WorkerDrawingPoint[] => {
  const normalized: WorkerDrawingPoint[] = [];

  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;

    const nextPoint: WorkerDrawingPoint = {
      x: roundTo(point.x),
      y: roundTo(point.y),
      color: point.color ?? null,
    };

    const previousPoint = normalized[normalized.length - 1];
    const isDuplicate =
      previousPoint &&
      previousPoint.x === nextPoint.x &&
      previousPoint.y === nextPoint.y &&
      (previousPoint.color ?? null) === (nextPoint.color ?? null);

    if (isDuplicate) continue;
    normalized.push(nextPoint);
  }

  return normalized;
};
