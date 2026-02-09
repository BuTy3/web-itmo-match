// controllers/collection.controller.js
import {
  checkConstructor,
  addItemToDraft,
  getDraftForUser,
  getConstructorState,
  updateConstructorMeta,
  finalizeDraft,
  getCollectionById,
  updateCollection,
  deleteCollection,
  deleteCollectionItem,
} from '../services/collection.service.js';

// call service creates draft collection, return new_id
export function getConstructor(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;
    const new_id = checkConstructor(userId);

    if (!new_id) {
      return res.status(500).json({
        ok: false,
        message: 'Cannot create collection draft',
      });
    }

    return res.json({ ok: true, new_id });
  } catch (err) {
    console.error('Error in getConstructor:', err);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while creating collection',
    });
  }
}

// [POST] /collections/constructor/:new_id
// mode 1: save collection's metadata
// mode 2: load collection's state {collection's id; next item's id}
export function loadConstructor(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;

    const paramNewId = Number(req.params.new_id);

    // Body: { url_image, image, title, description }
    const { url_image, image, title, description } = req.body || {};

    // detect if this request is for "saving collection metadata"
    const hasMetaPayload =
      url_image !== undefined ||
      image !== undefined ||
      title !== undefined ||
      description !== undefined;

    if (hasMetaPayload) {
      // --- MODE 1: save collection metadata ---

      // update draft collection metadata in service
      const collectionId = updateConstructorMeta(userId, {
        urlImage: url_image,
        imagePath: image,
        title,
        description,
      });

      // comparate with paramNewId
      // dont trust new_id, which sent from FE
      if (paramNewId && paramNewId !== collectionId) {
        console.warn(`Warning: URL new_id=${paramNewId} != draft collectionId=${collectionId}`);
      }

      // success: collection metadata saved
      // For now we return only { ok, new_id }, FE can call
      // loadConstructor again (without body) to get item_id for items.
      return res.json({
        ok: true,
        new_id: collectionId,
      });
    }

    // --- MODE 2: load constructor state (no metadata in body) ---

    const { collectionId, nextItemId } = getConstructorState(userId);

    // comparate with paramNewId
    // dont trust new_id, which sent from FE
    if (paramNewId && paramNewId !== collectionId) {
      console.warn(`Warning: URL new_id=${paramNewId} != draft collectionId=${collectionId}`);
    }

    // success: return draft collection id and NEXT item id (for future creation)
    return res.json({
      ok: true,
      new_id: collectionId,
      item_id: nextItemId,
    });
  } catch (err) {
    console.error('Error in loadConstructor:', err);

    // Send new_id again (if possible)
    let newId = null;
    if (req.user && req.user.id) {
      const draft = getDraftForUser(req.user.id);
      if (draft) newId = draft.id;
    }

    const isValidation = err.code === 'VALIDATION_ERROR';

    // false
    // { "ok": false, "message": <message>, "new_id": <new_id> }
    return res.status(isValidation ? 400 : 500).json({
      ok: false,
      message: err.message || 'Internal server error while loading constructor',
      new_id: newId,
    });
  }
}

/**
 * [POST] /collections/constructor/item
 * Create new item inside current draft collection.
 * Body:
 *  {
 *    item_id,      // optional, FE sends "expected" item id
 *    url_image,
 *    image,
 *    title,
 *    description,
 *    next,         // create more items
 *    save_exit     // save and finish constructor
 *  }
 */
export async function createItem(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;

    // Body: { item_id, url_image, image, title, description, next, save_exit }
    const { item_id, url_image, image, title, description, next, save_exit } = req.body;

    // reuse service helper to insert item into draft
    const { collectionId, itemId, saveExit } = addItemToDraft(userId, {
      itemIdFromClient: item_id,
      urlImage: url_image,
      imagePath: image,
      title,
      description,
      next,
      saveExit: save_exit,
    });

    // for debug
    console.log('createItem: result =', {
      collectionId,
      itemId,
      saveExit,
    });

    // if user chose "save & exit": finalize draft and return collection_id
    if (saveExit) {
      try {
        // Save collection + items into DB and remove draft from memory
        const finalized = await finalizeDraft(userId);

        return res.json({
          ok: true,
          collection_id: finalized.id,
        });
      } catch (finalizeErr) {
        console.error('Error in finalizeDraft:', finalizeErr);

        const isValidation =
          finalizeErr.code === 'NO_DRAFT' || finalizeErr.code === 'VALIDATION_ERROR';

        return res.status(isValidation ? 400 : 500).json({
          ok: false,
          message: finalizeErr.message || 'Internal server error while finalizing collection',
        });
      }
    }

    // success (continue editing / creating)
    // here itemId is the id of the item that was just created
    return res.json({
      ok: true,
      new_id: collectionId,
      item_id: itemId,
    });
  } catch (err) {
    console.error('Error in createItem:', err);

    // try to send back new_id again if draft exists
    let newId = null;
    if (req.user && req.user.id) {
      const draft = getDraftForUser(req.user.id);
      if (draft) newId = draft.id;
    }

    const isValidation = err.code === 'VALIDATION_ERROR';

    // { "ok": false, "message": <message>, "new_id": <new_id> }
    return res.status(isValidation ? 400 : 500).json({
      ok: false,
      message: err.message || 'Internal server error while creating item',
      new_id: newId,
      // You can also echo item_id back if needed:
      item_id: req.body?.item_id,
    });
  }
}

