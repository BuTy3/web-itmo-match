// Rooms service (Prisma + validation)
import {prisma} from "../db.js";

/**
 * Normalize collection_id for "connect" step:
 * - must be a single integer (>0)
 */
function normalizeSingleCollectionId(collectionId) {
  const n = Number(collectionId);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
    const err = new Error("Invalid collection_id");
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  return BigInt(n);
}

/**
 * Normalize collection_id from FE:
 * - accepts number OR array
 * - returns unique integer ids (>0)
 */
function normalizeCollectionIds(collectionId) {
  if (collectionId === undefined || collectionId === null) {
    const err = new Error("collection_id is required");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  // Wrap into array if FE sent a single value
  const rawList = Array.isArray(collectionId) ? collectionId : [collectionId];

  const ids = rawList.map((x) => Number(x));

  // Validate integers > 0
  for (const id of ids) {
    if (!Number.isFinite(id) || id <= 0 || !Number.isInteger(id)) {
      const err = new Error("Invalid collection_id");
      err.code = "VALIDATION_ERROR";
      throw err;
    }
  }

  // Deduplicate
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    const err = new Error("collection_id must not be empty");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  return uniqueIds;
}

/**
 * Map FE type_match:
 *  1 -> FIRST_MATCH
 *  2 -> WATCH_ALL
 * Default: WATCH_ALL (per your requirement)
 */
function mapMatchMode(typeMatch) {
  if (typeMatch === undefined || typeMatch === null || typeMatch === "") {
    return "WATCH_ALL";
  }

  const v = Number(typeMatch);
  if (v === 1) return "FIRST_MATCH";
  if (v === 2) return "WATCH_ALL";

  const err = new Error("Invalid type_match");
  err.code = "VALIDATION_ERROR";
  throw err;
}

/**
 * Validate type_collections:
 *  1 -> single (must be exactly 1 collection_id)
 *  2 -> combined (allows 1+ collection_ids)
 */
function validateTypeCollections(typeCollections, collectionIds) {
  const t = Number(typeCollections);

  if (!Number.isFinite(t) || !Number.isInteger(t) || (t !== 1 && t !== 2)) {
    const err = new Error("Invalid type_collections");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  if (t === 1 && collectionIds.length !== 1) {
    const err = new Error("For type_collections=1 you must provide exactly 1 collection_id");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  if (t === 2 && collectionIds.length < 1) {
    const err = new Error("For type_collections=2 you must provide at least 1 collection_id");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  return t;
}

/**
 * Hash password if room is private.
 * NOTE: Use bcrypt here if you want, similar to auth. For now we keep it simple:
 * - if password is empty -> PUBLIC
 * - else -> PRIVATE + bcrypt hash (recommended)
 */
async function buildAccessMode(password) {
  const p = typeof password === "string" ? password.trim() : "";

  if (!p) {
    return { accessMode: "PUBLIC", passwordHash: null };
  }

  // Recommended: use bcrypt like auth does
  // We import dynamically to avoid changing your global dependencies in this snippet
  const bcrypt = (await import("bcrypt")).default;

  const passwordHash = await bcrypt.hash(p, 10);
  return { accessMode: "PRIVATE", passwordHash };
}

/**
 * Create room with validated collection_ids.
 * NOTE ABOUT DB:
 * - If you have room.collection_id as BigInt[] and room.type_collections, save directly.
 * - If you don't have them yet, save in room.result JSON (fallback).
 */
export async function createRoomService(userId, payload) {
  const name = (payload.name || "").trim();
  if (!name) {
    const err = new Error("name is required");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  if (name.length > 120) {
    const err = new Error("name is too long");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const matchMode = mapMatchMode(payload.typeMatch);

  const collectionIds = normalizeCollectionIds(payload.collectionId);
  const typeCollections = validateTypeCollections(payload.typeCollections, collectionIds);

  // Check that all collections belong to current user
  const idsBigInt = collectionIds.map((id) => BigInt(id));

  const owned = await prisma.collection.findMany({
    where: {
      owner_id: userId,
      id: { in: idsBigInt },
    },
    select: { id: true },
  });

  if (owned.length !== idsBigInt.length) {
    const err = new Error("Some collections do not belong to user");
    err.code = "FORBIDDEN";
    throw err;
  }

  const { accessMode, passwordHash } = await buildAccessMode(payload.password);

  // Create room
  // IMPORTANT:
  // If you already added fields (type_collections, collection_id[]) into DB -> save them directly.
  // If not, comment those lines and use result JSON only.
  const room = await prisma.room.create({
    data: {
      creator_id: userId,
      name,
      topic: null,
      match_mode: matchMode,
      status: "OPEN",
      access_mode: accessMode,
      password_hash: passwordHash,

      // --- If DB has these fields, keep them ---
      // type_collections: BigInt(typeCollections),
      // collection_id: idsBigInt,

      // --- Fallback: store config in JSON result ---
      result: {
        type_collections: typeCollections,
        collection_ids: collectionIds,
      },
    },
    select: { id: true },
  });

  return room;
}

/**
 * Get connect state (POST /rooms/connect/:id_room) - Mode 1
 * Returns list of user's collections for choosing.
 */
export async function getConnectStateService(userId, roomId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      status: true,
      access_mode: true,
    },
  });

  if (!room) {
    const err = new Error("Room not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (room.status === "CLOSED") {
    const err = new Error("Room is closed");
    err.code = "FORBIDDEN";
    throw err;
  }

  // Return user's collections for choosing on FE
  const collections = await prisma.collection.findMany({
    where: { owner_id: userId },
    orderBy: { created_at: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      image_url: true,
      description: true,
      title: true,
    },
  });

  const collection_choose = collections.map((c) => ({
    id: Number(c.id),
    type: c.type,
    url_image: c.image_url ?? null,
    description: c.description ?? null,
    title: c.title,
  }));

  return { collection_choose };
}

/**
 * Submit connect (POST /rooms/connect/:id_room) - Mode 2
 * Validates password (if PRIVATE), validates collection_id ownership,
 * then upserts room_participant.
 */
export async function submitConnectService(userId, roomId, payload) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      status: true,
      access_mode: true,
      password_hash: true,
    },
  });

  if (!room) {
    const err = new Error("Room not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (room.status === "CLOSED") {
    const err = new Error("Room is closed");
    err.code = "FORBIDDEN";
    throw err;
  }

  // If room is PRIVATE -> validate password
  if (room.access_mode === "PRIVATE") {
    const p = typeof payload.password === "string" ? payload.password.trim() : "";
    if (!p) {
      const err = new Error("Password is required");
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    const bcrypt = (await import("bcrypt")).default;
    const ok = await bcrypt.compare(p, room.password_hash || "");

    if (!ok) {
      const err = new Error("Invalid password");
      err.code = "FORBIDDEN";
      throw err;
    }
  }

  // Validate collection_id (must belong to user)
  const collectionId = normalizeSingleCollectionId(payload.collectionId);

  const owned = await prisma.collection.findFirst({
    where: { id: collectionId, owner_id: userId },
    select: { id: true },
  });

  if (!owned) {
    const err = new Error("Collection does not belong to user");
    err.code = "FORBIDDEN";
    throw err;
  }

  // Upsert participant (idempotent)
  await prisma.room_participant.upsert({
    where: {
      room_id_user_id: {
        room_id: roomId,
        user_id: userId,
      },
    },
    update: {},
    create: {
      room_id: roomId,
      user_id: userId,
    },
  });

    // --- Persist chosen collection_id for this user in room.result ---
  const roomForState = await prisma.room.findUnique({
    where: { id: roomId },
    select: { result: true },
  });

  const state = (roomForState?.result && typeof roomForState.result === "object")
    ? roomForState.result
    : {};

  if (!state.users) state.users = {};

  const key = String(userId);

  // Keep existing state if already created by /rooms/:id_room
  if (!state.users[key]) {
    state.users[key] = { index: 0, choices: [], done: false };
  }

  // Save user's chosen collection id
  state.users[key].collection_id = Number(collectionId);

  await prisma.room.update({
    where: { id: roomId },
    data: { result: state },
  });

  return true;
}

/**
 * Ensure user can access the room:
 * - creator OR participant
 */
async function ensureRoomAccess(userId, roomId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      creator_id: true,
      status: true,
      result: true,
    },
  });

  if (!room) {
    const err = new Error("Room not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (room.status === "CLOSED") {
    const err = new Error("Room is closed");
    err.code = "FORBIDDEN";
    throw err;
  }

  // Creator always has access
  if (room.creator_id === userId) {
    return room;
  }

  // Participant has access
  const participant = await prisma.room_participant.findUnique({
    where: {
      room_id_user_id: {
        room_id: roomId,
        user_id: userId,
      },
    },
    select: { room_id: true },
  });

  if (!participant) {
    const err = new Error("Access denied");
    err.code = "FORBIDDEN";
    throw err;
  }

  return room;
}

