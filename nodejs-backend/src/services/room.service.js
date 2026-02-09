// Room service (voting logic)
import { prisma } from "../db.js";

// In-memory storage for votes (in production, use a database table)
// Structure: { [roomId]: { [oderId]: { [itemId]: boolean } } }
const votesStore = new Map();

// Structure: { [roomId]: { oderId: currentIndex } }
const userProgressStore = new Map();

/**
 * Get room with collection and items
 */
export async function getRoomWithItems(roomId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
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
      },
    },
  });

  if (!room) return null;

  // Get collection items for this room (using creator's collections)
  // In a real app, room should have a collection_id field
  // For now, we'll get the first collection of the creator
  const collection = await prisma.collection.findFirst({
    where: { owner_id: room.creator_id },
    include: {
      item: {
        orderBy: { id: "asc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return {
    room,
    collection,
    items: collection?.item || [],
  };
}

/**
 * Initialize voting session for a room
 */
function initializeRoomVotes(roomId) {
  if (!votesStore.has(roomId.toString())) {
    votesStore.set(roomId.toString(), new Map());
  }
  if (!userProgressStore.has(roomId.toString())) {
    userProgressStore.set(roomId.toString(), new Map());
  }
}

/**
 * Get current voting state for a user in a room
 */
export async function getVotingState(roomId, oderId) {
  const roomData = await getRoomWithItems(roomId);
  if (!roomData || !roomData.room) {
    return { error: "Room not found" };
  }

  const { room, items } = roomData;

  // Check if user is participant
  const isParticipant = room.room_participant.some(
    (p) => p.user_id.toString() === oderId.toString(),
  );

  if (!isParticipant) {
    return { error: "User is not a participant in this room" };
  }

  // Check room status
  if (room.status === "CLOSED") {
    return {
      room_id: room.id.toString(),
      room_name: room.name,
      current_item: null,
      total_items: items.length,
      voted_count: items.length,
      is_finished: true,
      all_finished: true,
    };
  }

  initializeRoomVotes(roomId);

  const roomProgress = userProgressStore.get(roomId.toString());
  const currentIndex = roomProgress.get(oderId.toString()) || 0;

  // Check if user finished
  if (currentIndex >= items.length) {
    // Check if all participants finished
    const allParticipantsFinished = room.room_participant.every((p) => {
      const pIndex = roomProgress.get(p.user_id.toString()) || 0;
      return pIndex >= items.length;
    });

    return {
      room_id: room.id.toString(),
      room_name: room.name,
      current_item: null,
      total_items: items.length,
      voted_count: currentIndex,
      is_finished: true,
      all_finished: allParticipantsFinished,
    };
  }

  const currentItem = items[currentIndex];

  // Find who suggested this item (for now, use room creator)
  const suggestedBy = room.users;

  return {
    room_id: room.id.toString(),
    room_name: room.name,
    current_item: {
      id: currentItem.id.toString(),
      title: currentItem.title,
      description: currentItem.description,
      image_url: currentItem.image_url,
      suggested_by: {
        user_id: suggestedBy.id.toString(),
        display_name: suggestedBy.display_name,
        avatar_url: suggestedBy.avatar_url,
      },
    },
    total_items: items.length,
    voted_count: currentIndex,
    is_finished: false,
    all_finished: false,
  };
}

/**
 * Submit a vote
 */
export async function submitVote(roomId, oderId, itemId, vote) {
  const roomData = await getRoomWithItems(roomId);
  if (!roomData || !roomData.room) {
    return { ok: false, message: "Room not found" };
  }

  const { room, items } = roomData;

  // Check if user is participant
  const isParticipant = room.room_participant.some(
    (p) => p.user_id.toString() === oderId.toString(),
  );

  if (!isParticipant) {
    return { ok: false, message: "User is not a participant in this room" };
  }

  if (room.status === "CLOSED") {
    return { ok: false, message: "Room is already closed" };
  }

  initializeRoomVotes(roomId);

  const roomVotes = votesStore.get(roomId.toString());
  const roomProgress = userProgressStore.get(roomId.toString());

  // Get or create user votes map
  if (!roomVotes.has(oderId.toString())) {
    roomVotes.set(oderId.toString(), new Map());
  }
  const userVotes = roomVotes.get(oderId.toString());

  // Store the vote
  userVotes.set(itemId.toString(), vote);

  // Advance user progress
  const currentIndex = roomProgress.get(oderId.toString()) || 0;
  const newIndex = currentIndex + 1;
  roomProgress.set(oderId.toString(), newIndex);

  // Check if user finished
  const userFinished = newIndex >= items.length;

  // Check if all participants finished
  const allFinished = room.room_participant.every((p) => {
    const pIndex = roomProgress.get(p.user_id.toString()) || 0;
    return pIndex >= items.length;
  });

  // If all finished, calculate results and close room
  if (allFinished) {
    await calculateAndSaveResults(roomId, roomData);
  }

  // Get next item if available
  let nextItem = null;
  if (newIndex < items.length) {
    const next = items[newIndex];
    nextItem = {
      id: next.id.toString(),
      title: next.title,
      description: next.description,
      image_url: next.image_url,
      suggested_by: {
        user_id: room.users.id.toString(),
        display_name: room.users.display_name,
        avatar_url: room.users.avatar_url,
      },
    };
  }

  // Determine redirect
  let redirect_to = null;
  if (allFinished) {
    redirect_to = "results";
  } else if (userFinished) {
    redirect_to = "drawing";
  }

  return {
    ok: true,
    next_item: nextItem,
    is_finished: userFinished,
    all_finished: allFinished,
    redirect_to,
  };
}

/**
 * Calculate match results and save to room
 */
async function calculateAndSaveResults(roomId, roomData) {
  const { room, items } = roomData;
  const roomVotes = votesStore.get(roomId.toString());

  if (!roomVotes) return;

  // Find items where ALL participants voted "yes"
  const matchedItems = [];

  for (const item of items) {
    const itemId = item.id.toString();
    let allVotedYes = true;

    for (const participant of room.room_participant) {
      const userVotes = roomVotes.get(participant.user_id.toString());
      if (!userVotes || !userVotes.get(itemId)) {
        allVotedYes = false;
        break;
      }
    }

    if (allVotedYes) {
      matchedItems.push({
        id: itemId,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
      });
    }
  }

  // Save results to room
  await prisma.room.update({
    where: { id: roomId },
    data: {
      status: "CLOSED",
      closed_at: new Date(),
      result: {
        has_match: matchedItems.length > 0,
        matched_items: matchedItems,
      },
    },
  });

  // Update participants finished_at
  for (const participant of room.room_participant) {
    await prisma.room_participant.update({
      where: {
        room_id_user_id: {
          room_id: roomId,
          user_id: participant.user_id,
        },
      },
      data: {
        finished_at: new Date(),
      },
    });
  }

  // Clean up in-memory stores
  votesStore.delete(roomId.toString());
  userProgressStore.delete(roomId.toString());
}

/**
 * Get room results
 */
export async function getRoomResults(roomId, oderId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      room_participant: true,
    },
  });

  if (!room) {
    return { ok: false, message: "Room not found" };
  }

  // Check if user is participant
  const isParticipant = room.room_participant.some(
    (p) => p.user_id.toString() === oderId.toString(),
  );

  if (!isParticipant) {
    return { ok: false, message: "Access denied" };
  }

  // If room not closed yet, check in-memory results
  if (room.status !== "CLOSED") {
    // Room still in progress
    return {
      ok: true,
      has_match: false,
      matched_items: [],
      message: "Voting still in progress",
    };
  }

  // Get results from room.result JSON
  const result = room.result || { has_match: false, matched_items: [] };

  return {
    ok: true,
    has_match: result.has_match || false,
    matched_items: result.matched_items || [],
  };
}

