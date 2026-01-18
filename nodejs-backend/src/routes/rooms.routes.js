// Rooms routes
import { Router } from "express";
import { authApiRequired } from "../middlewares/auth.middleware.js";
import {
  handleRoomConnect,
  handleRoomCreate,
  handleRoomState,
} from "../controllers/rooms.controller.js";

const roomsRouter = Router();

// [POST] /rooms/create
roomsRouter.post("/create", authApiRequired, handleRoomCreate);

// [POST] /rooms/connect/:id_room
roomsRouter.post("/connect/:id_room", authApiRequired, handleRoomConnect);

// [POST] /rooms/:id_room
roomsRouter.post("/:id_room", authApiRequired, handleRoomState);

export default roomsRouter;
