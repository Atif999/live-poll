import express from 'express';
import {
  createPollController,
  getPollController,
  getResultsController,
  streamResultsController,
  voteController
} from '../controllers/polls.controller.js';

export const pollsRouter = express.Router();

pollsRouter.post('/', createPollController);
pollsRouter.get('/:id', getPollController);
pollsRouter.post('/:id/vote', voteController);
pollsRouter.get('/:id/results', getResultsController);
pollsRouter.get('/:id/stream', streamResultsController);
