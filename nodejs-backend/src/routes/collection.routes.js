// collection routes
import { Router } from 'express';
import { authApiRequired } from '../middlewares/auth.middleware.js';
import {
  checkConstructor,
  // saveConstructor,
} from '../controllers/collection.controller.js';

const collectionRouter = Router();

// [POST] collections/constructor/check
// authentication
// check the constructor (collection draft)
collectionRouter.post('/constructor/check', authApiRequired, checkConstructor);

// // [POST] collections/constructor/:new_id
// collectionRouter.post('/constructor/:new_id', authApiRequired, saveConstructor);

export default collectionRouter;
