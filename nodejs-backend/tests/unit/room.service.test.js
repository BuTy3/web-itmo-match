/**
 * Unit tests for room.service.js
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock prisma before importing the service
const mockPrisma = {
  room: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  collection: {
    findFirst: jest.fn(),
  },
  room_participant: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
};

jest.unstable_mockModule('../../src/db.js', () => ({
  prisma: mockPrisma,
}));

// Import after mocking
const { getVotingState, submitVote, getRoomResults, leaveRoom, joinRoom } =
  await import('../../src/services/room.service.js');

describe('room.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVotingState', () => {
    it('should return error if room not found', async () => {
      mockPrisma.room.findUnique.mockResolvedValue(null);

      const result = await getVotingState(BigInt(999), '1');

      expect(result.error).toBe('Room not found');
    });

    it('should return error if user is not a participant', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Test Room',
        status: 'ACTIVE',
        creator_id: BigInt(1),
        users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
        room_participant: [
          {
            user_id: BigInt(2),
            users: { id: BigInt(2), display_name: 'Other', avatar_url: null },
          },
        ],
      });
      mockPrisma.collection.findFirst.mockResolvedValue({
        id: BigInt(1),
        item: [
          {
            id: BigInt(1),
            title: 'Item 1',
            description: null,
            image_url: null,
          },
        ],
      });

      const result = await getVotingState(BigInt(1), '999');

      expect(result.error).toBe('User is not a participant in this room');
    });

    it('should return voting state with current item for participant', async () => {
      const roomData = {
        id: BigInt(1),
        name: 'Test Room',
        status: 'ACTIVE',
        creator_id: BigInt(1),
        users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
        room_participant: [
          {
            user_id: BigInt(1),
            users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
          },
        ],
      };
      const collectionData = {
        id: BigInt(1),
        item: [
          {
            id: BigInt(1),
            title: 'Item 1',
            description: 'Desc 1',
            image_url: 'http://img1.jpg',
          },
          {
            id: BigInt(2),
            title: 'Item 2',
            description: 'Desc 2',
            image_url: 'http://img2.jpg',
          },
        ],
      };

      mockPrisma.room.findUnique.mockResolvedValue(roomData);
      mockPrisma.collection.findFirst.mockResolvedValue(collectionData);

      const result = await getVotingState(BigInt(1), '1');

      expect(result.room_id).toBe('1');
      expect(result.room_name).toBe('Test Room');
      expect(result.current_item).toBeDefined();
      expect(result.current_item.id).toBe('1');
      expect(result.current_item.title).toBe('Item 1');
      expect(result.total_items).toBe(2);
      expect(result.voted_count).toBe(0);
      expect(result.is_finished).toBe(false);
      expect(result.all_finished).toBe(false);
    });

    it('should return all_finished=true for closed room', async () => {
      const roomData = {
        id: BigInt(1),
        name: 'Test Room',
        status: 'CLOSED',
        creator_id: BigInt(1),
        users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
        room_participant: [
          {
            user_id: BigInt(1),
            users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
          },
        ],
      };
      const collectionData = {
        id: BigInt(1),
        item: [
          {
            id: BigInt(1),
            title: 'Item 1',
            description: null,
            image_url: null,
          },
        ],
      };

      mockPrisma.room.findUnique.mockResolvedValue(roomData);
      mockPrisma.collection.findFirst.mockResolvedValue(collectionData);

      const result = await getVotingState(BigInt(1), '1');

      expect(result.is_finished).toBe(true);
      expect(result.all_finished).toBe(true);
      expect(result.current_item).toBeNull();
    });
  });

  describe('submitVote', () => {
    it('should return error if room not found', async () => {
      mockPrisma.room.findUnique.mockResolvedValue(null);

      const result = await submitVote(BigInt(999), '1', '1', true);

      expect(result.ok).toBe(false);
      expect(result.message).toBe('Room not found');
    });

    it('should return error if room is closed', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Test Room',
        status: 'CLOSED',
        creator_id: BigInt(1),
        users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
        room_participant: [
          {
            user_id: BigInt(1),
            users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
          },
        ],
      });
      mockPrisma.collection.findFirst.mockResolvedValue({
        id: BigInt(1),
        item: [
          {
            id: BigInt(1),
            title: 'Item 1',
            description: null,
            image_url: null,
          },
        ],
      });

      const result = await submitVote(BigInt(1), '1', '1', true);

      expect(result.ok).toBe(false);
      expect(result.message).toBe('Room is already closed');
    });

    it('should submit vote and return next item', async () => {
      const roomData = {
        id: BigInt(1),
        name: 'Test Room',
        status: 'ACTIVE',
        creator_id: BigInt(1),
        users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
        room_participant: [
          {
            user_id: BigInt(1),
            users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
          },
        ],
      };
      const collectionData = {
        id: BigInt(1),
        item: [
          {
            id: BigInt(1),
            title: 'Item 1',
            description: null,
            image_url: null,
          },
          {
            id: BigInt(2),
            title: 'Item 2',
            description: null,
            image_url: null,
          },
        ],
      };

      mockPrisma.room.findUnique.mockResolvedValue(roomData);
      mockPrisma.collection.findFirst.mockResolvedValue(collectionData);

      const result = await submitVote(BigInt(1), '1', '1', true);

      expect(result.ok).toBe(true);
      expect(result.next_item).toBeDefined();
      expect(result.next_item.id).toBe('2');
      expect(result.is_finished).toBe(false);
    });

    it('should mark user as finished when all items voted', async () => {
      const roomData = {
        id: BigInt(1),
        name: 'Test Room',
        status: 'ACTIVE',
        creator_id: BigInt(1),
        users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
        room_participant: [
          {
            user_id: BigInt(1),
            users: { id: BigInt(1), display_name: 'Creator', avatar_url: null },
          },
          {
            user_id: BigInt(2),
            users: { id: BigInt(2), display_name: 'Other', avatar_url: null },
          },
        ],
      };
      const collectionData = {
        id: BigInt(1),
        item: [
          {
            id: BigInt(1),
            title: 'Item 1',
            description: null,
            image_url: null,
          },
        ],
      };

      mockPrisma.room.findUnique.mockResolvedValue(roomData);
      mockPrisma.collection.findFirst.mockResolvedValue(collectionData);

      const result = await submitVote(BigInt(1), '1', '1', true);

      expect(result.ok).toBe(true);
      expect(result.is_finished).toBe(true);
      expect(result.all_finished).toBe(false); // Other user hasn't voted
      expect(result.redirect_to).toBe('drawing');
    });
  });

  describe('getRoomResults', () => {
    it('should return error if room not found', async () => {
      mockPrisma.room.findUnique.mockResolvedValue(null);

      const result = await getRoomResults(BigInt(999), '1');

      expect(result.ok).toBe(false);
      expect(result.message).toBe('Room not found');
    });

    it('should return error if user is not participant', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        status: 'CLOSED',
        result: { has_match: true, matched_items: [] },
        room_participant: [{ user_id: BigInt(2) }],
      });

      const result = await getRoomResults(BigInt(1), '999');

      expect(result.ok).toBe(false);
      expect(result.message).toBe('Access denied');
    });

    it('should return results for closed room', async () => {
      const matchedItems = [
        {
          id: '1',
          title: 'Item 1',
          description: null,
          image_url: 'http://img.jpg',
        },
      ];

      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        status: 'CLOSED',
        result: { has_match: true, matched_items: matchedItems },
        room_participant: [{ user_id: BigInt(1) }],
      });

      const result = await getRoomResults(BigInt(1), '1');

      expect(result.ok).toBe(true);
      expect(result.has_match).toBe(true);
      expect(result.matched_items).toEqual(matchedItems);
    });

    it('should return no match for room still in progress', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        status: 'ACTIVE',
        result: null,
        room_participant: [{ user_id: BigInt(1) }],
      });

      const result = await getRoomResults(BigInt(1), '1');

      expect(result.ok).toBe(true);
      expect(result.has_match).toBe(false);
      expect(result.matched_items).toEqual([]);
    });
  });

  describe('leaveRoom', () => {
    it('should return error if room not found', async () => {
      mockPrisma.room.findUnique.mockResolvedValue(null);

      const result = await leaveRoom(BigInt(999), '1');

      expect(result.ok).toBe(false);
      expect(result.message).toBe('Room not found');
    });

    it('should return error if user is not in room', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        room_participant: [{ user_id: BigInt(2) }],
      });

      const result = await leaveRoom(BigInt(1), '999');

      expect(result.ok).toBe(false);
      expect(result.message).toBe('User is not in this room');
    });

    it('should successfully leave room', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        room_participant: [{ user_id: BigInt(1) }],
      });
      mockPrisma.room_participant.delete.mockResolvedValue({});

      const result = await leaveRoom(BigInt(1), '1');

      expect(result.ok).toBe(true);
      expect(mockPrisma.room_participant.delete).toHaveBeenCalledWith({
        where: {
          room_id_user_id: {
            room_id: BigInt(1),
            user_id: BigInt(1),
          },
        },
      });
    });
  });

  describe('joinRoom', () => {
    it('should return error if room not found', async () => {
      mockPrisma.room.findUnique.mockResolvedValue(null);

      const result = await joinRoom(BigInt(999), '1');

      expect(result.ok).toBe(false);
      expect(result.message).toBe('Room not found');
    });

    it('should return error if room is closed', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        status: 'CLOSED',
      });

      const result = await joinRoom(BigInt(1), '1');

      expect(result.ok).toBe(false);
      expect(result.message).toBe('Room is closed');
    });

    it('should add new participant and activate room', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        status: 'OPEN',
      });
      mockPrisma.room_participant.findUnique.mockResolvedValue(null);
      mockPrisma.room_participant.create.mockResolvedValue({});
      mockPrisma.room.update.mockResolvedValue({});

      const result = await joinRoom(BigInt(1), '1');

      expect(result.ok).toBe(true);
      expect(mockPrisma.room_participant.create).toHaveBeenCalled();
      expect(mockPrisma.room.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 'ACTIVE' },
      });
    });

    it('should not add duplicate participant', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: BigInt(1),
        status: 'ACTIVE',
      });
      mockPrisma.room_participant.findUnique.mockResolvedValue({
        room_id: BigInt(1),
        user_id: BigInt(1),
      });

      const result = await joinRoom(BigInt(1), '1');

      expect(result.ok).toBe(true);
      expect(mockPrisma.room_participant.create).not.toHaveBeenCalled();
    });
  });
});
