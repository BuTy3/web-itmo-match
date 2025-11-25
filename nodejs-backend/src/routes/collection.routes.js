// collection routes
import { Router } from "express";
import { authApiRequired } from "../middlewares/auth.middleware.js";
import {
  getConstructor,
  loadConstructor,
  createItem,
  getCollection,
  updateCollectionController,
} from "../controllers/collection.controller.js";

const collectionRouter = Router();

// [POST] collections/constructor
// authentication
// get draft collection (or create a new draft if it's not existed)
collectionRouter.post("/constructor", authApiRequired, getConstructor);

// [POST] collections/constructor/item
// authentication
// create new item inside draft collection
collectionRouter.post("/constructor/item", authApiRequired, createItem);

// [POST] collections/constructor/:new_id
// new_id - draft collection's id
// authentication
// load draft collection's state (if request's body is empty)
// if req.body {url_image, image, description} -> save metadata collection
collectionRouter.post("/constructor/:new_id", authApiRequired, loadConstructor);

// [GET] /collections/:id
// Private: only owner can access collection data
collectionRouter.get("/:id", authApiRequired, getCollection);

// [PUT] /collections/:id
// Private: only owner can update collection metadata
collectionRouter.put("/:id", authApiRequired, updateCollectionController);

export default collectionRouter;
