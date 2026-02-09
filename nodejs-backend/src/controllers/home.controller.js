// Home controller
import {
  fetchReadyCollections,
  fetchUserCollections,
  findRoomById,
} from '../services/home.service.js';

// [GET] /home
export async function getHomeCollections(req, res) {
  try {
    const collections = await fetchReadyCollections();

    return res.json({
      ok: true,
      collections,
    });
  } catch (err) {
    console.error('Error in getHomeCollections:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

// [POST] /home (auth)
export async function getMyCollections(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized',
      });
    }

    const userId = BigInt(req.user.id);
    const collections = await fetchUserCollections(userId);

    return res.json({
      ok: true,
      collections,
    });
  } catch (err) {
    console.error('Error in getMyCollections:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

// [POST] /home/search (auth)
export async function searchRoom(req, res) {
  try {
    // FE validates id > 0 and number, but we also validate on backend
    const rawId = req.body?.id;
    const idNum = Number(rawId);

    if (!Number.isFinite(idNum) || idNum <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid room id',
      });
    }

    const room = await findRoomById(BigInt(idNum));

    if (!room) {
      return res.status(404).json({
        ok: false,
        message: 'Room not found',
      });
    }

    // FE will redirect to: rooms/connect/{id_room}
    return res.json({
      ok: true,
      id_room: Number(room.id),
    });
  } catch (err) {
    console.error('Error in searchRoom:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}
