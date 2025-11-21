// routes/upload.routes.js
// Routes for image upload 

import { Router } from 'express';
import {
  uploadCollectionImage,
  uploadItemImage,
} from '../middlewares/upload.middleware.js';
import {
  uploadCollectionImageHandler,
  uploadItemImageHandler,
} from '../controllers/upload.controller.js';

const uploadRouter = Router();

// [POST] /upload/collection-image
// multipart/form-data
// field name: "image"
uploadRouter.post(
  '/collection-image',
  uploadCollectionImage.single('image'),  // create middleware from multer's instance (uploadCollectionImage)
  uploadCollectionImageHandler
);

// [POST] /upload/item-image
// multipart/form-data, field name: "image"
uploadRouter.post(
  '/item-image',
  uploadItemImage.single('image'),
  uploadItemImageHandler
);

export default uploadRouter;
