// Rooms routes
import { Router } from "express";
import { authApiRequired } from "../middlewares/auth.middleware.js";
import {
  handleRoomConnect,
  handleRoomCreate,
  handleRoomState,
  handleRoomDrawing,
  handleRoomDrawingsResults,
} from "../controllers/rooms.controller.js";

const roomsRouter = Router();

// [POST] /rooms/create
roomsRouter.post("/create", authApiRequired, handleRoomCreate);

// [POST] /rooms/connect/:id_room
roomsRouter.post("/connect/:id_room", authApiRequired, handleRoomConnect);

// [POST] /rooms/:id_room
roomsRouter.post("/:id_room", authApiRequired, handleRoomState);

// [POST] /rooms/:id_room/drawing
roomsRouter.post("/:id_room/drawing", authApiRequired, handleRoomDrawing);

// [GET] /rooms/:id_room/drawings
roomsRouter.get("/:id_room/drawings", authApiRequired, handleRoomDrawingsResults);

export default roomsRouter;
