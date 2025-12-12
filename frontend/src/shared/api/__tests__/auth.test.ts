import { describe, expect, it, jest } from '@jest/globals';
import { login, register } from '../auth';
import { apiClient } from '../client';

jest.mock('../client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('auth API', () => {
  it('calls /auth/register with login and password', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { ok: true, token: 't1' } });
    const resp = await register({ login: 'user1', password: 'pass' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', { login: 'user1', password: 'pass' });
    expect(resp).toEqual({ ok: true, token: 't1' });
  });

  it('calls /auth/login with login and password', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { ok: true, token: 't2' } });
    const resp = await login({ login: 'user1', password: 'pass' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { login: 'user1', password: 'pass' });
    expect(resp).toEqual({ ok: true, token: 't2' });
  });

  it('returns message when backend responds with error', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { ok: false, message: 'Ошибка' } });
    const resp = await register({ login: 'user2', password: 'fail' });
    expect(resp).toEqual({ ok: false, message: 'Ошибка' });
  });
});
