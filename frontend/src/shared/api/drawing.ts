import { apiClient } from './client';

export type DrawingTopicResponse = { ok: true; topic: string } | { ok: false; message: string };

export async function getDrawingTopic(lastTopic?: string | null) {
  const { data } = await apiClient.get<DrawingTopicResponse>('/drawing/topic', {
    params: lastTopic ? { last_topic: lastTopic } : undefined,
  });
  return data;
}
