// controllers/collection.controller.js
import {
  checkConstructor,
  addItemToDraft,
  getDraftForUser,
  getConstructorState, 
} from '../services/collection/collection.service.js';

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
// check if constructor is already exits, if not -> create a new one
// return next item's id in this constructor
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

    // At this step we only LOAD constructor state,
    // we DO NOT create any item here.
    const { collectionId, nextItemId } = getConstructorState(userId);

    // comparate with paramNewId
    // dont trust new_id, which sent from FE
    if (paramNewId && paramNewId !== collectionId) {
      console.warn(
        `Warning: URL new_id=${paramNewId} != draft collectionId=${collectionId}`
      );
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
 *    description,
 *    next,         // create more items
 *    save_exit     // save and finish constructor
 *  }
 */
export function createItem(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;

    // Body: { item_id, url_image, image, description, next, save_exit }
    const { item_id, url_image, image, description, next, save_exit } = req.body;

    // reuse service helper to insert item into draft
    const { collectionId, itemId, saveExit } = addItemToDraft(userId, {
      itemIdFromClient: item_id,
      urlImage: url_image,
      imagePath: image,
      description,
      next,
      saveExit: save_exit,
    });

    // if user chose "save & exit": return collection_id only
    if (saveExit) {
      return res.json({
        ok: true,
        collection_id: collectionId,
      });
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
