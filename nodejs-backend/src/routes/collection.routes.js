import { Router } from 'express';
import { authApiRequired } from '../middlewares/auth.middleware.js';
import {
  checkConstructor,
} from '../controllers/collection.controller.js';
const collectionRouter = Router();

// [POST] collections/constructor/check
// authentication
// check the constructor (collection draft)
collectionRouter.post('/constructor/check', authApiRequired, checkConstructor);


export default collectionRouter;
