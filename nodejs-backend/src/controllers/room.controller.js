// Room controller (voting endpoints)
import {
  getVotingState,
  submitVote,
  getRoomResults,
  leaveRoom,
  joinRoom,
} from '../services/room.service.js';

/**
 * [GET] /rooms/:id/voting
 * Get current voting state for the user
 */
export async function getVoting(req, res) {
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

    const roomId = BigInt(idNum);
    const userId = req.user.id.toString();

    // Ensure user is joined to the room
    const joinResult = await joinRoom(roomId, userId);
    if (!joinResult.ok) {
      return res.status(400).json(joinResult);
    }

    const state = await getVotingState(roomId, userId);

    if (state.error) {
      return res.status(404).json({
        ok: false,
        message: state.error,
      });
    }

    return res.json(state);
  } catch (err) {
    console.error('Error in getVoting:', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

/**
 * [POST] /rooms/:id/vote
 * Submit a vote for an item
 * Body: { item_id: string, vote: boolean }
 */
export async function postVote(req, res) {
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

    const { item_id, vote } = req.body;

    if (!item_id) {
      return res.status(400).json({
        ok: false,
        message: 'item_id is required',
      });
    }

    if (typeof vote !== 'boolean') {
      return res.status(400).json({
        ok: false,
        message: 'vote must be a boolean',
      });
    }

    const roomId = BigInt(idNum);
    const userId = req.user.id.toString();

    const result = await submitVote(roomId, userId, item_id, vote);

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('Error in postVote:', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

/**
 * [GET] /rooms/:id/results
 * Get room voting results
 */
export async function getResults(req, res) {
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

    const roomId = BigInt(idNum);
    const userId = req.user.id.toString();

    const result = await getRoomResults(roomId, userId);

    if (!result.ok) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('Error in getResults:', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}

/**
 * [POST] /rooms/:id/leave
 * Leave a room
 */
export async function postLeave(req, res) {
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

    const roomId = BigInt(idNum);
    const userId = req.user.id.toString();

    const result = await leaveRoom(roomId, userId);

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('Error in postLeave:', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal server error',
    });
  }
}