/**
 * Build user display info for response DTO.
 */
async function getUserDisplay(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      display_name: true,
      avatar_url: true,
    },
  });

  if (!user) {
    const err = new Error("User not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  return {
    nick: user.display_name,
    profile_picture_url: user.avatar_url || null,
  };
}

/**
 * Read room state from room.result JSON, initialize if missing.
 * We store per-user cursor (index) and choices here.
 */
function readOrInitRoomState(room, userId) {
  const state = (room.result && typeof room.result === "object") ? room.result : {};

  if (!state.users) state.users = {};
  const key = String(userId);

  if (!state.users[key]) {
    state.users[key] = {
      index: 0,
      choices: [],
      done: false,
    };
  }

  return state;
}

/**
 * Select current card (item) for user.
 * NOTE: For now we simply pick items from the FIRST collection_id in room.result.collection_ids
 * You can later replace this with user's chosen collection_id from connect step.
 */
async function getCurrentCardForUser(roomState, userId) {
    // Prefer user's chosen collection_id from connect step
  const u = roomState.users?.[String(userId)];
  const chosen = u?.collection_id;

  let collectionIdToUse = null;

  if (chosen !== undefined && chosen !== null) {
    collectionIdToUse = BigInt(Number(chosen));
  } else {
    // Fallback: use the first configured collection id
    const configIds = roomState.collection_ids || roomState.config?.collection_ids;
    const collectionIds = Array.isArray(configIds) ? configIds : [];

    if (collectionIds.length === 0) {
      const err = new Error("Room collections are not configured");
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    collectionIdToUse = BigInt(Number(collectionIds[0]));
  }

  // Get items ordered by created_at (or id) to have deterministic cards
  const items = await prisma.item.findMany({
    where: { collection_id: collectionIdToUse },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      image_url: true,
    },
  });

  return items;
}

