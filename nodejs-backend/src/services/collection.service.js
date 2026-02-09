// services/collection.service.js
// This layer contains all in-memory "draft" logic for collections and items.

import { Collection } from '../models/collection.model.js';
import { Item } from '../models/item.model.js';
import { prisma } from '../db.js';

// Auto-increment id
let nextCollectionId = 1;

// Map userId -> draft Collection
const draftCollections = new Map();

/**
 * Create (or receive) draft collection for the user.
 *  [POST] /collections/constructor
 * - only on RAM.
 * - Each user has only one active collection.
 * - Return draft collection's id (new_id).
 */
export function checkConstructor(userId) {
  const draft = getOrCreateDraft(userId);
  return draft.id;
}

/**
 * Get or create draft collection
 */
export function getOrCreateDraft(userId) {
  const userKey = String(userId);

  let draft = draftCollections.get(userKey);
  if (!draft) {
    const now = new Date();
    draft = new Collection({
      id: nextCollectionId++,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    });

    draft.items = new Map();
    draft.lastItemId = 0;

    draftCollections.set(userKey, draft);
  }
  return draft;
}

/**
 * Get draft for user (if has)
 */
export function getDraftForUser(userId) {
  const userKey = String(userId);
  return draftCollections.get(userKey) || null;
}

/**
 * Get constructor state for the user:
 *  - ensure draft exists
 *  - calculate next item id (for the next item that will be created)
 *
 * Used by:
 *  [POST] /collections/constructor/:new_id  (load constructor page)
 */
export function getConstructorState(userId) {
  const draft = getOrCreateDraft(userId);

  // Next item id is always "lastItemId + 1" (or 1 if no items yet)
  const nextItemId = draft.lastItemId > 0 ? draft.lastItemId + 1 : 1;

  return {
    collectionId: draft.id,
    nextItemId,
  };
}

/**
 * Update draft collection metadata (url_image, image, description).
 * Used when saving collection info itself (not items).
 *
 * Used by:
 *  [POST] /collections/constructor/:new_id
 *  when body contains { url_image, image, description }
 */
