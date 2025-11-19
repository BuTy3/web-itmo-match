// services/collection/collection.service.js
import { Collection } from '../../models/collection.model.js';

// Auto-increment id
let nextCollectionId = 1;

// Map userId -> draft Collection 
const draftCollections = new Map();

/**
 * Create (or retrieve) draft collection for the user.
 * - only on RAM.
 * - Each user has only one active collection.
 * - Return draft collection's id (new_id).
 */
export function getNewCollection(userId) {
  // If draft is already existed
  const existing = draftCollections.get(userId);
  if (existing) {
    return existing.id;
  }

  const now = new Date();

  const draft = new Collection({
    id: nextCollectionId++,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  });

  draft.items = [];     

  draftCollections.set(userId, draft);

  return draft.id;
}