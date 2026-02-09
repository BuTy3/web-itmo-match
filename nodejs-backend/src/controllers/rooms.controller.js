// Rooms controller
import {
  checkRoomAccess,
  chooseRoomCard,
  connectToRoom,
  createRoom,
  getRoomState,
  getUserCollectionsForRoom,
  getRoomDrawing,
  getRoomDrawingsResults,
  saveRoomDrawing,
  verifyRoomPassword,
} from '../services/rooms.service.js';

const getStatusByError = (err) => {
  switch (err.code) {
    case 'VALIDATION_ERROR':
      return 400;
    case 'NOT_ALLOWED':
      return 403;
    case 'NOT_FOUND':
      return 404;
    default:
      return 500;
  }
};

const isSingleCollectionRoom = (room) => {
  if (room?.result && typeof room.result === 'object') {
    return Number(room.result.type_collections) !== 2;
  }
  return room?.type !== 'COMBINED';
};

// [POST] /rooms/create
export async function handleRoomCreate(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    const { name, type_match, type_collections, password, collection_id } = req.body || {};

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
    console.error('Error in handleRoomCreate:', err);
    const status = getStatusByError(err);
    return res.status(status).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

// [POST] /rooms/connect/:id_room
export async function handleRoomConnect(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    const { id_room } = req.params || {};
    const { password, collection_id, check } = req.body || {};
    const room = await checkRoomAccess({ roomId: id_room });

    if (check) {
      await verifyRoomPassword(room, password);
      if (isSingleCollectionRoom(room)) {
        return res.json({ ok: true, collection_choose: false });
      }
      const collections = await getUserCollectionsForRoom(BigInt(req.user.id));
      return res.json({ ok: true, collection_choose: collections });
    }

    if (!password && !collection_id) {
      if (isSingleCollectionRoom(room)) {
        if (room.access_mode === 'PRIVATE') {
          return res.status(403).json({ ok: false, message: 'Password is required' });
        }
        await connectToRoom({
          userId: BigInt(req.user.id),
          roomId: id_room,
        });
        return res.json({ ok: true });
      }
      await verifyRoomPassword(room, password);
      const collections = await getUserCollectionsForRoom(BigInt(req.user.id));
      return res.json({ ok: true, collection_choose: collections });
    }

    await connectToRoom({
      userId: BigInt(req.user.id),
      roomId: id_room,
      password,
      collectionId: collection_id,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error in handleRoomConnect:', err);
    const status = getStatusByError(err);
    return res.status(status).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

// [POST] /rooms/:id_room
export async function handleRoomState(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    const { id_room } = req.params || {};
    const { choose } = req.body || {};

    if (choose !== undefined) {
      const resp = await chooseRoomCard({
        userId: BigInt(req.user.id),
        roomId: id_room,
        choose,
        nick: req.user.login || 'Никнейм',
      });

      return res.json(resp);
    }

    const resp = await getRoomState({
      userId: BigInt(req.user.id),
      roomId: id_room,
      nick: req.user.login || 'Никнейм',
    });

    return res.json(resp);
  } catch (err) {
    console.error('Error in handleRoomState:', err);
    const status = getStatusByError(err);
    return res.status(status).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

// [POST] /rooms/:id_room/drawing
export async function handleRoomDrawing(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    const { id_room } = req.params || {};
    const { points, snapshot } = req.body || {};

    if (!points && !snapshot) {
      const resp = await getRoomDrawing({
        userId: BigInt(req.user.id),
        roomId: id_room,
      });
      return res.json(resp);
    }

    const resp = await saveRoomDrawing({
      userId: BigInt(req.user.id),
      roomId: id_room,
      points,
      snapshot,
    });
    return res.json(resp);
  } catch (err) {
    console.error('Error in handleRoomDrawing:', err);
    const status = getStatusByError(err);
    return res.status(status).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

// [GET] /rooms/:id_room/drawings
export async function handleRoomDrawingsResults(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    const { id_room } = req.params || {};
    const resp = await getRoomDrawingsResults({
      userId: BigInt(req.user.id),
      roomId: id_room,
    });
    return res.json(resp);
  } catch (err) {
    console.error('Error in handleRoomDrawingsResults:', err);
    const status = getStatusByError(err);
    return res.status(status).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}
