// services/collection.service.js
// This layer contains all in-memory "draft" logic for collections and items.

import { Collection } from '../models/collection.model.js';
import { Item } from '../models/item.model.js';

// Auto-increment id
let nextCollectionId = 1;

// Map userId -> draft Collection 
const draftCollections = new Map();
// Map collectionId -> finalized Collection (not a draft anymore)
const collectionsStore = new Map();

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
export function updateConstructorMeta(userId, { urlImage, imagePath, description }) {
  const draft = getOrCreateDraft(userId);

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
 *  - move it from draftCollections to collectionsStore
 *  - mark it as non-draft
 *  - return finalized collection
 *
 * Used when user chooses "save & exit".
 */
export function finalizeDraft(userId) {
  const userKey = String(userId);

  const draft = draftCollections.get(userKey);
  if (!draft) {
    const err = new Error('Draft collection not found for user');
    err.code = 'NO_DRAFT';
    throw err;
  }

  // Mark this collection as finalized (not needed for logic, but useful)
  draft.isDraft = false;

  // Save to finalized store (we reuse the same id and object for now)
  collectionsStore.set(draft.id, draft);

  // Remove draft from draftCollections
  draftCollections.delete(userKey);

  console.log(
    'finalizeDraft: finalized collectionId =',
    draft.id,
    'for userId =',
    userId
  );

  return draft;
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
  { itemIdFromClient, urlImage, imagePath, description, next, saveExit }
) {
  const draft = getOrCreateDraft(userId);

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


// --- Helper ---

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
