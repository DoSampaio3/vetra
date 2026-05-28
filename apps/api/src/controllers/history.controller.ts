import { Router, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';
import { query, queryOne } from '../database/connection';
import { cache } from '../services/cache.service';

export const historyRouter = Router();

// GET /api/history — lista histórico paginado
historyRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const cacheKey = `history:${userId}:${page}:${limit}`;
    const cached = await cache.getJSON(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const [countRow] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM search_history WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countRow?.count || '0');

    const rows = await query(
      `SELECT
         sh.id, sh.query_type, sh.query_value, sh.result_score,
         sh.result_level, sh.created_at, sh.report_id,
         r.title as report_title
       FROM search_history sh
       LEFT JOIN reports r ON r.id = sh.report_id
       WHERE sh.user_id = $1
       ORDER BY sh.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const result = {
      history: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        has_next: offset + limit < total,
        has_prev: page > 1,
      },
    };

    await cache.setJSON(cacheKey, result, 60); // cache 1 min
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/history/:id — apaga item do histórico
historyRouter.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await query(
      'DELETE FROM search_history WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Função utilitária: salva no histórico
export async function saveToHistory(params: {
  user_id: string;
  query_type: string;
  query_value: string;
  result_score?: number;
  result_level?: string;
  report_id?: string;
  ip?: string;
}) {
  try {
    const ip_hash = params.ip
      ? require('crypto').createHash('sha256').update(params.ip).digest('hex').slice(0, 16)
      : null;

    await query(
      `INSERT INTO search_history
         (user_id, query_type, query_value, result_score, result_level, report_id, ip_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        params.user_id,
        params.query_type,
        params.query_value.slice(0, 255),
        params.result_score ?? null,
        params.result_level ?? null,
        params.report_id ?? null,
        ip_hash,
      ]
    );

    // Invalida cache do histórico do usuário
    for (let p = 1; p <= 3; p++) {
      await cache.del(`history:${params.user_id}:${p}:10`);
    }
  } catch (err: any) {
    console.error('[saveToHistory]', err.message);
  }
}
