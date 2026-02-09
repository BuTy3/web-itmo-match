import {
  normalizeDrawingPoints,
  type DrawingWorkerRequest,
  type DrawingWorkerResponse,
} from './pointsProcessing';

self.onmessage = (event: MessageEvent<DrawingWorkerRequest>) => {
  const payload = event.data;
  const response: DrawingWorkerResponse = {
    requestId: payload.requestId,
    points: normalizeDrawingPoints(payload.points),
  };

  self.postMessage(response);
};
