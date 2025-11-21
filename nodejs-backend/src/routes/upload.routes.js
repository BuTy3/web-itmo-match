// routes/upload.routes.js
// Routes for image upload 

import { Router } from 'express';
import { uploadCollectionImage } from '../middlewares/upload.middleware.js';
import { uploadCollectionImageHandler } from '../controllers/upload.controller.js';

const uploadRouter = Router();

// [POST] /upload/collection-image
// multipart/form-data
// field name: "image"
uploadRouter.post(
  '/collection-image',
  uploadCollectionImage.single('image'),  // create middleware from multer's instance (uploadCollectionImage)
  uploadCollectionImageHandler
);

export default uploadRouter;
