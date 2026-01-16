// services/rooms.service.js
import bcrypt from "bcrypt";
import { prisma } from "../db.js";

const roomSessions = new Map();

const buildCards = (items) => {
  if (!items.length) {
    return [
      {
        name_card: "Название карточки",
        description: "Описание...",
        profile_picture_url: null,
      },
    ];
  }

  return items.map((item) => ({
    name_card: item.title || "Название карточки",
    description: item.description || "Описание...",
    profile_picture_url: item.image_url || null,
  }));
};

const getCollectionForUser = async (userId, collectionId) => {
  const idNum = Number(collectionId);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    const err = new Error("Invalid collection id");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const collection = await prisma.collection.findFirst({
    where: { id: BigInt(idNum), owner_id: userId },
    include: {
      item: {
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!collection) {
    const err = new Error("Collection not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  return collection;
};

const getRoomSession = (roomId, defaults) => {
  const key = String(roomId);
  let session = roomSessions.get(key);

  if (!session && defaults) {
    session = {
      roomId: key,
      matchMode: defaults.matchMode,
      typeCollections: defaults.typeCollections,
      participants: new Map(),
    };
    roomSessions.set(key, session);
  }

  return session;
};

const buildParticipantState = (cards) => ({
  cards,
  index: 0,
});

export async function createRoom({
  userId,
  name,
  typeMatch,
  typeCollections,
  password,
  collectionId,
}) {
  if (!name || !name.trim()) {
    const err = new Error("Room name is required");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  if (![1, 2].includes(Number(typeMatch))) {
    const err = new Error("Invalid match type");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  if (![1, 2].includes(Number(typeCollections))) {
    const err = new Error("Invalid collections type");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const collection = await getCollectionForUser(userId, collectionId);
  const cards = buildCards(collection.item ?? []);

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;
  const matchMode = Number(typeMatch) === 1 ? "FIRST_MATCH" : "WATCH_ALL";
  const accessMode = password ? "PRIVATE" : "PUBLIC";

  const room = await prisma.room.create({
    data: {
      creator_id: userId,
      name: name.trim(),
      topic: collection.title || collection.type || null,
      match_mode: matchMode,
      status: "OPEN",
      access_mode: accessMode,
      password_hash: passwordHash,
    },
  });

  await prisma.room_participant.create({
    data: {
      room_id: room.id,
      user_id: userId,
    },
  });

  const session = getRoomSession(room.id, {
    matchMode,
    typeCollections,
  });

  if (session) {
    session.participants.set(String(userId), buildParticipantState(cards));
  }

  return {
    roomId: Number(room.id),
  };
}

export async function checkRoomAccess({ roomId }) {
  const idNum = Number(roomId);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    const err = new Error("Invalid room id");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const room = await prisma.room.findUnique({
    where: { id: BigInt(idNum) },
  });

  if (!room) {
    const err = new Error("Room not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (room.status === "CLOSED") {
    const err = new Error("Room is closed");
    err.code = "NOT_ALLOWED";
    throw err;
  }

  return room;
}

export async function connectToRoom({
  userId,
  roomId,
  password,
  collectionId,
}) {
  const room = await checkRoomAccess({ roomId });

  if (room.access_mode === "PRIVATE") {
    if (!password) {
      const err = new Error("Password is required");
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    const ok = await bcrypt.compare(password, room.password_hash || "");
    if (!ok) {
      const err = new Error("Invalid password");
      err.code = "NOT_ALLOWED";
      throw err;
    }
  }

  const collection = await getCollectionForUser(userId, collectionId);
  const cards = buildCards(collection.item ?? []);

  const roomParticipant = await prisma.room_participant.findUnique({
    where: {
      room_id_user_id: {
        room_id: room.id,
        user_id: userId,
      },
    },
  });

  if (!roomParticipant) {
    await prisma.room_participant.create({
      data: {
        room_id: room.id,
        user_id: userId,
      },
    });
  }

  if (room.status === "OPEN") {
    await prisma.room.update({
      where: { id: room.id },
      data: { status: "ACTIVE" },
    });
  }

  const session = getRoomSession(room.id, {
    matchMode: room.match_mode,
    typeCollections: 1,
  });

  if (session) {
    session.participants.set(String(userId), buildParticipantState(cards));
  }

  return {
    roomId: Number(room.id),
  };
}

export async function getRoomState({ userId, roomId, nick }) {
  const room = await checkRoomAccess({ roomId });
  const session = getRoomSession(room.id);

  if (!session) {
    const err = new Error("Room session not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  const participant = session.participants.get(String(userId));
  if (!participant) {
    const err = new Error("User not connected to room");
    err.code = "NOT_ALLOWED";
    throw err;
  }

  const card = participant.cards[participant.index];

  return {
    ok: true,
    nick,
    profile_picture_url: card.profile_picture_url ?? null,
    name_card: card.name_card,
    description: card.description,
  };
}

export async function chooseRoomCard({ userId, roomId, choose, nick }) {
  if (![0, 1, 2].includes(Number(choose))) {
    const err = new Error("Invalid choice");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const room = await checkRoomAccess({ roomId });
  const session = getRoomSession(room.id);

  if (!session) {
    const err = new Error("Room session not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  const participant = session.participants.get(String(userId));
  if (!participant) {
    const err = new Error("User not connected to room");
    err.code = "NOT_ALLOWED";
    throw err;
  }

  if (Number(choose) === 0) {
    session.participants.delete(String(userId));
    await prisma.room_participant.update({
      where: {
        room_id_user_id: {
          room_id: room.id,
          user_id: userId,
        },
      },
      data: { finished_at: new Date() },
    });

    return { ok: true };
  }

  participant.index += 1;
  if (participant.index >= participant.cards.length) {
    return {
      ok: true,
      redirect: "/drawing",
    };
  }

  const card = participant.cards[participant.index];
  return {
    ok: true,
    nick,
    profile_picture_url: card.profile_picture_url ?? null,
    name_card: card.name_card,
    description: card.description,
  };
}
