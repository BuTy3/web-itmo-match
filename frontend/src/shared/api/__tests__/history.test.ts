import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getHistory, getRoomHistory } from '../history';
import { apiClient } from '../client';

jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('history API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls /history with query filters', async () => {
    const mockedPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
    mockedPost.mockResolvedValueOnce({ data: { ok: true, rooms: [] } as never });

    const resp = await getHistory({
      token: 't1',
      filters: { name: 'Room', type: 'Topic', date: '01.01.2025' },
    });

    expect(apiClient.post).toHaveBeenCalledWith('/history', {
      token: 't1',
      filters: { name: 'Room', type: 'Topic', date: '01.01.2025' },
    });
    expect(resp).toEqual({ ok: true, rooms: [] });
  });

  it('calls /history/:id for room history', async () => {
    const mockedGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
    mockedGet.mockResolvedValueOnce({ data: { ok: true, room: { id: '1' } } as never });

    const resp = await getRoomHistory({ token: 't1', id_room: '1' });

    expect(apiClient.get).toHaveBeenCalledWith('/history/1');
    expect(resp).toEqual({ ok: true, room: { id: '1' } });
  });

  it('returns placeholder room details for id_room=0 without backend call', async () => {
    const resp = await getRoomHistory({ token: 't1', id_room: '0' });
    expect(resp.ok).toBe(true);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('returns placeholder room details for old mock id without backend call', async () => {
    const resp = await getRoomHistory({ token: 't1', id_room: 'room-1' });
    expect(resp.ok).toBe(true);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('validates id_room on frontend', async () => {
    const resp = await getRoomHistory({ token: 't1', id_room: 'abc' });
    expect(resp.ok).toBe(false);
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});