/**
 * Leave room
 */
export async function leaveRoom(roomId, oderId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      room_participant: true,
    },
  });

  if (!room) {
    return { ok: false, message: "Room not found" };
  }

  // Check if user is participant
  const participant = room.room_participant.find(
    (p) => p.user_id.toString() === oderId.toString(),
  );

  if (!participant) {
    return { ok: false, message: "User is not in this room" };
  }

  // Remove participant
  await prisma.room_participant.delete({
    where: {
      room_id_user_id: {
        room_id: roomId,
        user_id: BigInt(oderId),
      },
    },
  });

  // Clean up user votes
  const roomProgress = userProgressStore.get(roomId.toString());
  if (roomProgress) {
    roomProgress.delete(oderId.toString());
  }

  const roomVotes = votesStore.get(roomId.toString());
  if (roomVotes) {
    roomVotes.delete(oderId.toString());
  }

  return { ok: true };
}

/**
 * Join room (for when user enters room page)
 */
export async function joinRoom(roomId, oderId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return { ok: false, message: "Room not found" };
  }

  if (room.status === "CLOSED") {
    return { ok: false, message: "Room is closed" };
  }

  // Check if already participant
  const existing = await prisma.room_participant.findUnique({
    where: {
      room_id_user_id: {
        room_id: roomId,
        user_id: BigInt(oderId),
      },
    },
  });

  if (!existing) {
    // Add as participant
    await prisma.room_participant.create({
      data: {
        room_id: roomId,
        user_id: BigInt(oderId),
        joined_at: new Date(),
      },
    });
  }

  // Activate room if it was OPEN
  if (room.status === "OPEN") {
    await prisma.room.update({
      where: { id: roomId },
      data: { status: "ACTIVE" },
    });
  }

  return { ok: true };
}
