import { Router, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { query, queryOne } from '../database/connection';
import { calculateTrustScore } from '../services/trust-score.service';
import { cache } from '../services/cache.service';
import { saveToHistory } from './history.controller';

export const verifyRouter = Router();

const VerifySchema = z.object({
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(8).optional(),
  username: z.string().min(2).optional(),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
}).refine(
  (data) => Object.values(data).some(Boolean),
  { message: 'Informe ao menos um campo para análise.' }
);

// POST /api/verify
verifyRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  let verificationId: string | null = null;

  try {
    const data = VerifySchema.parse(req.body);
    const userId = req.user!.id;

    // ── 1. Verificar créditos antes de qualquer coisa ──────────────
    const userRow = await queryOne<{ credits: number; plan: string }>(
      'SELECT credits, plan FROM users WHERE id = $1',
      [userId]
    );

    if (!userRow) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const isUnlimited = userRow.plan === 'enterprise' || userRow.credits === 999;
    if (!isUnlimited && userRow.credits <= 0) {
      return res.status(402).json({
        error: 'Créditos insuficientes. Adquira um plano para continuar.',
        code: 'NO_CREDITS',
      });
    }

    // ── 2. Descontar crédito atomicamente (SELECT ... FOR UPDATE) ──
    if (!isUnlimited) {
      const deducted = await queryOne<{ credits: number }>(
        `UPDATE users SET credits = credits - 1
         WHERE id = $1 AND credits > 0
         RETURNING credits`,
        [userId]
      );
      if (!deducted) {
        return res.status(402).json({
          error: 'Créditos insuficientes.',
          code: 'NO_CREDITS',
        });
      }
    }

    // ── 3. Criar verificação ───────────────────────────────────────
    const cpfHash = data.cpf
      ? crypto.createHash('sha256').update(data.cpf).digest('hex')
      : null;

    const verificationRows = await query<{ id: string }>(
      `INSERT INTO verifications (
        user_id, subject_email, subject_phone, subject_username,
        subject_cpf_hash, subject_birth_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'processing') RETURNING id`,
      [userId, data.email || null, data.phone || null,
       data.username || null, cpfHash, data.birth_date || null]
    );
    verificationId = verificationRows[0]?.id;
    if (!verificationId) throw new Error('Falha ao criar verificação.');

    // ── 4. Calcular trust score ────────────────────────────────────
    const scoreResult = await calculateTrustScore({
      email: data.email,
      phone: data.phone,
      username: data.username,
      cpf: data.cpf,
      birth_date: data.birth_date,
    });

    // ── 5. Salvar sinais ───────────────────────────────────────────
    for (const signal of scoreResult.signals) {
      await query(
        `INSERT INTO signals (
          verification_id, signal_type, signal_name,
          value, weight, score_contribution, source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [verificationId, signal.type, signal.name,
         JSON.stringify({ result: signal.value }),
         signal.weight, signal.score_contribution, signal.source]
      );
    }

    // ── 6. Salvar trust score ──────────────────────────────────────
    const trustScoreRows = await query<{ id: string }>(
      `INSERT INTO trust_scores (
        verification_id, total_score, identity_score, social_score,
        behavioral_score, consistency_score, explanation, level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        verificationId,
        scoreResult.total_score,
        scoreResult.identity_score,
        scoreResult.social_score,
        scoreResult.behavioral_score,
        scoreResult.consistency_score,
        JSON.stringify({
          ...scoreResult.explanation,
          ai_analysis: scoreResult.ai_analysis || null,
        }),
        scoreResult.level,
      ]
    );
    const trustScoreId = trustScoreRows[0]?.id;
    if (!trustScoreId) throw new Error('Falha ao salvar score.');

    // ── 7. Gerar relatório ─────────────────────────────────────────
    const reportRows = await query<{ id: string }>(
      `INSERT INTO reports (
        user_id, verification_id, trust_score_id,
        title, summary, shared_token, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '30 days') RETURNING id`,
      [
        userId, verificationId, trustScoreId,
        `Relatório de Confiança — ${new Date().toLocaleDateString('pt-BR')}`,
        scoreResult.explanation.summary,
        crypto.randomBytes(16).toString('hex'),
      ]
    );
    const reportId = reportRows[0]?.id;
    if (!reportId) throw new Error('Falha ao gerar relatório.');

    // ── 8. Marcar verificação como concluída ───────────────────────
    await query(
      `UPDATE verifications SET status = 'completed', completed_at = NOW() WHERE id = $1`,
      [verificationId]
    );

    await cache.setJSON(`score:${verificationId}`, scoreResult, 3600);

    // ── 9. Salvar histórico ────────────────────────────────────────
    const queryType = data.email ? 'email' : data.username ? 'username' : data.phone ? 'phone' : 'cpf';
    const queryValue = (data.email || data.username || data.phone || data.cpf || 'dados fornecidos').slice(0, 255);
    await saveToHistory({
      user_id: userId,
      query_type: queryType,
      query_value: queryValue,
      result_score: Math.round(scoreResult.total_score),
      result_level: scoreResult.level,
      report_id: reportId,
      ip: req.ip || undefined,
    });

    res.status(201).json({
      verification_id: verificationId,
      report_id: reportId,
      trust_score_id: trustScoreId,
      trust_score: {
        total: scoreResult.total_score,
        level: scoreResult.level,
        identity: scoreResult.identity_score,
        social: scoreResult.social_score,
        behavioral: scoreResult.behavioral_score,
        consistency: scoreResult.consistency_score,
      },
      explanation: scoreResult.explanation,
      ai_analysis: scoreResult.ai_analysis || null,
      credits_remaining: isUnlimited ? 999 : (userRow.credits - 1),
      created_at: new Date().toISOString(),
    });

  } catch (err: any) {
    // ── Cleanup: se a verificação foi criada mas algo falhou, marca como falha
    // e DEVOLVE o crédito para não prejudicar o usuário
    if (verificationId) {
      await query(
        `UPDATE verifications SET status = 'failed' WHERE id = $1`,
        [verificationId]
      ).catch(() => {});
      // Devolve o crédito (exceto para plano unlimited)
      await query(
        `UPDATE users SET credits = credits + 1
         WHERE id = $1 AND plan != 'enterprise' AND credits < 999`,
        [req.user!.id]
      ).catch(() => {});
    }

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0]?.message || 'Dados inválidos.' });
    }
    console.error('❌ POST /verify:', err.message);
    res.status(500).json({ error: err.message || 'Erro ao gerar relatório. Tente novamente.' });
  }
});

// POST /api/verify/signals/analyze — prévia SEM consumir crédito
verifyRouter.post('/signals/analyze', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = VerifySchema.parse(req.body);
    const scoreResult = await calculateTrustScore(data);

    res.json({
      preview: true,
      total_score: scoreResult.total_score,
      level: scoreResult.level,
      signals_found: scoreResult.signals.length,
      breakdown: scoreResult.explanation.breakdown,
      ai_analysis: scoreResult.ai_analysis || null,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0]?.message || 'Dados inválidos.' });
    }
    console.error('❌ POST /verify/signals/analyze:', err.message);
    res.status(500).json({ error: err.message });
  }
});
