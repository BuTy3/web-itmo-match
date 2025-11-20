// controllers/collection.controller.js
import {
  getNewCollection,
  addItemToDraft,
  getDraftForUser,
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
    const new_id = getNewCollection(userId);

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

// insert items into draft
// [POST] /collections/constructor/:new_id
export function saveConstructor(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;

    const paramNewId = Number(req.params.new_id);

    // Body: { token, url_image, image, description }
    const { url_image, image, description } = req.body;

    // insert item into draft trước
    const { collectionId, itemId } = addItemToDraft(userId, {
      urlImage: url_image,
      imagePath: image,
      description,
    });

    // rồi mới so sánh với paramNewId
    // dont trust new_id, which sent from FE
    if (paramNewId && paramNewId !== collectionId) {
      console.warn(
        `Warning: URL new_id=${paramNewId} != draft collectionId=${collectionId}`
      );
      // tuỳ yêu cầu, có thể return lỗi ở đây nếu muốn strict hơn
    }

    return res.json({  // success
      ok: true,
      new_id: collectionId,
      new_item_id: itemId,
    });
  } catch (err) {
    console.error('Error in saveConstructor:', err);

    // Send new_id again
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
      message: err.message || 'Internal server error while saving item',
      new_id: newId,
    });
  }
}

