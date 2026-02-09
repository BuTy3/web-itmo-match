// History controller
import { fetchHistoryRooms, fetchRoomHistory } from '../services/history.service.js';

// [GET] /history (auth)
// Get list of rooms with optional filters
export async function getHistory(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized',
      });
    }

    const userId = BigInt(req.user.id);
    // Get filters from query parameters
    const filters = {
      name: req.query.name || undefined,
      type: req.query.type || undefined,
      date: req.query.date || undefined,
    };

    const rooms = await fetchHistoryRooms(userId, filters);

    return res.json({
      ok: true,
      rooms,
    });
  } catch (err) {
    console.error('Error in getHistory:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

// [GET] /history/:id (auth)
// Get detailed history of a specific room
export async function getRoomHistory(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized',
      });
    }

    const rawId = req.params?.id;
    const idNum = Number(rawId);

    if (!Number.isFinite(idNum) || idNum <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid room id',
      });
    }

    const userId = BigInt(req.user.id);
    const roomId = BigInt(idNum);

    const room = await fetchRoomHistory(roomId, userId);

    if (!room) {
      return res.status(404).json({
        ok: false,
        message: 'Room not found or access denied',
      });
    }

    return res.json({
      ok: true,
      room,
    });
  } catch (err) {
    console.error('Error in getRoomHistory:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}