/**
 * [GET] /collections/:id
 * Private endpoint: only owner can access the collection.
 *
 * On success:
 *  {
 *    "ok": true,
 *    "collection": { ... }
 *  }
 *
 * On failure:
 *  { "ok": false, "message": "<text>" }
 */
export async function getCollection(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;
    const paramId = req.params.id;

    console.log('getCollection: userId =', userId, 'paramId =', paramId);

    const collection = await getCollectionById(paramId);

    if (!collection) {
      return res.status(404).json({
        ok: false,
        message: 'Collection not found',
      });
    }

    // Private access: only owner can see the collection
    if (collection.ownerId !== userId) {
      console.warn(
        `getCollection: access denied. userId=${userId}, ownerId=${collection.ownerId}, collectionId=${collection.id}`,
      );

      return res.status(403).json({
        ok: false,
        message: 'Access denied',
      });
    }

    // collection is already a DTO built in service
    return res.json({
      ok: true,
      collection,
    });
  } catch (err) {
    console.error('Error in getCollection:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error while getting collection',
    });
  }
}

/**
 * [PUT] /collections/:id
 * Private endpoint: only owner can update collection metadata.
 *
 * Body: {
 *   "url_image": "<string|null|undefined>",
 *   "image": "<string|null|undefined>",
 *   "description": "<string|null|undefined>"
 * }
 *
 * On success:
 *   { "ok": true, "collection": { ... } }
 *
 * On failure:
 *   { "ok": false, "message": "<text>" }
 */
export async function updateCollectionController(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;
    const paramId = req.params.id;

    // Expect frontend to send url_image, image (imagePath), description
    const { url_image, image, description } = req.body || {};

    console.log('updateCollectionController:', {
      userId,
      paramId,
      url_image,
      image,
      description,
    });

    const updated = await updateCollection(userId, paramId, {
      urlImage: url_image,
      imagePath: image,
      description,
    });

    // updated is already DTO from service (same shape as getCollection)
    return res.json({
      ok: true,
      collection: updated,
    });
  } catch (err) {
    console.error('Error in updateCollectionController:', err);

    const code = err.code;
    let status = 500;

    if (code === 'VALIDATION_ERROR') status = 400;
    else if (code === 'NOT_FOUND') status = 404;
    else if (code === 'FORBIDDEN') status = 403;

    return res.status(status).json({
      ok: false,
      message: err.message || 'Internal server error while updating collection',
    });
  }
}

/**
 * [DELETE] /collections/:id
 * Private endpoint: only owner can delete collection.
 */
export async function deleteCollectionController(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;
    const paramId = req.params.id;

    const deleted = await deleteCollection(userId, paramId);

    return res.json({
      ok: true,
      id: deleted.id,
    });
  } catch (err) {
    console.error('Error in deleteCollectionController:', err);

    const code = err.code;
    let status = 500;

    if (code === 'VALIDATION_ERROR') status = 400;
    else if (code === 'NOT_FOUND') status = 404;
    else if (code === 'FORBIDDEN') status = 403;

    return res.status(status).json({
      ok: false,
      message: err.message || 'Internal server error while deleting collection',
    });
  }
}

/**
 * [DELETE] /collections/:id/items/:item_id
 * Private endpoint: only owner can delete item from collection.
 */
export async function deleteCollectionItemController(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;
    const paramId = req.params.id;
    const itemId = req.params.item_id;

    const deleted = await deleteCollectionItem(userId, paramId, itemId);

    return res.json({
      ok: true,
      id: deleted.id,
    });
  } catch (err) {
    console.error('Error in deleteCollectionItemController:', err);

    const code = err.code;
    let status = 500;

    if (code === 'VALIDATION_ERROR') status = 400;
    else if (code === 'NOT_FOUND') status = 404;
    else if (code === 'FORBIDDEN') status = 403;

    return res.status(status).json({
      ok: false,
      message: err.message || 'Internal server error while deleting item',
    });
  }
}
