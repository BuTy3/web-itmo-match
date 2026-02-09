import { jest } from '@jest/globals';
import {
  fetchReadyCollections,
  fetchUserCollections,
  findRoomById,
} from '../../src/services/home.service.js';
import { prisma } from '../../src/db.js';

describe('home.service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetchReadyCollections maps DB rows to DTO', async () => {
    jest.spyOn(prisma.collection, 'findMany').mockResolvedValue([
      {
        id: BigInt(1),
        image_url: 'https://img',
        type: 'DEFAULT',
        description: 'desc',
        item: [
          {
            id: BigInt(5),
            image_url: null,
            description: 'item desc',
            title: null,
          },
        ],
      },
    ]);

    const result = await fetchReadyCollections();

    expect(result).toEqual([
      {
        id: 1,
        url_image: 'https://img',
        type: 'DEFAULT',
        title: null,
        description: 'desc',
        items: [
          {
            item_id: 5,
            url_image: null,
            title: null,
            description: 'item desc',
          },
        ],
      },
    ]);
    expect(prisma.collection.findMany).toHaveBeenCalled();
  });

  it('fetchUserCollections uses owner filter and maps DTO', async () => {
    const userId = BigInt(77);
    jest.spyOn(prisma.collection, 'findMany').mockResolvedValue([
      {
        id: BigInt(2),
        owner_id: userId,
        image_url: null,
        type: 'DEFAULT',
        description: null,
        item: [],
      },
    ]);

    const result = await fetchUserCollections(userId);

    expect(prisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { owner_id: userId },
      }),
    );
    expect(result[0]).toMatchObject({ id: 2, items: [] });
  });

  it('findRoomById delegates to prisma', async () => {
    const roomId = BigInt(88);
    jest.spyOn(prisma.room, 'findUnique').mockResolvedValue({ id: roomId });

    const room = await findRoomById(roomId);

    expect(room).toEqual({ id: roomId });
    expect(prisma.room.findUnique).toHaveBeenCalledWith({
      where: { id: roomId },
      select: { id: true, status: true },
    });
  });
});
