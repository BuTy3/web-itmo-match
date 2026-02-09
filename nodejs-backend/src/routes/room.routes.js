// Room routes (voting)
import { Router } from 'express';
import { authApiRequired } from '../middlewares/auth.middleware.js';
import { getVoting, postVote, getResults, postLeave } from '../controllers/room.controller.js';

const roomRouter = Router();

// [GET] /rooms/:id/voting
// Private: get current voting state for user
roomRouter.get('/:id/voting', authApiRequired, getVoting);

// [POST] /rooms/:id/vote
// Private: submit a vote for an item
roomRouter.post('/:id/vote', authApiRequired, postVote);

// [GET] /rooms/:id/results
// Private: get room voting results
roomRouter.get('/:id/results', authApiRequired, getResults);

// [POST] /rooms/:id/leave
// Private: leave room
roomRouter.post('/:id/leave', authApiRequired, postLeave);

export default roomRouter;
