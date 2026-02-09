// History service (Prisma queries + DTO mapping)
import { prisma } from "../db.js";

/**
 * Map room to HistoryRoom DTO
 * {
 *   id: string,
 *   name: string,
 *   url_image: string | null,
 *   type: string,
 *   description: string,
 *   date: string (DD.MM.YYYY format)
 * }
 */
function mapHistoryRoomDto(room) {
  const createdAt = new Date(room.created_at);
  const day = String(createdAt.getDate()).padStart(2, "0");
  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const year = createdAt.getFullYear();
  const dateStr = `${day}.${month}.${year}`;

  const toStringOrEmpty = (value) => (typeof value === "string" ? value : "");
  const result =
    room.result && typeof room.result === "object" ? room.result : null;
  const matchedItems = Array.isArray(result?.matched_items)
    ? result.matched_items
    : null;
  const firstMatch =
    matchedItems?.find((item) => item && typeof item === "object") ?? null;
  const resultSource = firstMatch ?? result ?? {};

  const url_image =
    toStringOrEmpty(resultSource.image_url) ||
    toStringOrEmpty(resultSource.url_image) ||
    null;
  const description = toStringOrEmpty(resultSource.description);

  // Use topic as type, fallback to match_mode
  const type = room.topic || room.match_mode || "DEFAULT";

  return {
    id: String(room.id),
    name: room.name,
    url_image: url_image,
    type: type,
    description: description || room.topic || "",
    date: dateStr,
  };
}

/**
 * Fetch rooms for history with filters
 * @param {BigInt} userId - User ID
 * @param {Object} filters - Filter options
 * @param {string} filters.name - Filter by room name (case-insensitive partial match)
 * @param {string} filters.type - Filter by type/topic (exact match)
 * @param {string} filters.date - Filter by date (DD.MM.YYYY format)
 */
export async function fetchHistoryRooms(userId, filters = {}) {
  console.log(
    "fetchHistoryRooms - userId (BigInt):",
    userId.toString(),
    "type:",
    typeof userId,
  );

  // Debug: Check all rooms created by this user
  const allUserRooms = await prisma.room.findMany({
    where: { creator_id: userId },
    select: { id: true, name: true, status: true, creator_id: true },
  });
  console.log(
    "fetchHistoryRooms - all rooms created by user:",
    allUserRooms.length,
  );
  console.log(
    "fetchHistoryRooms - user rooms details:",
    allUserRooms.map((r) => ({
      id: r.id.toString(),
      name: r.name,
      status: r.status,
      creator_id: r.creator_id.toString(),
    })),
  );

  const where = {
    AND: [
      {
        // Only show rooms where the user participated or created.
        OR: [
          { creator_id: userId },
          { room_participant: { some: { user_id: userId } } },
        ],
      },
      {
        // Only show closed rooms in history
        status: "CLOSED",
      },
    ],
  };

  // Apply name filter (case-insensitive partial match)
  if (filters.name && filters.name.trim()) {
    where.AND.push({
      name: {
        contains: filters.name.trim(),
        mode: "insensitive",
      },
    });
  }

  // Apply type filter (match topic or match_mode)
  if (filters.type && filters.type.trim()) {
    const typeValue = filters.type.trim();
    // Check if the filter value is a valid match_mode enum value
    const validMatchModes = ["FIRST_MATCH", "WATCH_ALL"];
    const isMatchMode = validMatchModes.includes(typeValue.toUpperCase());

    if (isMatchMode) {
      // Filter by match_mode enum
      where.AND.push({
        match_mode: typeValue.toUpperCase(),
      });
    } else {
      // Filter by topic (case-insensitive)
      where.AND.push({
        topic: {
          equals: typeValue,
          mode: "insensitive",
        },
      });
    }
  }

  // Apply date filter
  if (filters.date && filters.date.trim()) {
    // Parse DD.MM.YYYY format
    const [day, month, year] = filters.date.trim().split(".");
    if (day && month && year) {
      const filterDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
      );
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);

      where.AND.push({
        created_at: {
          gte: filterDate.toISOString(),
          lt: nextDay.toISOString(),
        },
      });
    }
  }

  // Debug: Check if there are any closed rooms created by user
  const userCreatedClosedRooms = await prisma.room.count({
    where: {
      OR: [
        { creator_id: userId },
        { room_participant: { some: { user_id: userId } } },
      ],
      status: "CLOSED",
    },
  });
  console.log(
    "fetchHistoryRooms - closed rooms created by user:",
    userCreatedClosedRooms,
  );

  console.log(
    "fetchHistoryRooms - where clause:",
    JSON.stringify(
      where,
      (key, value) => (typeof value === "bigint" ? value.toString() : value),
      2,
    ),
  );

  const rooms = await prisma.room.findMany({
    where,
    orderBy: {
      created_at: "desc",
    },
  });

  console.log("fetchHistoryRooms - found rooms:", rooms.length);
  if (rooms.length > 0) {
    console.log(
      "fetchHistoryRooms - first room creator_id:",
      rooms[0].creator_id.toString(),
      "requested userId:",
      userId.toString(),
    );
    console.log(
      "fetchHistoryRooms - rooms creator_ids:",
      rooms.map((r) => r.creator_id.toString()),
    );
  }

  // Map to DTO format
  return rooms.map(mapHistoryRoomDto);
}

/**
 * Fetch room history details by ID
 * @param {BigInt} roomId - Room ID
 * @param {BigInt} userId - User ID (to verify access)
 */
export async function fetchRoomHistory(roomId, userId) {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      room_participant: {
        some: {
          user_id: userId,
        },
      },
    },
    include: {
      users: {
        select: {
          id: true,
          display_name: true,
          avatar_url: true,
        },
      },
      room_participant: {
        include: {
          users: {
            select: {
              id: true,
              display_name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          joined_at: "asc",
        },
      },
    },
  });

  if (!room) {
    return null;
  }

  const createdAt = new Date(room.created_at);
  const day = String(createdAt.getDate()).padStart(2, "0");
  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const year = createdAt.getFullYear();
  const dateStr = `${day}.${month}.${year}`;

  return {
    id: String(room.id),
    name: room.name,
    topic: room.topic ?? "",
    match_mode: room.match_mode,
    status: room.status,
    access_mode: room.access_mode,
    created_at: room.created_at.toISOString(),
    closed_at: room.closed_at ? room.closed_at.toISOString() : null,
    date: dateStr,
    result: room.result,
    creator: {
      id: String(room.users.id),
      display_name: room.users.display_name,
      avatar_url: room.users.avatar_url,
    },
    participants: room.room_participant.map((rp) => ({
      user_id: String(rp.user_id),
      display_name: rp.users.display_name,
      avatar_url: rp.users.avatar_url,
      joined_at: rp.joined_at.toISOString(),
      finished_at: rp.finished_at ? rp.finished_at.toISOString() : null,
    })),
  };
}