/**
 * Mode 1: enter room and return current card for user.
 */
export async function getRoomCardStateService(userId, roomId) {
  const room = await ensureRoomAccess(userId, roomId);
  const userDisplay = await getUserDisplay(userId);

  const roomState = readOrInitRoomState(room, userId);

  const items = await getCurrentCardForUser(roomState, userId);

  const u = roomState.users[String(userId)];
  const idx = u.index || 0;

  // If no items -> error
  if (items.length === 0) {
    const err = new Error("No items in selected collection");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  // Clamp index
  const safeIdx = Math.min(Math.max(idx, 0), items.length - 1);
  u.index = safeIdx;

  const card = items[safeIdx];

  return {
    ...userDisplay,
    name_card: card.title,
    description: card.description || "",
  };
}

/**
 * Mode 2: handle user choice (0 exit, 1 yes, 2 no).
 * Returns next card DTO or redirect.
 */
export async function submitRoomChoiceService(userId, roomId, { choose }) {
  const v = Number(choose);
  if (![0, 1, 2].includes(v)) {
    const err = new Error("Invalid choose value");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  // Exit -> redirect home (or you can return ok:false)
  if (v === 0) {
    return { redirect: "/home" };
  }

  const room = await ensureRoomAccess(userId, roomId);
  const userDisplay = await getUserDisplay(userId);

  const roomState = readOrInitRoomState(room, userId);

  const items = await getCurrentCardForUser(roomState, userId);
  if (items.length === 0) {
    const err = new Error("No items in selected collection");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const key = String(userId);
  const u = roomState.users[key];

  // Save choice
  u.choices.push(v);

  // Move to next card
  u.index = (u.index || 0) + 1;

  // If finished cards -> redirect to drawing (placeholder)
  if (u.index >= items.length) {
    u.done = true;

    // Persist state to DB
    await prisma.room.update({
      where: { id: roomId },
      data: { result: roomState },
    });

    // You can change this later to "/rooms/{id_room}/drawing"
    return { redirect: `/rooms/${Number(roomId)}/drawing` };
  }

  // Persist updated state to DB
  await prisma.room.update({
    where: { id: roomId },
    data: { result: roomState },
  });

  const card = items[u.index];

  return {
    ...userDisplay,
    name_card: card.title,
    description: card.description || "",
  };
}

function validatePoints(points) {
  if (!Array.isArray(points)) {
    const err = new Error("points must be an array");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  // Limit to avoid huge payloads
  if (points.length > 50000) {
    const err = new Error("Too many points");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  for (const p of points) {
    if (typeof p !== "object" || p === null) {
      const err = new Error("Each point must be an object");
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    const x = Number(p.x);
    const y = Number(p.y);
    const color = p.color;

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      const err = new Error("Point x/y must be numbers");
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    if (color !== undefined && color !== null && typeof color !== "string") {
      const err = new Error("Point color must be a string");
      err.code = "VALIDATION_ERROR";
      throw err;
    }
  }
}

export async function getDrawingStateService(userId, roomId) {
  const room = await ensureRoomAccess(userId, roomId);

  const state = (room.result && typeof room.result === "object") ? room.result : {};

  if (!state.drawing) state.drawing = {};
  if (!state.drawing.pointsByUser) state.drawing.pointsByUser = {};

  // Ensure topic exists
  if (!state.drawing.topic) {
    // Simple fallback topic generator (you can connect to your drawing topics pool later)
    state.drawing.topic = "default";
  }

  const key = String(userId);
  const points = state.drawing.pointsByUser[key] || [];

  // Persist if we just initialized something
  await prisma.room.update({
    where: { id: roomId },
    data: { result: state },
  });

  return {
    topic: state.drawing.topic,
    points,
  };
}

export async function submitDrawingPointsService(userId, roomId, { points }) {
  validatePoints(points);

  const room = await ensureRoomAccess(userId, roomId);

  const state = (room.result && typeof room.result === "object") ? room.result : {};
  if (!state.drawing) state.drawing = {};
  if (!state.drawing.pointsByUser) state.drawing.pointsByUser = {};

  const key = String(userId);

  // Overwrite points with latest snapshot from FE (as per spec: list kept on FE, resend full list)
  state.drawing.pointsByUser[key] = points;

  await prisma.room.update({
    where: { id: roomId },
    data: { result: state },
  });

  return true;
}

