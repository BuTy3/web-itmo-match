// controllers/collection.controller.js
import {
  getNewCollection
} from '../services/collection/collection.service.js';

// call service creates collection
export function getConstructor(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'User is not authenticated',
      });
    }

    const userId = req.user.id;

    const new_id = getNewCollection(userId); // call service

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
