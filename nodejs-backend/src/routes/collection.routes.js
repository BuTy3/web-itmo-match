// collection routes
import { Router } from 'express';
import { authApiRequired } from '../middlewares/auth.middleware.js';
import {
  getConstructor,
  saveConstructor,
} from '../controllers/collection.controller.js';

const collectionRouter = Router();

// [POST] collections/constructor
// authentication
// create collection
collectionRouter.post('/constructor', authApiRequired, getConstructor);

// [POST] collections/constructor/:new_id
// insert item into draft collection
collectionRouter.post('/constructor/:new_id', authApiRequired, saveConstructor);

export default collectionRouter;
