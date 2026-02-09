import { jest } from "@jest/globals";
import {
  fetchHistoryRooms,
  fetchRoomHistory,
} from "../../src/services/history.service.js";
import { prisma } from "../../src/db.js";

describe("history.service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetchHistoryRooms filters closed rooms and maps DTO", async () => {
    const userId = BigInt(55);
    jest
      .spyOn(prisma.room, "findMany")
      // First call - debug list
      .mockResolvedValueOnce([
        {
          id: BigInt(1),
          name: "Room debug",
          status: "CLOSED",
          creator_id: userId,
        },
      ])
      // Second call - actual payload
      .mockResolvedValueOnce([
        {
          id: BigInt(1),
          name: "Room A",
          topic: "Art",
          match_mode: "WATCH_ALL",
          status: "CLOSED",
          creator_id: userId,
          created_at: new Date("2024-01-01T00:00:00Z"),
          result: { image_url: "https://img" },
        },
      ]);

    jest.spyOn(prisma.room, "count").mockResolvedValue(1);

    const result = await fetchHistoryRooms(userId, {});

    expect(result).toEqual([
      {
        id: "1",
        name: "Room A",
        url_image: "https://img",
        type: "Art",
        description: "Art",
        date: "01.01.2024",
      },
    ]);

    expect(prisma.room.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ creator_id: userId }),
                expect.objectContaining({
                  room_participant: expect.objectContaining({
                    some: expect.objectContaining({ user_id: userId }),
                  }),
                }),
              ]),
            }),
            expect.objectContaining({ status: "CLOSED" }),
          ]),
        }),
      }),
    );
  });

  it("fetchRoomHistory returns detailed DTO", async () => {
    jest.spyOn(prisma.room, "findFirst").mockResolvedValue({
      id: BigInt(10),
      name: "Room B",
      topic: "Topic B",
      match_mode: "FIRST_MATCH",
      status: "CLOSED",
      access_mode: "PUBLIC",
      created_at: new Date("2024-02-02T10:00:00Z"),
      closed_at: null,
      result: { image_url: "https://img" },
      users: {
        id: BigInt(1),
        display_name: "Owner",
        avatar_url: null,
      },
      room_participant: [
        {
          user_id: BigInt(1),
          joined_at: new Date("2024-02-02T10:00:00Z"),
          finished_at: null,
          users: {
            display_name: "Owner",
            avatar_url: null,
          },
        },
      ],
    });

    const dto = await fetchRoomHistory(BigInt(10), BigInt(1));

    expect(dto).toMatchObject({
      id: "10",
      name: "Room B",
      topic: "Topic B",
      match_mode: "FIRST_MATCH",
      status: "CLOSED",
      access_mode: "PUBLIC",
      creator: { id: "1", display_name: "Owner" },
      participants: [
        {
          user_id: "1",
          display_name: "Owner",
          avatar_url: null,
        },
      ],
    });
  });
});