export function updateConstructorMeta(userId, { urlImage, imagePath, title, description }) {
  const draft = getOrCreateDraft(userId);

  if (title !== undefined) {
    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    if (trimmedTitle.length > 100) {
      const err = new Error('Collection title is too long');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    draft.title = trimmedTitle || null;
  }

  // simple validation for collection description
  if (!description || !description.trim()) {
    const err = new Error('Collection description is required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (description.length > 1000) {
    const err = new Error('Collection description is too long');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (urlImage && !isValidUrl(urlImage)) {
    const err = new Error('url_image is not a valid URL');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  // store metadata on draft collection
  draft.urlImage = urlImage || null;
  draft.imagePath = imagePath || null;
  draft.description = description.trim();
  draft.updatedAt = new Date();

  return draft.id;
}

/**
 * Finalize draft collection for the given user:
 *  - save collection + items into PostgreSQL via Prisma
 *  - remove draft from memory
 *  - return object with final collection id (from DB)
 *
 * Used when user chooses "save & exit".
 */
export async function finalizeDraft(userId) {
  const userKey = String(userId);

  const draft = draftCollections.get(userKey);
  if (!draft) {
    const err = new Error('Draft collection not found for user');
    err.code = 'NO_DRAFT';
    throw err;
  }

  // Very basic validation: description must exist (same style as updateConstructorMeta)
  if (!draft.description || !draft.description.trim()) {
    const err = new Error('Collection description is required before finalize');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const title =
    draft.title && draft.title.trim().length > 0
      ? draft.title.trim().slice(0, 100)
      : 'Untitled collection';

  // owner_id in DB is BigInt, so we cast userId to BigInt
  const ownerIdBigInt = BigInt(userId);

  // 1) Create collection row in DB
  const createdCollection = await prisma.collection.create({
    data: {
      owner_id: ownerIdBigInt,
      title,
      description: draft.description.trim(),
      // created_at is defaulted by DB
    },
  });

  // 2) Create items in DB (if any)
  const itemsArray = draft.items ? Array.from(draft.items.values()) : [];

  if (itemsArray.length > 0) {
    const itemsData = itemsArray.map((item) => ({
      collection_id: createdCollection.id,
      title:
        item.title && item.title.trim().length > 0
          ? item.title.trim().slice(0, 100)
          : `Item ${item.id}`,
      description: item.description || null,
      image_url: item.imagePath || item.urlImage || null,
      // created_at is default by DB
    }));

    await prisma.item.createMany({
      data: itemsData,
    });
  }

  // Remove draft from in-memory store
  draftCollections.delete(userKey);

  console.log(
    'finalizeDraft: saved to DB. collectionId =',
    createdCollection.id,
    'for userId =',
    userId,
  );

  // Return final collection id (from DB, converted to Number for convenience)
  return {
    id: Number(createdCollection.id),
  };
}

/**
 * Add item to draft
 * [POST] /collections/constructor/:new_id
 *
 * NOTE:
 *   Now this helper is also used by:
 *   [POST] /collections/constructor/item
 *   It handles "item_id", "next" and "save_exit" logic.
 */
export function addItemToDraft(
  userId,
  { itemIdFromClient, urlImage, imagePath, title, description, next, saveExit },
) {
  const draft = getOrCreateDraft(userId);

  let trimmedTitle = null;
  if (title !== undefined) {
    trimmedTitle = typeof title === 'string' ? title.trim() : '';
    if (trimmedTitle.length > 100) {
      const err = new Error('Title is too long');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    trimmedTitle = trimmedTitle || null;
  }

  // simple validation
  if (!description || !description.trim()) {
    const err = new Error('Description is required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (description.length > 1000) {
    const err = new Error('Description is too long');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (urlImage && !isValidUrl(urlImage)) {
    const err = new Error('url_image is not a valid URL');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  // --- item_id validation (according to spec) ---
  // itemIdFromClient comes from "item_id" in request body.
  let requestedId = parseInt(itemIdFromClient, 10);

  if (Number.isNaN(requestedId) || requestedId <= 0) {
    // if item_id is invalid, but we already have items,
    // use the last valid item_id
    if (draft.lastItemId > 0) {
      requestedId = draft.lastItemId;
    } else {
      // if there is no item yet, start from 1
      requestedId = 1;
    }
  }

  // if this item_id is already used -> error
  if (draft.items.has(requestedId)) {
    const err = new Error(`item_id ${requestedId} is already used`);
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  // insert item with chosen requestedId
  const itemId = requestedId;

  const item = new Item({
    id: itemId,
    collectionId: draft.id,
    urlImage: urlImage || null,
    imagePath: imagePath || null,
    title: trimmedTitle,
    description: description.trim(),
  });

  draft.items.set(itemId, item);

  // update lastItemId if needed
  if (itemId > draft.lastItemId) {
    draft.lastItemId = itemId;
  }

  draft.updatedAt = new Date();

  return {
    collectionId: draft.id,
    itemId,
    item,
    next: !!next,
    saveExit: !!saveExit,
  };
}

/**
 * Get finalized collection by id from PostgreSQL.
 * Used by: GET /collections/:id
 *
 * Returns:
 *   - null if not found
 *   - DTO object:
 *       {
 *         id, ownerId, urlImage, imagePath, description,
 *         createdAt, updatedAt, items: [...]
 *       }
 */
export async function getCollectionById(collectionId) {
  const idNum = Number(collectionId);
  if (!Number.isFinite(idNum) || idNum <= 0) return null;

  const idBigInt = BigInt(idNum);

  // Load collection with its items from DB
  const dbCollection = await prisma.collection.findUnique({
    where: { id: idBigInt },
    include: {
      item: true,
    },
  });

  if (!dbCollection) {
    return null;
  }

  // Map DB items to DTO
  const itemsDto = dbCollection.item.map((it) => ({
    id: Number(it.id),
    collectionId: Number(it.collection_id),
    urlImage: it.image_url || null,
    imagePath: null, // we do not store separate local path in DB for now
    title: it.title || null,
    description: it.description || null,
  }));

  const collectionDto = {
    id: Number(dbCollection.id),
    ownerId: Number(dbCollection.owner_id),
    // Collection model in DB has no image fields, so we keep them null in DTO
    urlImage: null,
    imagePath: null,
    title: dbCollection.title || null,
    description: dbCollection.description || null,
    createdAt: dbCollection.created_at,
    // There is no updated_at in DB schema, so we reuse created_at
    updatedAt: dbCollection.created_at,
    items: itemsDto,
  };

  return collectionDto;
}

/**
 * Update finalized collection metadata in PostgreSQL.
 * Only the owner is allowed to update.
 *
 * Used by:
 *   [PUT] /collections/:id
 *
 * @param {number} userId - id of the user performing update
 * @param {number|string} collectionId - id of the collection to update
 * @param {object} payload - { urlImage, imagePath, description }
 * @returns {Promise<object>} updated collection DTO (same shape as getCollectionById)
 * @throws Error with code:
 *   - 'NOT_FOUND' if collection does not exist in DB
 *   - 'FORBIDDEN' if user is not the owner
 *   - 'VALIDATION_ERROR' if validation failed
 */
export async function updateCollection(
  userId,
  collectionId,
  { urlImage, imagePath: _imagePath, description },
) {
  const idNum = Number(collectionId);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    const err = new Error('Invalid collection id');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const idBigInt = BigInt(idNum);

  // Load collection from DB first
  const dbCollection = await prisma.collection.findUnique({
    where: { id: idBigInt },
  });

  if (!dbCollection) {
    const err = new Error('Collection not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  // Only owner can update
  if (Number(dbCollection.owner_id) !== userId) {
    const err = new Error('Access denied');
    err.code = 'FORBIDDEN';
    throw err;
  }

  const dataToUpdate = {};

  // Validation & updating description (and derived title)
  if (description !== undefined) {
    if (!description || !description.trim()) {
      const err = new Error('Collection description is required');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    if (description.length > 1000) {
      const err = new Error('Collection description is too long');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const trimmed = description.trim();
    dataToUpdate.description = trimmed;
    // Title comes from description (first 100 chars)
    dataToUpdate.title = trimmed.length > 0 ? trimmed.slice(0, 100) : 'Untitled collection';
  }

  // For now we do NOT store urlImage / imagePath on collection level in DB,
  // because schema does not have image columns.
  // You can still validate urlImage here if you want, but it will not be saved.
  if (urlImage !== undefined && urlImage !== null && urlImage !== '') {
    if (!isValidUrl(urlImage)) {
      const err = new Error('url_image is not a valid URL');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    // No DB field to store it yet -> ignored.
  }

  // imagePath is also ignored for now (no DB column on collection)

  // If there is nothing to update, just return current state
  if (Object.keys(dataToUpdate).length === 0) {
    return await getCollectionById(idNum);
  }

  // Apply update in DB
  await prisma.collection.update({
    where: { id: idBigInt },
    data: dataToUpdate,
  });

  // Return updated DTO
  const updatedDto = await getCollectionById(idNum);
  return updatedDto;
}

/**
 * Delete collection (and its items) from PostgreSQL.
 * Only the owner is allowed to delete.
 *
 * Used by:
 *   [DELETE] /collections/:id
 */
export async function deleteCollection(userId, collectionId) {
  const idNum = Number(collectionId);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    const err = new Error('Invalid collection id');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const idBigInt = BigInt(idNum);

  const dbCollection = await prisma.collection.findUnique({
    where: { id: idBigInt },
  });

  if (!dbCollection) {
    const err = new Error('Collection not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (Number(dbCollection.owner_id) !== userId) {
    const err = new Error('Access denied');
    err.code = 'FORBIDDEN';
    throw err;
  }

  await prisma.collection.delete({
    where: { id: idBigInt },
  });

  return { id: idNum };
}

/**
 * Delete item from collection.
 * Only the owner of collection is allowed.
 *
 * Used by:
 *   [DELETE] /collections/:id/items/:item_id
 */
export async function deleteCollectionItem(userId, collectionId, itemId) {
  const collectionNum = Number(collectionId);
  const itemNum = Number(itemId);

  if (!Number.isFinite(collectionNum) || collectionNum <= 0) {
    const err = new Error('Invalid collection id');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (!Number.isFinite(itemNum) || itemNum <= 0) {
    const err = new Error('Invalid item id');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const collectionBigInt = BigInt(collectionNum);
  const itemBigInt = BigInt(itemNum);

  const dbCollection = await prisma.collection.findUnique({
    where: { id: collectionBigInt },
  });

  if (!dbCollection) {
    const err = new Error('Collection not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (Number(dbCollection.owner_id) !== userId) {
    const err = new Error('Access denied');
    err.code = 'FORBIDDEN';
    throw err;
  }

  const dbItem = await prisma.item.findFirst({
    where: { id: itemBigInt, collection_id: collectionBigInt },
  });

  if (!dbItem) {
    const err = new Error('Item not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  await prisma.item.delete({
    where: { id: itemBigInt },
  });

  return { id: itemNum };
}

// --- Helper ---

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
