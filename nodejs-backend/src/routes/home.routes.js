// Home routes
import { Router } from "express";
import { authApiRequired } from "../middlewares/auth.middleware.js";
import {
  getHomeCollections,
  getMyCollections,
  searchRoom,
} from "../controllers/home.controller.js";

const homeRouter = Router();

// [GET] /home
// Public: get ready collections for Home page
homeRouter.get("/", getHomeCollections);

// [POST] /home
// Private: get collections of current user
homeRouter.post("/", authApiRequired, getMyCollections);

// [POST] /home/search
// Private: search room by id
homeRouter.post("/search", authApiRequired, searchRoom);

export default homeRouter;
