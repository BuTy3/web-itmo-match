import { describe, expect, it, jest } from '@jest/globals';
import { getDrawingTopic } from '../drawing';
import { apiClient } from '../client';

jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('drawing API', () => {
  it('calls /drawing/topic without params when lastTopic is empty', async () => {
    const mockedGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
    mockedGet.mockResolvedValueOnce({ data: { ok: true, topic: 't1' } as never });

    const resp = await getDrawingTopic(null);

    expect(apiClient.get).toHaveBeenCalledWith('/drawing/topic', { params: undefined });
    expect(resp).toEqual({ ok: true, topic: 't1' });
  });

  it('calls /drawing/topic with last_topic param', async () => {
    const mockedGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
    mockedGet.mockResolvedValueOnce({ data: { ok: true, topic: 't2' } as never });

    const resp = await getDrawingTopic('prev');

    expect(apiClient.get).toHaveBeenCalledWith('/drawing/topic', { params: { last_topic: 'prev' } });
    expect(resp).toEqual({ ok: true, topic: 't2' });
  });
});

