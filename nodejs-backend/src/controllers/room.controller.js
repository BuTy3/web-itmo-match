// Rooms controller
import { 
    createRoomService,
    getConnectStateService,
  submitConnectService,
  getRoomCardStateService,
  submitRoomChoiceService,
  getDrawingStateService,
  submitDrawingPointsService,
  getDrawingResService,
 } from "../services/room.service.js";

// [POST] /rooms/create
export async function createRoom(req, res) {
  try {
    // Mode 1: just check access (A requirement)
    // If body is empty or has no "name" -> return ok: true
    const body = req.body || {};
    const hasCreatePayload = body.name !== undefined || body.type_collections !== undefined || body.collection_id !== undefined;

    if (!hasCreatePayload) {
      return res.json({ ok: true });
    }

    // Mode 2: create room
    const userId = BigInt(req.user.id);

    const {
      name,
      type_match,
      password,
      type_collections,
      collection_id, // can be number OR array
    } = body;

    const created = await createRoomService(userId, {
      name,
      typeMatch: type_match,
      password,
      typeCollections: type_collections,
      collectionId: collection_id,
    });

    return res.json({
      ok: true,
      id_room: Number(created.id),
    });
  } catch (err) {
    console.error("Error in createRoom:", err);

    const code = err.code;
    let status = 500;

    if (code === "VALIDATION_ERROR") status = 400;
    else if (code === "FORBIDDEN") status = 403;

    return res.status(status).json({
      ok: false,
      message: err.message || "Internal server error",
    });
  }
}

// [POST] /rooms/connect/:id_room
export async function connectRoom(req, res) {
  try {
    const userId = BigInt(req.user.id);

    // Validate room id in URL
    const roomIdNum = Number(req.params.id_room);
    if (!Number.isFinite(roomIdNum) || roomIdNum <= 0 || !Number.isInteger(roomIdNum)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid room id",
      });
    }
    const roomId = BigInt(roomIdNum);

    const body = req.body || {};
    const hasSubmitPayload =
      body.password !== undefined || body.collection_id !== undefined;

    // Mode 1: check access and return choose list
    if (!hasSubmitPayload) {
      const state = await getConnectStateService(userId, roomId);

      return res.json({
        ok: true,
        collection_choose: state.collection_choose,
      });
    }

    // Mode 2: submit connect
    const { password, collection_id } = body;

    await submitConnectService(userId, roomId, {
      password,
      collectionId: collection_id,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in connectRoom:", err);

    const code = err.code;
    let status = 500;

    if (code === "VALIDATION_ERROR") status = 400;
    else if (code === "NOT_FOUND") status = 404;
    else if (code === "FORBIDDEN") status = 403;

    return res.status(status).json({
      ok: false,
      message: err.message || "Internal server error",
    });
  }
}

// [POST] /rooms/:id_room
export async function roomPage(req, res) {
  try {
    const userId = BigInt(req.user.id);

    // Validate room id in URL
    const roomIdNum = Number(req.params.id_room);
    if (!Number.isFinite(roomIdNum) || roomIdNum <= 0 || !Number.isInteger(roomIdNum)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid room id",
      });
    }
    const roomId = BigInt(roomIdNum);

    const body = req.body || {};
    const hasChoosePayload = body.choose !== undefined;

    // Mode 1: enter room (no choose in body)
    if (!hasChoosePayload) {
      const state = await getRoomCardStateService(userId, roomId);

      return res.json({
        ok: true,
        nick: state.nick,
        profile_picture_url: state.profile_picture_url,
        name_card: state.name_card,
        description: state.description,
      });
    }

    // Mode 2: user chooses (0 exit, 1 yes, 2 no)
    const { choose } = body;

    const result = await submitRoomChoiceService(userId, roomId, { choose });

    // If service returns a "redirect", FE can navigate
    if (result.redirect) {
      return res.json({
        ok: true,
        redirect: result.redirect,
      });
    }

    // Otherwise return the next card info
    return res.json({
      ok: true,
      nick: result.nick,
      profile_picture_url: result.profile_picture_url,
      name_card: result.name_card,
      description: result.description,
    });
  } catch (err) {
    console.error("Error in roomPage:", err);

    const code = err.code;
    let status = 500;

    if (code === "VALIDATION_ERROR") status = 400;
    else if (code === "NOT_FOUND") status = 404;
    else if (code === "FORBIDDEN") status = 403;

    return res.status(status).json({
      ok: false,
      message: err.message || "Internal server error",
    });
  }
}

// [POST] /rooms/:id_room/drawing
export async function drawingRoom(req, res) {
  try {
    const userId = BigInt(req.user.id);

    const roomIdNum = Number(req.params.id_room);
    if (!Number.isFinite(roomIdNum) || roomIdNum <= 0 || !Number.isInteger(roomIdNum)) {
      return res.status(400).json({ ok: false, message: "Invalid room id" });
    }
    const roomId = BigInt(roomIdNum);

    const body = req.body || {};
    const hasPointsPayload = body.points !== undefined;

    // Mode 1: enter drawing page
    if (!hasPointsPayload) {
      const state = await getDrawingStateService(userId, roomId);

      return res.json({
        ok: true,
        topic: state.topic,
        points: state.points,
      });
    }

    // Mode 2: submit points
    await submitDrawingPointsService(userId, roomId, {
      points: body.points,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in drowingRoom:", err);

    const code = err.code;
    let status = 500;

    if (code === "VALIDATION_ERROR") status = 400;
    else if (code === "NOT_FOUND") status = 404;
    else if (code === "FORBIDDEN") status = 403;

    return res.status(status).json({
      ok: false,
      message: err.message || "Internal server error",
    });
  }
}

// [POST] /rooms/:id_room/drawing_res
export async function drawingResRoom(req, res) {
  try {
    const userId = BigInt(req.user.id);

    const roomIdNum = Number(req.params.id_room);
    if (!Number.isFinite(roomIdNum) || roomIdNum <= 0 || !Number.isInteger(roomIdNum)) {
      return res.status(400).json({ ok: false, message: "Invalid room id" });
    }
    const roomId = BigInt(roomIdNum);

    const result = await getDrawingResService(userId, roomId);

    return res.json({
      ok: true,
      picture: result.picture,
    });
  } catch (err) {
    console.error("Error in drawingResRoom:", err);

    const code = err.code;
    let status = 500;

    if (code === "VALIDATION_ERROR") status = 400;
    else if (code === "NOT_FOUND") status = 404;
    else if (code === "FORBIDDEN") status = 403;

    return res.status(status).json({
      ok: false,
      message: err.message || "Internal server error",
    });
  }
}
