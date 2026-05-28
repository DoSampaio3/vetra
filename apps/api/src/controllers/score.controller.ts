import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { query, queryOne } from '../database/connection';
import { calculateTrustScore } from '../services/trust-score.service';
import { cache } from '../services/cache.service';

export const scoreRouter = Router();

// POST /api/score/calculate
scoreRouter.post('/calculate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { verification_id } = req.body;
    if (!verification_id) {
      return res.status(400).json({ error: 'verification_id is required' });
    }

    const verification = await queryOne(
      'SELECT * FROM verifications WHERE id = $1 AND user_id = $2',
      [verification_id, req.user!.id]
    );

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    const cached = await cache.getJSON(`score:${verification_id}`);
    if (cached) {
      return res.json({ cached: true, result: cached });
    }

    const scoreResult = calculateTrustScore({
      email: verification.subject_email,
      phone: verification.subject_phone,
      username: verification.subject_username,
      birth_date: verification.subject_birth_date,
    });

    await cache.setJSON(`score:${verification_id}`, scoreResult, 3600);

    res.json({ cached: false, result: scoreResult });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/score/user/:id
scoreRouter.get('/user/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Only own scores unless it's a shared report lookup
    if (id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const scores = await query(
      `SELECT 
        ts.id,
        ts.total_score,
        ts.identity_score,
        ts.social_score,
        ts.behavioral_score,
        ts.consistency_score,
        ts.level,
        ts.calculated_at,
        v.subject_email,
        v.subject_phone,
        v.subject_username,
        r.id as report_id,
        r.title as report_title
       FROM trust_scores ts
       JOIN verifications v ON v.id = ts.verification_id
       LEFT JOIN reports r ON r.verification_id = v.id
       WHERE v.user_id = $1
       ORDER BY ts.calculated_at DESC
       LIMIT 20`,
      [id]
    );

    const total = scores.length;
    const avg = total > 0
      ? Math.round(scores.reduce((sum: number, s: any) => sum + parseFloat(s.total_score), 0) / total)
      : 0;

    res.json({
      user_id: id,
      total_verifications: total,
      average_score: avg,
      scores,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
