// middlewares/upload.middleware.js
// Multer configuration for uploading collection images.

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root uploads folder is outside src: ../.. / uploads
const uploadsRootDir = path.join(__dirname, '..', '..', 'uploads');

// Subfolders for collections and items
const collectionsDir = path.join(uploadsRootDir, 'collections');
const itemsDir = path.join(uploadsRootDir, 'items');

// Disk storage configuration:
//  - all collection images will be stored in: ../uploads/collections
const storageCollection = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, collectionsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');

    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

// Disk storage for item images
const storageItem = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, itemsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');

    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

// Accept only jpeg / png
function imageFileFilter(req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'), false);
  }
}

// Limit file size: 2 MB
const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB
};

// Export middleware for collection images
export const uploadCollectionImage = multer({
  storage: storageCollection,
  fileFilter: imageFileFilter,
  limits,
});

// Export middleware for item images
export const uploadItemImage = multer({
  storage: storageItem,
  fileFilter: imageFileFilter,
  limits,
});
