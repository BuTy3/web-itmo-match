// History routes
import { Router } from 'express';
import { authApiRequired } from '../middlewares/auth.middleware.js';
import { getHistory, getRoomHistory } from '../controllers/history.controller.js';

const historyRouter = Router();

// [GET] /history
// Private: get list of rooms (history) with optional filters
historyRouter.get('/', authApiRequired, getHistory);

// [GET] /history/:id
// Private: get detailed history of a specific room
historyRouter.get('/:id', authApiRequired, getRoomHistory);

export default historyRouter;
