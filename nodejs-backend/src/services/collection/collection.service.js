// services/collection/collection.service.js
// This layer contains all in-memory "draft" logic for collections and items.

import { Collection } from '../../models/collection.model.js';
import { Item } from '../../models/item.model.js';

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
  let draft = draftCollections.get(userId);
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

    draftCollections.set(userId, draft);
  }
  return draft;
}

/**
 * Get draft for user (if has)
 */
export function getDraftForUser(userId) {
  return draftCollections.get(userId) || null;
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
 * Add item to draft
 * [POST] /collections/constructor/:new_id
 * 
 * NOTE:
 *   In the new flow, this helper will be used by a dedicated
 *   "create item" endpoint (for example: POST /collections/constructor/item).
 *   loadConstructor() should NOT use this function anymore.
 */
export function addItemToDraft(userId, { urlImage, imagePath, description }) {
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

  // insert item
  const itemId = ++draft.lastItemId;

  const item = new Item({
    id: itemId,
    collectionId: draft.id,
    urlImage: urlImage || null,
    imagePath: imagePath || null, 
    description: description.trim(),
  });

  draft.items.set(itemId, item);
  draft.updatedAt = new Date();

  return {
    collectionId: draft.id,
    itemId,
    item,
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
