// Rooms controller
import {
  checkRoomAccess,
  chooseRoomCard,
  connectToRoom,
  createRoom,
  getRoomState,
} from "../services/rooms.service.js";

const getStatusByError = (err) => {
  switch (err.code) {
    case "VALIDATION_ERROR":
      return 400;
    case "NOT_ALLOWED":
      return 403;
    case "NOT_FOUND":
      return 404;
    default:
      return 500;
  }
};

// [POST] /rooms/create
export async function handleRoomCreate(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const { name, type_match, type_collections, password, collection_id } =
      req.body || {};

    if (!name && !type_match && !type_collections && !collection_id) {
      return res.json({ ok: true });
    }

    const result = await createRoom({
      userId: BigInt(req.user.id),
      name,
      typeMatch: type_match,
      typeCollections: type_collections,
      password,
      collectionId: collection_id,
    });

    return res.json({
      ok: true,
      id_room: result.roomId,
    });
  } catch (err) {
    console.error("Error in handleRoomCreate:", err);
    const status = getStatusByError(err);
    return res.status(status).json({
      ok: false,
      message: err.message || "Internal server error",
    });
  }
}

// [POST] /rooms/connect/:id_room
export async function handleRoomConnect(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const { id_room } = req.params || {};
    const { password, collection_id } = req.body || {};

    if (!password && !collection_id) {
      await checkRoomAccess({ roomId: id_room });
      return res.json({ ok: true, collection_choose: true });
    }

    await connectToRoom({
      userId: BigInt(req.user.id),
      roomId: id_room,
      password,
      collectionId: collection_id,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in handleRoomConnect:", err);
    const status = getStatusByError(err);
    return res.status(status).json({
      ok: false,
      message: err.message || "Internal server error",
    });
  }
}

// [POST] /rooms/:id_room
export async function handleRoomState(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const { id_room } = req.params || {};
    const { choose } = req.body || {};

    if (choose !== undefined) {
      const resp = await chooseRoomCard({
        userId: BigInt(req.user.id),
        roomId: id_room,
        choose,
        nick: req.user.login || "Никнейм",
      });

      return res.json(resp);
    }

    const resp = await getRoomState({
      userId: BigInt(req.user.id),
      roomId: id_room,
      nick: req.user.login || "Никнейм",
    });

    return res.json(resp);
  } catch (err) {
    console.error("Error in handleRoomState:", err);
    const status = getStatusByError(err);
    return res.status(status).json({
      ok: false,
      message: err.message || "Internal server error",
    });
  }
}
