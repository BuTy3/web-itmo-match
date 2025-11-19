// collection services
import {
  getOrCreateDraft
} from '../constructor/constructor.service.js';

// get draft's id (collection) from constructor
export function getDraftIdInConstructor(userId) {
  const draft = getOrCreateDraft(userId);
  return draft.collectionId;
}
