// Rooms routes
import { Router } from "express";
import { authApiRequired } from "../middlewares/auth.middleware.js";
import { createRoom } from "../controllers/room.controller.js";

const roomsRoutes = Router();

// [POST] /rooms/create
// Mode 1: check access (empty body) -> { ok: true }
// Mode 2: create room (body with fields) -> { ok: true, id_room: <id> }
roomsRoutes.post("/create", authApiRequired, createRoom);

export default roomsRoutes;