-- ══════════════════════════════════════════════════════════════════════
--   VETRA — Scripts Completos para Supabase
--   Como usar: Supabase Dashboard → SQL Editor → Cole e execute
--   Execute na ordem: 1 → 2 → 3 → 4 → 5
-- ══════════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════════════════
-- SCRIPT 1 — EXTENSÕES E LIMPEZA
-- ══════════════════════════════════════════════════════════════════════

-- Ativa extensão de UUID (necessária para uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Se quiser resetar tudo do zero, descomente as linhas abaixo:
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS rate_limit_log CASCADE;
-- DROP TABLE IF EXISTS search_history CASCADE;
-- DROP TABLE IF EXISTS signals CASCADE;
-- DROP TABLE IF EXISTS reports CASCADE;
-- DROP TABLE IF EXISTS trust_scores CASCADE;
-- DROP TABLE IF EXISTS verifications CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at CASCADE;


-- ══════════════════════════════════════════════════════════════════════
-- SCRIPT 2 — TABELAS PRINCIPAIS
-- ══════════════════════════════════════════════════════════════════════

-- ── USERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  full_name      VARCHAR(255) NOT NULL,
  plan           VARCHAR(20)  NOT NULL DEFAULT 'free'
                 CHECK (plan IN ('free', 'premium', 'enterprise')),
  credits        INTEGER      NOT NULL DEFAULT 1,
  email_verified BOOLEAN      NOT NULL DEFAULT false,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan  ON users(plan);

-- ── SUBSCRIPTIONS (Stripe) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id     VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id        VARCHAR(255),
  status                 VARCHAR(50)  NOT NULL DEFAULT 'inactive'
                         CHECK (status IN ('active','inactive','canceled','past_due','trialing')),
  plan                   VARCHAR(20)  NOT NULL DEFAULT 'free'
                         CHECK (plan IN ('free','premium','enterprise')),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN      NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id        ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status          ON subscriptions(status);

-- ── VERIFICATIONS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verifications (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_email      VARCHAR(255),
  subject_phone      VARCHAR(50),
  subject_username   VARCHAR(100),
  subject_cpf_hash   VARCHAR(255),  -- SHA-256 do CPF — nunca o CPF puro
  subject_birth_date DATE,
  status             VARCHAR(20)  NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','completed','failed')),
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status  ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_created ON verifications(created_at DESC);

-- ── SIGNALS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS signals (
  id                 UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id    UUID         NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  signal_type        VARCHAR(50)  NOT NULL,
  signal_name        VARCHAR(100) NOT NULL,
  value              JSONB        NOT NULL,
  weight             DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  score_contribution DECIMAL(5,2),
  source             VARCHAR(100) NOT NULL,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_verification_id ON signals(verification_id);
CREATE INDEX IF NOT EXISTS idx_signals_type            ON signals(signal_type);

-- ── TRUST SCORES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trust_scores (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id   UUID         NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  total_score       DECIMAL(5,2) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  identity_score    DECIMAL(5,2) NOT NULL DEFAULT 0,
  social_score      DECIMAL(5,2) NOT NULL DEFAULT 0,
  behavioral_score  DECIMAL(5,2) NOT NULL DEFAULT 0,
  consistency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  explanation       JSONB        NOT NULL DEFAULT '{}',
  level             VARCHAR(20)  NOT NULL
                    CHECK (level IN ('very_low','low','medium','high','very_high')),
  calculated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_scores_verification_id ON trust_scores(verification_id);
CREATE INDEX IF NOT EXISTS idx_trust_scores_level           ON trust_scores(level);

-- ── REPORTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_id UUID         NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  trust_score_id  UUID         NOT NULL REFERENCES trust_scores(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  summary         TEXT,
  is_premium      BOOLEAN      NOT NULL DEFAULT false,
  shared_token    VARCHAR(100) UNIQUE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id         ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_verification_id ON reports(verification_id);
CREATE INDEX IF NOT EXISTS idx_reports_shared_token    ON reports(shared_token);
CREATE INDEX IF NOT EXISTS idx_reports_created         ON reports(created_at DESC);

-- ── SEARCH HISTORY ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_history (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query_type   VARCHAR(50)  NOT NULL,   -- 'email', 'username', 'phone', 'cpf'
  query_value  VARCHAR(255) NOT NULL,
  result_score INTEGER,
  result_level VARCHAR(20),
  report_id    UUID,                    -- referência opcional ao relatório gerado
  ip_hash      VARCHAR(64),             -- SHA-256 do IP — nunca IP puro
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);

-- ── AUDIT LOGS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  resource    VARCHAR(100),
  resource_id VARCHAR(255),
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(500),
  status      VARCHAR(20)  NOT NULL DEFAULT 'success',
  metadata    JSONB        NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action  ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ── RATE LIMIT LOG ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_hash      VARCHAR(64)  NOT NULL,
  endpoint     VARCHAR(100) NOT NULL,
  hit_count    INTEGER      NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON rate_limit_log(ip_hash, endpoint);


-- ══════════════════════════════════════════════════════════════════════
-- SCRIPT 3 — FUNÇÕES E TRIGGERS
-- ══════════════════════════════════════════════════════════════════════

-- Função: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: users
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: subscriptions
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função: retorna resumo de um usuário (útil para dashboard)
CREATE OR REPLACE FUNCTION get_user_summary(p_user_id UUID)
RETURNS TABLE (
  total_verifications BIGINT,
  total_reports       BIGINT,
  avg_score           NUMERIC,
  last_verification   TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT v.id)::BIGINT           AS total_verifications,
    COUNT(DISTINCT r.id)::BIGINT           AS total_reports,
    ROUND(AVG(ts.total_score), 1)          AS avg_score,
    MAX(v.created_at)                      AS last_verification
  FROM users u
  LEFT JOIN verifications v  ON v.user_id = u.id
  LEFT JOIN trust_scores ts  ON ts.verification_id = v.id
  LEFT JOIN reports r        ON r.user_id = u.id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Função: limpa audit_logs antigos (manter apenas 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM rate_limit_log WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Função: sincroniza plano do usuário com subscription ativa
CREATE OR REPLACE FUNCTION sync_user_plan(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_plan VARCHAR(20);
  v_credits INTEGER;
BEGIN
  SELECT plan INTO v_plan
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;

  v_credits := CASE v_plan
    WHEN 'premium'    THEN 10
    WHEN 'enterprise' THEN 999
    ELSE 1
  END;

  UPDATE users
  SET plan = v_plan, credits = v_credits
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- ══════════════════════════════════════════════════════════════════════
-- SCRIPT 4 — ROW LEVEL SECURITY (RLS)
-- Garante que usuários só acessam seus próprios dados
-- ══════════════════════════════════════════════════════════════════════

-- Ativa RLS nas tabelas sensíveis
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs      ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário só vê seus próprios dados
-- (A API usa service role que bypassa RLS — essas policies protegem acesso direto)

DROP POLICY IF EXISTS users_own ON users;
CREATE POLICY users_own ON users
  FOR ALL USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS subscriptions_own ON subscriptions;
CREATE POLICY subscriptions_own ON subscriptions
  FOR ALL USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS verifications_own ON verifications;
CREATE POLICY verifications_own ON verifications
  FOR ALL USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS reports_own ON reports;
CREATE POLICY reports_own ON reports
  FOR ALL USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS search_history_own ON search_history;
CREATE POLICY search_history_own ON search_history
  FOR ALL USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS audit_logs_own ON audit_logs;
CREATE POLICY audit_logs_own ON audit_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Sinais: acesso via verification do próprio usuário
DROP POLICY IF EXISTS signals_own ON signals;
CREATE POLICY signals_own ON signals
  FOR ALL USING (
    verification_id IN (
      SELECT id FROM verifications WHERE user_id::text = auth.uid()::text
    )
  );

-- Trust scores: acesso via verification do próprio usuário
DROP POLICY IF EXISTS trust_scores_own ON trust_scores;
CREATE POLICY trust_scores_own ON trust_scores
  FOR ALL USING (
    verification_id IN (
      SELECT id FROM verifications WHERE user_id::text = auth.uid()::text
    )
  );


-- ══════════════════════════════════════════════════════════════════════
-- SCRIPT 5 — DADOS INICIAIS (SEED)
-- ══════════════════════════════════════════════════════════════════════

-- Usuário demo para testes
-- Email: demo@vetra.io
-- Senha: vetra2024
INSERT INTO users (
  email, password_hash, full_name, plan, credits, email_verified
) VALUES (
  'demo@vetra.io',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJf85znAAaHnEbILNq.P1Wqq',
  'Demo Vetra',
  'premium',
  10,
  true
)
ON CONFLICT (email) DO UPDATE SET
  plan           = EXCLUDED.plan,
  credits        = EXCLUDED.credits,
  email_verified = EXCLUDED.email_verified,
  updated_at     = NOW();


-- ══════════════════════════════════════════════════════════════════════
-- QUERIES ÚTEIS PARA MONITORAMENTO
-- ══════════════════════════════════════════════════════════════════════

-- Ver todos os usuários e seus planos:
-- SELECT id, email, full_name, plan, credits, created_at FROM users ORDER BY created_at DESC;

-- Ver subscriptions ativas:
-- SELECT s.*, u.email FROM subscriptions s JOIN users u ON u.id = s.user_id WHERE s.status = 'active';

-- Ver últimas verificações:
-- SELECT v.*, u.email FROM verifications v JOIN users u ON u.id = v.user_id ORDER BY v.created_at DESC LIMIT 20;

-- Ver histórico de buscas:
-- SELECT sh.*, u.email FROM search_history sh JOIN users u ON u.id = sh.user_id ORDER BY sh.created_at DESC LIMIT 20;

-- Ver audit logs de login:
-- SELECT * FROM audit_logs WHERE action = 'user.login' ORDER BY created_at DESC LIMIT 20;

-- Resumo de um usuário específico (substitua o UUID):
-- SELECT * FROM get_user_summary('UUID-DO-USUARIO-AQUI');

-- Ver relatórios com scores:
-- SELECT r.title, ts.total_score, ts.level, r.created_at, u.email
-- FROM reports r
-- JOIN trust_scores ts ON ts.id = r.trust_score_id
-- JOIN users u ON u.id = r.user_id
-- ORDER BY r.created_at DESC LIMIT 20;

-- Limpar dados antigos manualmente:
-- SELECT cleanup_old_audit_logs();

-- Sincronizar plano de um usuário com a subscription:
-- SELECT sync_user_plan('UUID-DO-USUARIO-AQUI');
