// Rooms routes
import { Router } from "express";
import { authApiRequired } from "../middlewares/auth.middleware.js";
import { createRoom, connectRoom, roomPage, drawingRoom } from "../controllers/room.controller.js";

const roomsRouter = Router();

// [POST] /rooms/create
// Mode 1: check access (empty body) -> { ok: true }
// Mode 2: create room (body with fields) -> { ok: true, id_room: <id> }
roomsRouter.post("/create", authApiRequired, createRoom);

// [POST] /rooms/connect/:id_room
// Mode 1: check access (empty body) -> { ok: true, collection_choose: [...] }
// Mode 2: submit connect (password + collection_id) -> { ok: true }
roomsRouter.post("/connect/:id_room", authApiRequired, connectRoom);

// [POST] /rooms/:id_room/drowing
// Mode 1: enter drawing page (empty body) -> { ok: true, topic, points }
// Mode 2: submit points (body { points }) -> { ok: true }
roomsRouter.post("/:id_room/drawing", authApiRequired, drawingRoom);

// [POST] /rooms/:id_room
// Mode 1: enter room (empty body) -> { ok: true, nick, profile_picture_url, name_card, description }
// Mode 2: choose card (body { choose }) -> { ok: true, ... } or redirect stage
roomsRouter.post("/:id_room", authApiRequired, roomPage);

export default roomsRouter;