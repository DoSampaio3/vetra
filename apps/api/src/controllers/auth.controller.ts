import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { queryOne, query } from '../database/connection';
import { rateLimiter, auditLog } from '../middleware/security.middleware';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'vetra_dev_secret';
const JWT_EXPIRES = '7d';

const RegisterSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
  full_name: z.string().min(2, 'Nome muito curto').max(255),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user: { id: string; email: string; plan: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES, issuer: 'vetra', audience: 'vetra-app' }
  );
}

// POST /api/auth/register
authRouter.post(
  '/register',
  rateLimiter(5, 15 * 60 * 1000, 'Muitas tentativas de cadastro. Aguarde 15 minutos.'),
  auditLog('user.register', 'users'),
  async (req: Request, res: Response) => {
    try {
      const data = RegisterSchema.parse(req.body);

      const existing = await queryOne<{ id: string }>(
        'SELECT id FROM users WHERE email = $1',
        [data.email.toLowerCase()]
      );
      if (existing) {
        return res.status(409).json({ error: 'Este email já está cadastrado.' });
      }

      const password_hash = await bcrypt.hash(data.password, 12);

      const rows = await query<{ id: string; email: string; full_name: string; plan: string; credits: number; created_at: string }>(
        `INSERT INTO users (email, password_hash, full_name, plan, credits)
         VALUES ($1, $2, $3, 'free', 1)
         RETURNING id, email, full_name, plan, credits, created_at`,
        [data.email.toLowerCase(), password_hash, data.full_name.trim()]
      );
      const user = rows[0];
      const token = signToken(user);

      res.status(201).json({
        user: { id: user.id, email: user.email, full_name: user.full_name, plan: user.plan, credits: user.credits },
        token,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors[0]?.message || 'Dados inválidos.' });
      }
      console.error('[register]', err.message);
      res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }
  }
);

// POST /api/auth/login
authRouter.post(
  '/login',
  rateLimiter(10, 15 * 60 * 1000, 'Muitas tentativas de login. Aguarde 15 minutos.'),
  auditLog('user.login', 'users'),
  async (req: Request, res: Response) => {
    try {
      const data = LoginSchema.parse(req.body);

      const user = await queryOne<{
        id: string; email: string; password_hash: string;
        full_name: string; plan: string; credits: number;
      }>(
        'SELECT id, email, password_hash, full_name, plan, credits FROM users WHERE email = $1',
        [data.email.toLowerCase()]
      );

      // Timing-safe: sempre faz bcrypt mesmo se usuário não existe
      const fakeHash = '$2b$12$invalidhashfortimingprotection00000000000000000';
      const passwordToCheck = user?.password_hash || fakeHash;
      const valid = await bcrypt.compare(data.password, passwordToCheck);

      if (!user || !valid) {
        return res.status(401).json({ error: 'Email ou senha incorretos.' });
      }

      // Atualiza last_login
      await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

      // Busca plano atual da subscription
      const subscription = await queryOne<{ plan: string; status: string }>(
        `SELECT plan, status FROM subscriptions
         WHERE user_id = $1 AND status = 'active'
         ORDER BY created_at DESC LIMIT 1`,
        [user.id]
      );

      // Plano vem da subscription ativa, senão usa o campo users.plan
      const activePlan = subscription?.plan || user.plan;

      // Atualiza o plano no users se difere
      if (activePlan !== user.plan) {
        await query('UPDATE users SET plan = $1 WHERE id = $2', [activePlan, user.id]);
      }

      const token = signToken({ id: user.id, email: user.email, plan: activePlan });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          plan: activePlan,
          credits: user.credits,
        },
        token,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos.' });
      }
      console.error('[login]', err.message);
      res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }
  }
);

// GET /api/auth/me
authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await queryOne<{
      id: string; email: string; full_name: string; plan: string; credits: number; created_at: string;
    }>(
      'SELECT id, email, full_name, plan, credits, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // Verifica subscription ativa
    const sub = await queryOne<{ plan: string; status: string; current_period_end: string }>(
      `SELECT plan, status, current_period_end FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );

    const activePlan = sub?.plan || user.plan;
    if (activePlan !== user.plan) {
      await query('UPDATE users SET plan = $1 WHERE id = $2', [activePlan, user.id]);
    }

    res.json({
      user: { ...user, plan: activePlan },
      subscription: sub || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
