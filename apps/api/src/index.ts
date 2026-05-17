import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { db } from './database/connection';
import { authRouter } from './controllers/auth.controller';
import { verifyRouter } from './controllers/verify.controller';
import { scoreRouter } from './controllers/score.controller';
import { reportsRouter } from './controllers/reports.controller';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'vetra-api' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/verify', authMiddleware, verifyRouter);
app.use('/api/score', authMiddleware, scoreRouter);
app.use('/api/reports', authMiddleware, reportsRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start
app.listen(PORT, async () => {
  console.log(`\n🔷 VETRA API running on http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health\n`);
  
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connected');
  } catch (e) {
    console.error('❌ Database connection failed:', e);
  }
});

export default app;
