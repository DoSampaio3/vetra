import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';
import { query, queryOne } from '../database/connection';

export const reportsRouter = Router();

// GET /api/reports
reportsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await query(
      `SELECT r.id, r.title, r.summary, r.is_premium, r.created_at,
              ts.total_score, ts.level,
              v.subject_email, v.subject_phone, v.subject_username
       FROM reports r
       JOIN trust_scores ts ON ts.id = r.trust_score_id
       JOIN verifications v ON v.id = r.verification_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user!.id]
    );
    res.json({ reports });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/shared/:token — público
reportsRouter.get('/shared/:token', async (req: Request, res: Response) => {
  try {
    const report = await queryOne(
      `SELECT r.title, r.summary, r.created_at,
              ts.total_score, ts.level, ts.explanation
       FROM reports r
       JOIN trust_scores ts ON ts.id = r.trust_score_id
       WHERE r.shared_token = $1
         AND (r.expires_at IS NULL OR r.expires_at > NOW())`,
      [req.params.token]
    );
    if (!report) return res.status(404).json({ error: 'Relatório não encontrado ou expirado.' });
    res.json({ report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:id
reportsRouter.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await queryOne(
      `SELECT r.*,
              ts.total_score, ts.identity_score, ts.social_score,
              ts.behavioral_score, ts.consistency_score, ts.level, ts.explanation,
              v.subject_email, v.subject_phone, v.subject_username,
              v.created_at as verification_date
       FROM reports r
       JOIN trust_scores ts ON ts.id = r.trust_score_id
       JOIN verifications v ON v.id = r.verification_id
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user!.id]
    );

    if (!report) return res.status(404).json({ error: 'Relatório não encontrado.' });

    const signals = await query(
      `SELECT signal_type, signal_name, value, weight, score_contribution, source, created_at
       FROM signals WHERE verification_id = $1 ORDER BY weight DESC`,
      [(report as any).verification_id]
    );

    res.json({ report, signals });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:id/pdf — download HTML para impressão como PDF
reportsRouter.get('/:id/pdf', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await queryOne(
      `SELECT r.*, ts.total_score, ts.identity_score, ts.social_score,
              ts.behavioral_score, ts.consistency_score, ts.level, ts.explanation,
              v.subject_email, v.subject_phone, v.subject_username, v.created_at as verification_date
       FROM reports r
       JOIN trust_scores ts ON ts.id = r.trust_score_id
       JOIN verifications v ON v.id = r.verification_id
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user!.id]
    ) as any;

    if (!report) return res.status(404).json({ error: 'Relatório não encontrado.' });

    const signals = await query(
      `SELECT signal_type, signal_name, value, weight, score_contribution, source
       FROM signals WHERE verification_id = $1 ORDER BY weight DESC`,
      [report.verification_id]
    );

    const html = generatePDFHTML({
      report_id: report.id,
      title: report.title,
      created_at: report.verification_date || report.created_at,
      subject_email: report.subject_email,
      subject_phone: report.subject_phone,
      subject_username: report.subject_username,
      total_score: Math.round(report.total_score),
      level: report.level,
      identity_score: Math.round(report.identity_score),
      social_score: Math.round(report.social_score),
      behavioral_score: Math.round(report.behavioral_score),
      consistency_score: Math.round(report.consistency_score),
      explanation: report.explanation,
      signals,
    });

    // Marca como gerado
    await query('UPDATE reports SET pdf_generated = true WHERE id = $1', [report.id]);

    const filename = `vetra-report-${report.id.slice(0, 8)}.html`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(html);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

