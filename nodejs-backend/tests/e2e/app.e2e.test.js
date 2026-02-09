import { jest } from '@jest/globals';
import app from '../../src/app.js';
import { prisma } from '../../src/db.js';
import { createToken } from '../../src/security/jwt.js';

const startServer = () =>
  new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });

const stopServer = (server) =>
  new Promise((resolve) => {
    server.close(() => resolve());
  });

const buildAuthHeader = (user = { id: 1, login: 'tester', ukey: 'ukey' }) => {
  const token = createToken(user);
  return `Bearer ${token}`;
};

describe('E2E app routes', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('GET /drawing/topic returns topic', async () => {
    const { server, baseUrl } = await startServer();
    try {
      const res = await fetch(`${baseUrl}/drawing/topic`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(typeof body.topic).toBe('string');
    } finally {
      await stopServer(server);
    }
  });

  it('GET /home returns mapped collections', async () => {
    jest.spyOn(prisma.collection, 'findMany').mockResolvedValue([
      {
        id: BigInt(1),
        image_url: 'https://img',
        type: 'DEFAULT',
        description: 'desc',
        item: [],
      },
    ]);

    const { server, baseUrl } = await startServer();
    try {
      const res = await fetch(`${baseUrl}/home`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.collections[0]).toMatchObject({
        id: 1,
        url_image: 'https://img',
      });
    } finally {
      await stopServer(server);
    }
  });

  it('POST /home requires auth and returns user collections', async () => {
    jest.spyOn(prisma.collection, 'findMany').mockResolvedValue([
      {
        id: BigInt(2),
        owner_id: BigInt(1),
        image_url: null,
        type: 'DEFAULT',
        description: null,
        item: [],
      },
    ]);

    const { server, baseUrl } = await startServer();
    try {
      const res = await fetch(`${baseUrl}/home`, {
        method: 'POST',
        headers: {
          Authorization: buildAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.collections).toHaveLength(1);
      expect(body.collections[0].id).toBe(2);
    } finally {
      await stopServer(server);
    }
  });

  it('POST /home/search returns 404 when room missing', async () => {
    jest.spyOn(prisma.room, 'findUnique').mockResolvedValue(null);
    const { server, baseUrl } = await startServer();
    try {
      const res = await fetch(`${baseUrl}/home/search`, {
        method: 'POST',
        headers: {
          Authorization: buildAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 99 }),
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.message).toBe('Room not found');
    } finally {
      await stopServer(server);
    }
  });

  it('POST /home/search returns room id when found', async () => {
    jest.spyOn(prisma.room, 'findUnique').mockResolvedValue({
      id: BigInt(42),
      status: 'CLOSED',
    });

    const { server, baseUrl } = await startServer();
    try {
      const res = await fetch(`${baseUrl}/home/search`, {
        method: 'POST',
        headers: {
          Authorization: buildAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 42 }),
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.id_room).toBe(42);
    } finally {
      await stopServer(server);
    }
  });
});
