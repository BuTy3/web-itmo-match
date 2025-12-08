// controllers/drawing.controller.js
// Controller for local drawing topics (public, no authentication).

import { getRandomTopic } from "../services/drawing.service.js";

/**
 * [GET] /drawing/topic
 *
 * Public endpoint (no auth).
 *
 * Frontend sends:
 *   GET /drawing/topic?last_topic=<string>
 *
 * If first visit or localStorage is empty:
 *   last_topic is null / not provided.
 *
 * On success:
 *   { "ok": true, "topic": "<string>" }
 *
 * On failure:
 *   { "ok": false, "message": "<string>" }
 */
export function getDrawingTopic(req, res) {
  try {
    // last_topic is sent from frontend via query string
    const lastTopic = req.query.last_topic ?? null;

    const topic = getRandomTopic(lastTopic);

    return res.json({
      ok: true,
      topic,
    });
  } catch (err) {
    console.error("Error in getDrawingTopic:", err);

    return res.status(500).json({
      ok: false,
      message: err.message || "Internal server error while getting topic",
    });
  }
}
