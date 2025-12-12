// Rooms service (Prisma + validation)
import {prisma} from "../db.js";

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
