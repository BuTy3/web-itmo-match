// middlewares/upload.middleware.js
// Multer configuration for uploading collection images.

import multer from 'multer';
import path from 'path';

// Disk storage configuration:
//  - all collection images will be stored in: ./uploads/collections
const storageCollection = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/collections');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');

    // Example: my_image-1700000000000.png
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
