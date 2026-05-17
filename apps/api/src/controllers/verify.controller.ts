import { Router, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { query, queryOne } from '../database/connection';
import { calculateTrustScore } from '../services/trust-score.service';
import { cache } from '../services/cache.service';

export const verifyRouter = Router();

const VerifySchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  username: z.string().min(2).optional(),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
}).refine(data => Object.values(data).some(Boolean), {
  message: 'At least one field must be provided',
});

// POST /api/verify
verifyRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = VerifySchema.parse(req.body);
    const userId = req.user!.id;

    // Hash CPF if provided (never store plain)
    const cpfHash = data.cpf
      ? crypto.createHash('sha256').update(data.cpf).digest('hex')
      : undefined;

    // Create verification record
    const [verification] = await query(
      `INSERT INTO verifications 
        (user_id, subject_email, subject_phone, subject_username, subject_cpf_hash, subject_birth_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'processing')
       RETURNING *`,
      [userId, data.email, data.phone, data.username, cpfHash, data.birth_date]
    );

    // Calculate trust score
    const scoreResult = calculateTrustScore({
      email: data.email,
      phone: data.phone,
      username: data.username,
      cpf: data.cpf,
      birth_date: data.birth_date,
    });

    // Store signals
    for (const signal of scoreResult.signals) {
      await query(
        `INSERT INTO signals (verification_id, signal_type, signal_name, value, weight, score_contribution, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          verification.id,
          signal.type,
          signal.name,
          JSON.stringify({ result: signal.value }),
          signal.weight,
          signal.score_contribution,
          signal.source,
        ]
      );
    }

    // Store trust score
    const [trustScore] = await query(
      `INSERT INTO trust_scores 
        (verification_id, total_score, identity_score, social_score, behavioral_score, consistency_score, explanation, level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        verification.id,
        scoreResult.total_score,
        scoreResult.identity_score,
        scoreResult.social_score,
        scoreResult.behavioral_score,
        scoreResult.consistency_score,
        JSON.stringify(scoreResult.explanation),
        scoreResult.level,
      ]
    );

    // Generate report
    const [report] = await query(
      `INSERT INTO reports (user_id, verification_id, trust_score_id, title, summary, shared_token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '30 days')
       RETURNING *`,
      [
        userId,
        verification.id,
        trustScore.id,
        `Relatório de Confiança - ${new Date().toLocaleDateString('pt-BR')}`,
        scoreResult.explanation.summary,
        crypto.randomBytes(16).toString('hex'),
      ]
    );

    // Update verification status
    await query(
      `UPDATE verifications SET status = 'completed', completed_at = NOW() WHERE id = $1`,
      [verification.id]
    );

    // Cache result
    await cache.setJSON(`score:${verification.id}`, scoreResult, 3600);

    res.status(201).json({
      verification_id: verification.id,
      report_id: report.id,
      trust_score: {
        total: scoreResult.total_score,
        level: scoreResult.level,
        identity: scoreResult.identity_score,
        social: scoreResult.social_score,
        behavioral: scoreResult.behavioral_score,
        consistency: scoreResult.consistency_score,
      },
      explanation: scoreResult.explanation,
      created_at: verification.created_at,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/signals/analyze
verifyRouter.post('/signals/analyze', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = VerifySchema.parse(req.body);
    const scoreResult = calculateTrustScore(data);

    res.json({
      preview: true,
      total_score: scoreResult.total_score,
      level: scoreResult.level,
      signals_found: scoreResult.signals.length,
      breakdown: scoreResult.explanation.breakdown,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});
