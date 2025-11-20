// collection routes
import { Router } from 'express';
import { authApiRequired } from '../middlewares/auth.middleware.js';
import {
  getConstructor,
  loadConstructor,
} from '../controllers/collection.controller.js';

const collectionRouter = Router();

// [POST] collections/constructor
// authentication
// get draft collection (or create a new draft if it's not existed)
collectionRouter.post('/constructor', authApiRequired, getConstructor);

// [POST] collections/constructor/:new_id
// new_id - draft collection's id
// authentication
// load draft collection's state
collectionRouter.post('/constructor/:new_id', authApiRequired, loadConstructor);

export default collectionRouter;
