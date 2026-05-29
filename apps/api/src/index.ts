// DOTENV PRIMEIRO — obrigatório antes de qualquer import
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { db } from './database/connection';
import { authRouter } from './controllers/auth.controller';
import { verifyRouter } from './controllers/verify.controller';
import { scoreRouter } from './controllers/score.controller';
import { reportsRouter } from './controllers/reports.controller';
import { historyRouter } from './controllers/history.controller';
import { billingRouter } from './controllers/billing.controller';
import { authMiddleware } from './middleware/auth.middleware';
import { securityHeaders, sanitizeBody, rateLimiter } from './middleware/security.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Trust proxy (para pegar IP real atrás de nginx/load balancer) ──
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────
app.use(securityHeaders);
app.use(helmet({ contentSecurityPolicy: false })); // CSP já no securityHeaders

// ── CORS restritivo ───────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origem não permitida'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing — guarda rawBody para webhook Stripe ────────────
// Asaas usa JSON padrão
app.use(express.json({ limit: '2mb' }));
app.use(compression());
app.use(sanitizeBody);

// ── Rate limiting global ──────────────────────────────────────────
app.use('/api/', rateLimiter(200, 15 * 60 * 1000, 'Limite de requisições atingido.'));

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'vetra-api',
    version: '2.0.0',
    env: {
      database: !!process.env.DATABASE_URL,
      gemini: !!process.env.GEMINI_API_KEY,
      rapidapi: !!process.env.RAPIDAPI_KEY,
      datajud: !!process.env.DATAJUD_API_KEY,
      asaas: !!process.env.ASAAS_API_KEY,
    },
  });
});

// ── Rotas públicas ────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/billing/webhook', billingRouter);

// ── Rotas autenticadas ────────────────────────────────────────────
app.use('/api/verify',   authMiddleware, verifyRouter);
app.use('/api/score',    authMiddleware, scoreRouter);
app.use('/api/reports',  authMiddleware, reportsRouter);
app.use('/api/history',  historyRouter); // auth interno
app.use('/api/billing',  authMiddleware, billingRouter);

// ── Error handler global ──────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Erro interno do servidor.' : err.message,
  });
});

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ── Startup ───────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🔷 VETRA API v2.0 → http://localhost:${PORT}`);
  console.log(`📊 Health        → http://localhost:${PORT}/health\n`);

  const missing = ['DATABASE_URL', 'JWT_SECRET'].filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`❌ FALTAM VARIÁVEIS: ${missing.join(', ')}`);
    console.error('   Crie o arquivo apps/api/.env\n');
  }

  if (!process.env.GEMINI_API_KEY)   console.warn('⚠️  GEMINI_API_KEY ausente — IA desativada');
  if (!process.env.RAPIDAPI_KEY)    console.warn('⚠️  RAPIDAPI_KEY ausente — Instagram desativado');
  if (!process.env.DATAJUD_API_KEY) console.warn('⚠️  DATAJUD_API_KEY ausente — Datajud desativado');
  if (!process.env.ASAAS_API_KEY) console.warn('ASAAS_API_KEY ausente - Pagamentos desativados');

  try {
    await db.query('SELECT 1');
    console.log('✅ PostgreSQL conectado\n');
  } catch (e: any) {
    console.error('❌ PostgreSQL FALHOU:', e.message);
    console.error('   Verifique DATABASE_URL no .env\n');
  }
});

export default app;
