import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { pollsRouter } from './routes/polls.routes.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
//const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
  process.env.CORS_ORIGIN_PREVIEW
].filter(Boolean);

app.use(helmet());

//app.use(cors({ origin: frontendOrigin }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/polls', pollsRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    
    const flat = error.flatten();
    const fieldErrors = Object.values(flat.fieldErrors).flat();
    const formErrors = flat.formErrors;
    const firstMessage =
      fieldErrors[0] ??
      formErrors[0] ??
      'Please check your input and try again.';

    return res.status(400).json({
      message: firstMessage,           
      fields: flat.fieldErrors,       
    });
  }

  console.error(error);
  res.status(500).json({ message: 'Something went wrong' });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
