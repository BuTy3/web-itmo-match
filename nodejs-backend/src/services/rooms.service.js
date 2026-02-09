// services/rooms.service.js
import bcrypt from 'bcrypt';
import { prisma } from '../db.js';
import { getRandomTopic } from './drawing.service.js';

const roomSessions = new Map();

const buildCards = (items) => {
  if (!items.length) {
    return [
      {
        name_card: 'Название карточки',
        description: 'Описание...',
        profile_picture_url: null,
      },
    ];
  }

  return items.map((item) => ({
    name_card: item.title || 'Название карточки',
    description: item.description || 'Описание...',
    profile_picture_url: item.image_url || null,
    owner_nick: item.owner_nick || null,
  }));
};

const getRoomCollectionId = (room) => {
  if (!room || !room.result || typeof room.result !== 'object') {
    return null;
  }
  const value = room.result.collection_id;
  const idNum = Number(value);
  return Number.isFinite(idNum) && idNum > 0 ? idNum : null;
};

const getRoomTypeCollections = (room) => {
  if (room?.result && typeof room.result === 'object') {
    const value = Number(room.result.type_collections);
    if ([1, 2].includes(value)) {
      return value;
    }
  }
  return room?.type === 'COMBINED' ? 2 : 1;
};

const getCollectionById = async (collectionId) => {
  const idNum = Number(collectionId);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    const err = new Error('Invalid collection id');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const collection = await prisma.collection.findUnique({
    where: { id: BigInt(idNum) },
    include: {
      item: {
        orderBy: { created_at: 'asc' },
      },
    },
  });

  if (!collection) {
    const err = new Error('Collection not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  return collection;
};

const normalizeCollectionId = (collectionId) => {
  if (Array.isArray(collectionId)) {
    return collectionId[0];
  }
  return collectionId;
};

const getCollectionForUser = async (userId, collectionId) => {
  const normalized = normalizeCollectionId(collectionId);
  const idNum = Number(normalized);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    const err = new Error('Invalid collection id');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const collection = await prisma.collection.findFirst({
    where: { id: BigInt(idNum), owner_id: userId },
    include: {
      item: {
        include: {
          collection: {
            include: {
              users: true,
            },
          },
        },
        orderBy: { created_at: 'asc' },
      },
    },
  });

  if (!collection) {
    const err = new Error('Collection not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  return collection;
};

export async function getUserCollectionsForRoom(userId) {
  const collections = await prisma.collection.findMany({
    where: { owner_id: userId },
    select: {
      id: true,
      description: true,
      title: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return collections.map((collection) => ({
    id: Number(collection.id),
    type: null,
    url_image: null,
    description: collection.description ?? null,
    title: collection.title ?? null,
  }));
}

const getRoomSession = (roomId, defaults) => {
  const key = String(roomId);
  let session = roomSessions.get(key);

  if (!session && defaults) {
    session = {
      roomId: key,
      matchMode: defaults.matchMode,
      typeCollections: defaults.typeCollections,
      participants: new Map(),
      baseCards: defaults.baseCards ?? null,
      combinedCards: [],
      ready: defaults.typeCollections === 1,
      votes: new Map(),
      matchResult: null,
      requiredVotes: null,
      topic: defaults.topic ?? null,
    };
    roomSessions.set(key, session);
  }

  return session;
};

const buildParticipantState = (cards) => ({
  cards,
  index: 0,
});

const buildMatchedItem = (card) => ({
  id: card.id || card.name_card || '',
  title: card.name_card || 'Результат',
  description: card.description || '',
  image_url: card.profile_picture_url ?? null,
});

const finalizeRoomResult = async (roomId, matchedItems, existingResult = {}) => {
  const hasMatch = matchedItems.length > 0;
  await prisma.room.update({
    where: { id: BigInt(roomId) },
    data: {
      status: 'CLOSED',
      closed_at: new Date(),
      result: {
        ...(existingResult || {}),
        has_match: hasMatch,
        matched_items: matchedItems,
      },
    },
  });
};

export async function createRoom({
  userId,
  name,
  typeMatch,
  typeCollections,
  password,
  collectionId,
}) {
  if (!name || !name.trim()) {
    const err = new Error('Room name is required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (![1, 2].includes(Number(typeMatch))) {
    const err = new Error('Invalid match type');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (![1, 2].includes(Number(typeCollections))) {
    const err = new Error('Invalid collections type');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const collection = await getCollectionForUser(userId, collectionId);
  const cards = buildCards(
    (collection.item ?? []).map((item) => ({
      ...item,
      owner_nick: item.collection?.users?.display_name || null,
    })),
  );

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;
  const matchMode = Number(typeMatch) === 1 ? 'FIRST_MATCH' : 'WATCH_ALL';
  const accessMode = password ? 'PRIVATE' : 'PUBLIC';
  const normalizedTypeCollections = Number(typeCollections) === 2 ? 2 : 1;
  const topic = getRandomTopic(null);
  const roomType = normalizedTypeCollections === 2 ? 'COMBINED' : 'SINGLE';

  const room = await prisma.room.create({
    data: {
      creator_id: userId,
      name: name.trim(),
      topic: null,
      type: roomType,
      match_mode: matchMode,
      status: 'OPEN',
      access_mode: accessMode,
      password_hash: passwordHash,
      result: {
        collection_id: Number(collection.id),
        type_collections: normalizedTypeCollections,
      },
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
    baseCards: Number(typeCollections) === 1 ? cards : null,
    topic,
  });

  if (session) {
    const participantCards = session.typeCollections === 1 ? session.baseCards : cards;
    session.participants.set(String(userId), buildParticipantState(participantCards));
    if (session.matchResult === null) {
      session.requiredVotes = Math.max(session.requiredVotes ?? 0, session.participants.size);
    }
  }

  return {
    roomId: Number(room.id),
  };
}

export async function checkRoomAccess({ roomId, allowClosed = false }) {
  const idNum = Number(roomId);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    const err = new Error('Invalid room id');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const room = await prisma.room.findUnique({
    where: { id: BigInt(idNum) },
  });

  if (!room) {
    const err = new Error('Room not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (!allowClosed && room.status === 'CLOSED') {
    const err = new Error('Room is closed');
    err.code = 'NOT_ALLOWED';
    throw err;
  }

  return room;
}

export async function verifyRoomPassword(room, password) {
  if (!room || room.access_mode !== 'PRIVATE') {
    return true;
  }

  if (!password) {
    const err = new Error('Password is required');
    err.code = 'NOT_ALLOWED';
    throw err;
  }

  const ok = await bcrypt.compare(password, room.password_hash || '');
  if (!ok) {
    const err = new Error('Invalid password');
    err.code = 'NOT_ALLOWED';
    throw err;
  }

  return true;
}

export async function connectToRoom({ userId, roomId, password, collectionId }) {
  const room = await checkRoomAccess({ roomId });
  const isCombined = getRoomTypeCollections(room) === 2;

  await verifyRoomPassword(room, password);

  let cards = [];
  if (isCombined) {
    const collection = await getCollectionForUser(userId, collectionId);
    cards = buildCards(
      (collection.item ?? []).map((item) => ({
        ...item,
        owner_nick: item.collection?.users?.display_name || null,
      })),
    );
  } else {
    const session = getRoomSession(room.id);
    if (session && session.baseCards) {
      cards = session.baseCards;
    } else {
      const roomCollectionId = getRoomCollectionId(room);
      if (!roomCollectionId) {
        const err = new Error('Room session not found');
        err.code = 'NOT_FOUND';
        throw err;
      }
      const collection = await getCollectionById(roomCollectionId);
      cards = buildCards(
        (collection.item ?? []).map((item) => ({
          ...item,
          owner_nick: item.collection?.users?.display_name || null,
        })),
      );
    }
  }

  await prisma.room_participant.upsert({
    where: {
      room_id_user_id: {
        room_id: room.id,
        user_id: userId,
      },
    },
    update: {},
    create: {
      room_id: room.id,
      user_id: userId,
    },
  });

  if (room.status === 'OPEN') {
    await prisma.room.update({
      where: { id: room.id },
      data: { status: 'ACTIVE' },
    });
  }

  const session = getRoomSession(room.id, {
    matchMode: room.match_mode,
    typeCollections: isCombined ? 2 : 1,
    baseCards: !isCombined ? cards : null,
  });

  if (session) {
    if (session.typeCollections === 1) {
      const baseCards = session.baseCards ?? cards;
      session.baseCards = baseCards;
      session.participants.set(String(userId), buildParticipantState(baseCards));
      session.ready = true;
      if (session.matchResult === null) {
        session.requiredVotes = Math.max(session.requiredVotes ?? 0, session.participants.size);
      }
    } else {
      session.participants.set(String(userId), buildParticipantState(cards));
      session.combinedCards = Array.from(session.participants.values()).flatMap(
        (participant) => participant.cards,
      );
      if (session.participants.size >= 2) {
        session.ready = true;
        if (session.matchResult === null) {
          session.requiredVotes = Math.max(session.requiredVotes ?? 0, session.participants.size);
        }
        session.participants.forEach((participant) => {
          participant.cards = session.combinedCards;
          participant.index = 0;
        });
      }
    }
  }

  return {
    roomId: Number(room.id),
  };
}

export async function getRoomState({ userId, roomId, nick }) {
  const room = await checkRoomAccess({ roomId, allowClosed: true });
  if (room.status === 'CLOSED') {
    return { ok: true, redirect: 'results' };
  }
  const session = getRoomSession(room.id);

  if (!session) {
    return {
      ok: false,
      message: 'ROOM_SESSION_MISSING',
    };
  }

  if (session.typeCollections === 2 && !session.ready) {
    return {
      ok: false,
      message: 'WAITING_FOR_PARTICIPANTS',
    };
  }

  const participant = session.participants.get(String(userId));
  if (!participant) {
    const err = new Error('User not connected to room');
    err.code = 'NOT_ALLOWED';
    throw err;
  }

  const card = participant.cards[participant.index];

  return {
    ok: true,
    nick,
    owner_nick: card.owner_nick ?? null,
    profile_picture_url: card.profile_picture_url ?? null,
    name_card: card.name_card,
    description: card.description,
  };
}

const getRoomResultPayload = (room) => {
  if (!room || !room.result || typeof room.result !== 'object') {
    return {};
  }
  return room.result;
};

const ensureRoomParticipant = async (roomId, userId) => {
  const participant = await prisma.room_participant.findUnique({
    where: {
      room_id_user_id: {
        room_id: roomId,
        user_id: userId,
      },
    },
  });
  if (!participant) {
    const err = new Error('User not connected to room');
    err.code = 'NOT_ALLOWED';
    throw err;
  }
};

export async function getRoomDrawing({ userId, roomId }) {
  const room = await prisma.room.findUnique({
    where: { id: BigInt(roomId) },
    include: {
      room_participant: {
        include: {
          users: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
      },
    },
  });
  if (!room) {
    const err = new Error('Room not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  await ensureRoomParticipant(room.id, userId);

  const resultPayload = getRoomResultPayload(room);
  const drawings = resultPayload.drawings || {};
  const drawing = drawings[String(userId)] || {};
  const session = getRoomSession(room.id);
  let resolvedTopic = session?.topic ?? room.topic ?? null;
  if (!resolvedTopic) {
    resolvedTopic = getRandomTopic(null);
    if (session) {
      session.topic = resolvedTopic;
    }
  }

  return {
    ok: true,
    topic: resolvedTopic,
    participants: room.room_participant.map((participant) => ({
      id: String(participant.users.id),
      nickname: participant.users.display_name || 'Пользователь',
    })),
    points: drawing.points || [],
    snapshot: drawing.snapshot || null,
  };
}

export async function saveRoomDrawing({ userId, roomId, points, snapshot }) {
  const room = await prisma.room.findUnique({
    where: { id: BigInt(roomId) },
  });
  if (!room) {
    const err = new Error('Room not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  await ensureRoomParticipant(room.id, userId);

  const resultPayload = getRoomResultPayload(room);
  const drawings = resultPayload.drawings || {};
  const updatedDrawings = {
    ...drawings,
    [String(userId)]: {
      points: Array.isArray(points) ? points : [],
      snapshot: snapshot ?? null,
      updated_at: new Date().toISOString(),
    },
  };

  await prisma.room.update({
    where: { id: room.id },
    data: {
      result: {
        ...(resultPayload || {}),
        drawings: updatedDrawings,
      },
    },
  });

  return { ok: true };
}

export async function getRoomDrawingsResults({ userId, roomId }) {
  const room = await prisma.room.findUnique({
    where: { id: BigInt(roomId) },
    include: {
      room_participant: {
        include: {
          users: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
      },
    },
  });

  if (!room) {
    const err = new Error('Room not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  await ensureRoomParticipant(room.id, userId);

  const resultPayload = getRoomResultPayload(room);
  const drawings = resultPayload.drawings || {};

  const result = room.room_participant.map((participant) => {
    const user = participant.users;
    const entry = drawings[String(user.id)] || {};
    return {
      user_id: String(user.id),
      nickname: user.display_name || 'Пользователь',
      snapshot: entry.snapshot || null,
    };
  });

  return { ok: true, drawings: result };
}

export async function chooseRoomCard({ userId, roomId, choose, nick }) {
  if (![0, 1, 2].includes(Number(choose))) {
    const err = new Error('Invalid choice');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const room = await checkRoomAccess({ roomId, allowClosed: true });
  if (room.status === 'CLOSED') {
    return { ok: true, redirect: 'results' };
  }
  const session = getRoomSession(room.id);

  if (!session) {
    return { ok: false, message: 'ROOM_SESSION_MISSING' };
  }

  const participant = session.participants.get(String(userId));
  if (!participant) {
    const err = new Error('User not connected to room');
    err.code = 'NOT_ALLOWED';
    throw err;
  }

  if (session.matchResult) {
    return { ok: true, redirect: 'results' };
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

  if (session.typeCollections === 2 && !session.ready) {
    return { ok: false, message: 'WAITING_FOR_PARTICIPANTS' };
  }

  if (Number(choose) === 1) {
    const currentIndex = participant.index;
    const votes = session.votes.get(currentIndex) ?? new Set();
    votes.add(String(userId));
    session.votes.set(currentIndex, votes);
    const requiredVotes = session.requiredVotes ?? session.participants.size;

    if (session.matchMode === 'FIRST_MATCH') {
      if (votes.size === requiredVotes) {
        const matchCard = participant.cards[currentIndex];
        const matchedItems = matchCard ? [buildMatchedItem(matchCard)] : [];
        session.matchResult = matchedItems;
        await finalizeRoomResult(room.id, matchedItems, getRoomResultPayload(room));
        return { ok: true, redirect: 'results' };
      }
    }
  }

  participant.index += 1;
  if (participant.index >= participant.cards.length) {
    const allFinished = Array.from(session.participants.values()).every(
      (p) => p.index >= p.cards.length,
    );
    if (allFinished) {
      const matchedItems = [];
      session.votes.forEach((votes, idx) => {
        const requiredVotes = session.requiredVotes ?? session.participants.size;
        if (votes.size === requiredVotes) {
          const card = participant.cards[idx];
          if (card) matchedItems.push(buildMatchedItem(card));
        }
      });
      await finalizeRoomResult(room.id, matchedItems, getRoomResultPayload(room));
      session.matchResult = matchedItems;
    }
    return {
      ok: true,
      redirect: 'drawing',
    };
  }

  const card = participant.cards[participant.index];
  return {
    ok: true,
    nick,
    owner_nick: card.owner_nick ?? null,
    profile_picture_url: card.profile_picture_url ?? null,
    name_card: card.name_card,
    description: card.description,
  };
}
