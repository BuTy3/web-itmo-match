/**
 * Unit tests for history.service.js
 */
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock prisma before importing the service
const mockPrisma = {
  room: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  },
};

jest.unstable_mockModule("../../src/db.js", () => ({
  prisma: mockPrisma,
}));

// Import after mocking
const { fetchHistoryRooms, fetchRoomHistory } = await import(
  "../../src/services/history.service.js"
);

describe("history.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchHistoryRooms", () => {
    it("should return empty array when no rooms found", async () => {
      mockPrisma.room.findMany.mockResolvedValue([]);

      const result = await fetchHistoryRooms(BigInt(1));

      expect(result).toEqual([]);
      expect(mockPrisma.room.findMany).toHaveBeenCalled();
    });

    it("should return rooms mapped to DTO format", async () => {
      const mockRooms = [
        {
          id: BigInt(1),
          name: "Test Room",
          topic: "Прогулка",
          match_mode: "FIRST_MATCH",
          status: "CLOSED",
          created_at: new Date("2024-12-15T10:00:00Z"),
          result: { image_url: "http://example.com/img.jpg" },
        },
      ];

      mockPrisma.room.findMany.mockResolvedValue(mockRooms);

      const result = await fetchHistoryRooms(BigInt(1));

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "1",
        name: "Test Room",
        url_image: "http://example.com/img.jpg",
        type: "Прогулка",
        description: "Прогулка",
        date: "15.12.2024",
      });
    });

    it("should apply name filter", async () => {
      mockPrisma.room.findMany.mockResolvedValue([]);

      await fetchHistoryRooms(BigInt(1), { name: "вечер" });

      const callArgs = mockPrisma.room.findMany.mock.calls[0][0];
      expect(callArgs.where.AND).toContainEqual({
        name: { contains: "вечер", mode: "insensitive" },
      });
    });

    it("should apply type filter for topic", async () => {
      mockPrisma.room.findMany.mockResolvedValue([]);

      await fetchHistoryRooms(BigInt(1), { type: "Прогулка" });

      const callArgs = mockPrisma.room.findMany.mock.calls[0][0];
      expect(callArgs.where.AND).toContainEqual({
        topic: { equals: "Прогулка", mode: "insensitive" },
      });
    });

    it("should apply type filter for match_mode", async () => {
      mockPrisma.room.findMany.mockResolvedValue([]);

      await fetchHistoryRooms(BigInt(1), { type: "FIRST_MATCH" });

      const callArgs = mockPrisma.room.findMany.mock.calls[0][0];
      expect(callArgs.where.AND).toContainEqual({
        match_mode: "FIRST_MATCH",
      });
    });

    it("should apply date filter", async () => {
      mockPrisma.room.findMany.mockResolvedValue([]);

      await fetchHistoryRooms(BigInt(1), { date: "15.12.2024" });

      const callArgs = mockPrisma.room.findMany.mock.calls[0][0];
      const dateFilter = callArgs.where.AND.find((f) => f.created_at);
      expect(dateFilter).toBeDefined();
      expect(dateFilter.created_at.gte).toBeDefined();
      expect(dateFilter.created_at.lt).toBeDefined();
    });

    it("should use match_mode as type fallback when topic is null", async () => {
      const mockRooms = [
        {
          id: BigInt(1),
          name: "Test Room",
          topic: null,
          match_mode: "WATCH_ALL",
          status: "CLOSED",
          created_at: new Date("2024-12-15T10:00:00Z"),
          result: null,
        },
      ];

      mockPrisma.room.findMany.mockResolvedValue(mockRooms);

      const result = await fetchHistoryRooms(BigInt(1));

      expect(result[0].type).toBe("WATCH_ALL");
      expect(result[0].url_image).toBeNull();
    });
  });

  describe("fetchRoomHistory", () => {
    it("should return null if room not found", async () => {
      mockPrisma.room.findFirst.mockResolvedValue(null);

      const result = await fetchRoomHistory(BigInt(999), BigInt(1));

      expect(result).toBeNull();
    });

    it("should return detailed room history", async () => {
      const mockRoom = {
        id: BigInt(1),
        name: "Test Room",
        topic: "Прогулка",
        match_mode: "FIRST_MATCH",
        status: "CLOSED",
        access_mode: "PUBLIC",
        created_at: new Date("2024-12-15T10:00:00Z"),
        closed_at: new Date("2024-12-15T12:00:00Z"),
        result: { matched: true },
        users: {
          id: BigInt(1),
          display_name: "Creator",
          avatar_url: "http://avatar.jpg",
        },
        room_participant: [
          {
            user_id: BigInt(1),
            joined_at: new Date("2024-12-15T10:00:00Z"),
            finished_at: new Date("2024-12-15T11:00:00Z"),
            users: {
              id: BigInt(1),
              display_name: "Creator",
              avatar_url: "http://avatar.jpg",
            },
          },
          {
            user_id: BigInt(2),
            joined_at: new Date("2024-12-15T10:05:00Z"),
            finished_at: null,
            users: {
              id: BigInt(2),
              display_name: "Participant",
              avatar_url: null,
            },
          },
        ],
      };

      mockPrisma.room.findFirst.mockResolvedValue(mockRoom);

      const result = await fetchRoomHistory(BigInt(1), BigInt(1));

      expect(result).not.toBeNull();
      expect(result.id).toBe("1");
      expect(result.name).toBe("Test Room");
      expect(result.topic).toBe("Прогулка");
      expect(result.match_mode).toBe("FIRST_MATCH");
      expect(result.status).toBe("CLOSED");
      expect(result.access_mode).toBe("PUBLIC");
      expect(result.date).toBe("15.12.2024");
      expect(result.result).toEqual({ matched: true });

      // Check creator
      expect(result.creator.id).toBe("1");
      expect(result.creator.display_name).toBe("Creator");

      // Check participants
      expect(result.participants).toHaveLength(2);
      expect(result.participants[0].user_id).toBe("1");
      expect(result.participants[0].finished_at).not.toBeNull();
      expect(result.participants[1].user_id).toBe("2");
      expect(result.participants[1].finished_at).toBeNull();
    });

    it("should check user is participant via query", async () => {
      mockPrisma.room.findFirst.mockResolvedValue(null);

      await fetchRoomHistory(BigInt(1), BigInt(5));

      const callArgs = mockPrisma.room.findFirst.mock.calls[0][0];
      expect(callArgs.where.room_participant.some.user_id).toEqual(BigInt(5));
    });
  });
});

