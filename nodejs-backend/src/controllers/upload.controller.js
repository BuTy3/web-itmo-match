// controllers/upload.controller.js
// Controller for uploading images (collection, items, etc).

/**
 * [POST] /upload/collection-image
 *
 * This handler expects that Multer already processed the file:
 *  - field name: "image"
 *  - stored in ./uploads/collections
 *
 * On success:
 *  { "ok": true, "imagePath": "/uploads/collections/<filename>" }
 *
 * On failure:
 *  { "ok": false, "message": "<text>" }
 */
export function uploadCollectionImageHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "Image file is required",
      });
    }

    // Public path to access this image
    const imagePath = `/uploads/collections/${req.file.filename}`;

    return res.json({
      ok: true,
      imagePath,
    });
  } catch (err) {
    console.error("Error in uploadCollectionImageHandler:", err);
    return res.status(500).json({
      ok: false,
      message: err.message || "Internal server error while uploading image",
    });
  }
}

/**
 * [POST] /upload/item-image
 *
 * This handler expects that Multer already processed the file:
 *  - field name: "image"
 *  - stored in ./uploads/items
 */
export function uploadItemImageHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "Image file is required",
      });
    }

    const imagePath = `/uploads/items/${req.file.filename}`;

    return res.json({
      ok: true,
      imagePath,
    });
  } catch (err) {
    console.error("Error in uploadItemImageHandler:", err);
    return res.status(500).json({
      ok: false,
      message:
        err.message || "Internal server error while uploading item image",
    });
  }
}
