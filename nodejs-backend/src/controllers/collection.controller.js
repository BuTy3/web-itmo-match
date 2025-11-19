// collection controller
import {
  getDraftIdInConstructor
} from '../services/collection/collection.service.js';

// check the constructor, which has collection draft
export function checkConstructor(req, res) {
  const userId = req.user.id;

  const new_id = getDraftIdInConstructor(userId);
  return res.json({ ok: true, new_id });
}
