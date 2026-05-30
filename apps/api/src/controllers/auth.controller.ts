import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import { z } from 'zod';
import { queryOne, query } from '../database/connection';
import { rateLimiter, auditLog } from '../middleware/security.middleware';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'vetra_dev_secret';
const JWT_EXPIRES = '7d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const resend = new Resend(process.env.RESEND_API_KEY);

const RegisterSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
  full_name: z.string().min(2, 'Nome muito curto').max(255),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ForgotSchema = z.object({
  email: z.string().email('Email inválido'),
});

const ResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
});

function signToken(user: { id: string; email: string; plan: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES, issuer: 'vetra', audience: 'vetra-app' }
  );
}

// POST /api/auth/register
authRouter.post('/register',
  rateLimiter(5, 15 * 60 * 1000, 'Muitas tentativas de cadastro. Aguarde 15 minutos.'),
  auditLog('user.register', 'users'),
  async (req: Request, res: Response) => {
    try {
      const data = RegisterSchema.parse(req.body);
      const existing = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [data.email.toLowerCase()]);
      if (existing) return res.status(409).json({ error: 'Este email já está cadastrado.' });

      const password_hash = await bcrypt.hash(data.password, 12);
      const rows = await query<{ id: string; email: string; full_name: string; plan: string; credits: number; created_at: string }>(
        `INSERT INTO users (email, password_hash, full_name, plan, credits) VALUES ($1, $2, $3, 'free', 1) RETURNING id, email, full_name, plan, credits, created_at`,
        [data.email.toLowerCase(), password_hash, data.full_name.trim()]
      );
      const user = rows[0];
      const token = signToken(user);
      res.status(201).json({ user: { id: user.id, email: user.email, full_name: user.full_name, plan: user.plan, credits: user.credits }, token });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0]?.message || 'Dados inválidos.' });
      console.error('[register]', err.message);
      res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }
  }
);

// POST /api/auth/login
authRouter.post('/login',
  rateLimiter(10, 15 * 60 * 1000, 'Muitas tentativas de login. Aguarde 15 minutos.'),
  auditLog('user.login', 'users'),
  async (req: Request, res: Response) => {
    try {
      const data = LoginSchema.parse(req.body);
      const user = await queryOne<{ id: string; email: string; password_hash: string; full_name: string; plan: string; credits: number }>(
        'SELECT id, email, password_hash, full_name, plan, credits FROM users WHERE email = $1',
        [data.email.toLowerCase()]
      );
      const fakeHash = '$2b$12$invalidhashfortimingprotection00000000000000000';
      const valid = await bcrypt.compare(data.password, user?.password_hash || fakeHash);
      if (!user || !valid) return res.status(401).json({ error: 'Email ou senha incorretos.' });

      await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
      const subscription = await queryOne<{ plan: string; status: string }>(
        `SELECT plan, status FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
        [user.id]
      );
      const activePlan = subscription?.plan || user.plan;
      if (activePlan !== user.plan) await query('UPDATE users SET plan = $1 WHERE id = $2', [activePlan, user.id]);
      const token = signToken({ id: user.id, email: user.email, plan: activePlan });
      res.json({ user: { id: user.id, email: user.email, full_name: user.full_name, plan: activePlan, credits: user.credits }, token });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Dados inválidos.' });
      console.error('[login]', err.message);
      res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }
  }
);

// GET /api/auth/me
authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await queryOne<{ id: string; email: string; full_name: string; plan: string; credits: number; created_at: string }>(
      'SELECT id, email, full_name, plan, credits, created_at FROM users WHERE id = $1', [req.user!.id]
    );
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    const sub = await queryOne<{ plan: string; status: string; current_period_end: string }>(
      `SELECT plan, status, current_period_end FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    const activePlan = sub?.plan || user.plan;
    if (activePlan !== user.plan) await query('UPDATE users SET plan = $1 WHERE id = $2', [activePlan, user.id]);
    res.json({ user: { ...user, plan: activePlan }, subscription: sub || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password',
  rateLimiter(3, 15 * 60 * 1000, 'Muitas tentativas. Aguarde 15 minutos.'),
  async (req: Request, res: Response) => {
    try {
      const { email } = ForgotSchema.parse(req.body);
      const user = await queryOne<{ id: string; full_name: string }>('SELECT id, full_name FROM users WHERE email = $1', [email.toLowerCase()]);
      if (!user) return res.json({ message: 'Se este email estiver cadastrado, você receberá as instruções em breve.' });

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [resetToken, expiresAt, user.id]);

      const resetUrl = FRONTEND_URL + '/reset-password?token=' + resetToken;

      const { error: emailError } = await resend.emails.send({
        from: 'Vetra <onboarding@resend.dev>',
        to: email,
        subject: 'Redefinição de senha — Vetra',
        html: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0d1117;color:#e6edf3;border-radius:12px;"><div style="text-align:center;margin-bottom:24px;"><span style="font-family:monospace;font-size:20px;letter-spacing:0.15em;">VETRA</span></div><h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Redefinir sua senha</h2><p style="color:#8b949e;font-size:14px;line-height:1.6;margin-bottom:24px;">Ola, ' + user.full_name + '! Recebemos uma solicitacao para redefinir a senha da sua conta. O link expira em 1 hora.</p><a href="' + resetUrl + '" style="display:inline-block;background:#63b3ed;color:#0d1117;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Redefinir senha</a><p style="color:#484f58;font-size:12px;margin-top:24px;">Se voce nao solicitou isso, ignore este email.</p></div>',
      });

      if (emailError) {
        console.error('[forgot-password] Resend error:', JSON.stringify(emailError));
        return res.status(500).json({ error: 'Erro ao enviar email. Tente novamente.' });
      }

      res.json({ message: 'Se este email estiver cadastrado, você receberá as instruções em breve.' });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0]?.message });
      console.error('[forgot-password]', err.message);
      res.status(500).json({ error: 'Erro ao enviar email. Tente novamente.' });
    }
  }
);

// POST /api/auth/reset-password
authRouter.post('/reset-password',
  rateLimiter(5, 15 * 60 * 1000, 'Muitas tentativas. Aguarde 15 minutos.'),
  async (req: Request, res: Response) => {
    try {
      const { token, password } = ResetSchema.parse(req.body);
      const user = await queryOne<{ id: string; email: string; plan: string }>(
        'SELECT id, email, plan FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()', [token]
      );
      if (!user) return res.status(400).json({ error: 'Token inválido ou expirado. Solicite um novo link.' });

      const password_hash = await bcrypt.hash(password, 12);
      await query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [password_hash, user.id]);

      const jwtToken = signToken(user);
      res.json({ message: 'Senha redefinida com sucesso.', token: jwtToken, user: { id: user.id, email: user.email, plan: user.plan } });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0]?.message });
      console.error('[reset-password]', err.message);
      res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }
  }
);

// GET /api/auth/validate-reset-token?token=xxx
authRouter.get('/validate-reset-token', async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') return res.status(400).json({ valid: false });
  const user = await queryOne<{ id: string }>('SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()', [token]);
  res.json({ valid: !!user });
});
