// Rooms controller
import { createRoomService } from "../services/room.service.js";

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
