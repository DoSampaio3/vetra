import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ── Rate limiting por IP (em memória — use Redis em produção) ──
const ipHitMap = new Map<string, { count: number; resetAt: number }>();

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').slice(0, 16);
}

export function rateLimiter(
  maxRequests: number,
  windowMs: number,
  message = 'Muitas tentativas. Aguarde antes de tentar novamente.'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${hashIP(ip)}:${req.path}`;
    const now = Date.now();

    const hit = ipHitMap.get(key);
    if (!hit || now > hit.resetAt) {
      ipHitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    hit.count++;
    if (hit.count > maxRequests) {
      const retryAfter = Math.ceil((hit.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: message,
        retry_after_seconds: retryAfter,
      });
    }
    next();
  };
}

// ── Security headers (OWASP) ──────────────────────────────
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
  );
  res.removeHeader('X-Powered-By');
  next();
}

// ── Sanitiza inputs (XSS básico) ─────────────────────────
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim()
      .slice(0, 10000);
  }
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const clean: any = {};
    for (const [k, v] of Object.entries(obj)) {
      clean[k.slice(0, 100)] = sanitizeObject(v);
    }
    return clean;
  }
  return obj;
}

// ── Audit log helper ──────────────────────────────────────
export function auditLog(action: string, resource?: string) {
  return async (req: any, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const status = res.statusCode < 400 ? 'success' : 'failure';
      // Fire and forget — não bloqueia a resposta
      try {
        const { query } = require('../database/connection');
        query(
          `INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, user_agent, status, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.user?.id || null,
            action,
            resource || null,
            req.params?.id || null,
            req.ip?.slice(0, 45) || null,
            req.headers['user-agent']?.slice(0, 500) || null,
            status,
            JSON.stringify({ method: req.method, path: req.path, status: res.statusCode }),
          ]
        ).catch(() => {}); // Silencia erro de log
      } catch {}
      return originalJson(body);
    };
    next();
  };
}
