-- ══════════════════════════════════════════════════════════
--   VETRA — Schema Completo v2
--   Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  plan          VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
  credits       INTEGER DEFAULT 1,
  email_verified BOOLEAN DEFAULT false,
  last_login_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── SUBSCRIPTIONS (Stripe) ───────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id    VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id       VARCHAR(255),
  status                VARCHAR(50) DEFAULT 'inactive'
    CHECK (status IN ('active','inactive','canceled','past_due','trialing')),
  plan                  VARCHAR(20) DEFAULT 'free'
    CHECK (plan IN ('free','premium','enterprise')),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ── SEARCH HISTORY ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_history (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query_type     VARCHAR(50) NOT NULL,
  query_value    VARCHAR(255) NOT NULL,
  result_score   INTEGER,
  result_level   VARCHAR(20),
  report_id      UUID,
  ip_hash        VARCHAR(64),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);

-- ── AUDIT LOGS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  resource    VARCHAR(100),
  resource_id VARCHAR(255),
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(500),
  status      VARCHAR(20) DEFAULT 'success',
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ── VERIFICATIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_email     VARCHAR(255),
  subject_phone     VARCHAR(50),
  subject_username  VARCHAR(100),
  subject_cpf_hash  VARCHAR(255),
  subject_birth_date DATE,
  status            VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);

-- ── SIGNALS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS signals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id   UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  signal_type       VARCHAR(50) NOT NULL,
  signal_name       VARCHAR(100) NOT NULL,
  value             JSONB NOT NULL,
  weight            DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  score_contribution DECIMAL(5,2),
  source            VARCHAR(100) NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_signals_verification_id ON signals(verification_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(signal_type);

-- ── TRUST SCORES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trust_scores (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id     UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  total_score         DECIMAL(5,2) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  identity_score      DECIMAL(5,2) DEFAULT 0,
  social_score        DECIMAL(5,2) DEFAULT 0,
  behavioral_score    DECIMAL(5,2) DEFAULT 0,
  consistency_score   DECIMAL(5,2) DEFAULT 0,
  explanation         JSONB NOT NULL DEFAULT '{}',
  level               VARCHAR(20) NOT NULL
    CHECK (level IN ('very_low','low','medium','high','very_high')),
  calculated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trust_scores_verification_id ON trust_scores(verification_id);

-- ── REPORTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_id  UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  trust_score_id   UUID NOT NULL REFERENCES trust_scores(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  summary          TEXT,
  is_premium       BOOLEAN DEFAULT false,
  shared_token     VARCHAR(100) UNIQUE,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_verification_id ON reports(verification_id);
CREATE INDEX IF NOT EXISTS idx_reports_shared_token ON reports(shared_token);

-- ── RATE LIMIT TRACKING ──────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_hash    VARCHAR(64) NOT NULL,
  endpoint   VARCHAR(100) NOT NULL,
  hit_count  INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON rate_limit_log(ip_hash, endpoint);

-- ── TRIGGERS ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── SEED ─────────────────────────────────────────────────
-- Senha: vetra2024 (bcrypt $2b$12$)
INSERT INTO users (email, password_hash, full_name, plan, credits, email_verified)
VALUES (
  'demo@vetra.io',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJf85znAAaHnEbILNq.P1Wqq',
  'Demo Vetra',
  'premium',
  10,
  true
)
ON CONFLICT (email) DO UPDATE SET
  plan = 'premium',
  credits = 10,
  email_verified = true;
