import type { Request, Response } from 'express';
import { getPollResults } from '../services/polls.service.js';

function writeSseEvent(res: Response, eventName: string, data: unknown) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function streamPollResults(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendResults = async () => {
    const results = await getPollResults(req.params.id);

    if (!results) {
      writeSseEvent(res, 'error', { message: 'Poll not found' });
      return;
    }

    writeSseEvent(res, 'results', results);
  };

  await sendResults();

  const interval = setInterval(() => {
    sendResults().catch(() => {
      writeSseEvent(res, 'error', { message: 'Failed to refresh results' });
    });
  }, 2000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}
