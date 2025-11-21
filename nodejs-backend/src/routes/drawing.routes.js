// routes/drawing.routes.js
// Routes for local drawing feature (public, no authentication).

import { Router } from 'express';
import { getDrawingTopic } from '../controllers/drawing.controller.js';

const drawingRouter = Router();

// [GET] /drawing/topic
// Public endpoint: returns a topic for drawing.
// Query param: last_topic (optional)
drawingRouter.get('/topic', getDrawingTopic);

export default drawingRouter;
