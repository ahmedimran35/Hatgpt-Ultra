import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import generationRouter from './routes/generation';
import communityBattlesRouter from './routes/communityBattles';
import { requireAuth } from './middleware/requireAuth';

const app = express();

app.use(cors({ 
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://54.37.39.3', 'http://54.37.39.3:80'], 
  credentials: true 
}));
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hatgpt_ultra';

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});


app.use('/api/auth', authRouter);
app.use('/api/generation', generationRouter);
app.use('/api/community-battles', communityBattlesRouter);

app.get('/api/protected', requireAuth, (_req: Request, res: Response) => {
  res.json({ secret: 'authorized' });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Server listening on :${port}`);
});


