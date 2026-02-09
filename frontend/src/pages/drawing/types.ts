export type ToolType = 'pen' | 'eraser';

export interface DrawingTopicResponse {
  ok: boolean;
  topic?: string;
  message?: string;
}
