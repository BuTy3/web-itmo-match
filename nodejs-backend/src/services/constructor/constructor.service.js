// service store all users'drafts 

// demo (not use database)
const draftStore = new Map();  // userId -> draft
let lastCollectionId = 0;

// draft = {
//   collectionId,
//   userId,
//   items: Map<itemId, { itemId, urlImage, imagePath, description }>,
//   lastItemId
// }

// get or create draft (collection) by owner id
export function getOrCreateDraft(userId) {
  let draft = draftStore.get(userId);
  if (!draft) {
    draft = {
      collectionId: ++lastCollectionId,
      userId,
      items: new Map(),
      lastItemId: 0,
    };
    draftStore.set(userId, draft);
  }
  return draft;
}