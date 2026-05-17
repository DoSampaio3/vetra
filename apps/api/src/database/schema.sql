-- VETRA DATABASE SCHEMA

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- VERIFICATIONS
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_email VARCHAR(255),
  subject_phone VARCHAR(50),
  subject_username VARCHAR(100),
  subject_cpf_hash VARCHAR(255), -- stored as hash only, never plain
  subject_birth_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_status ON verifications(status);

-- SIGNALS
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  signal_type VARCHAR(50) NOT NULL,
  signal_name VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  weight DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  score_contribution DECIMAL(5,2),
  source VARCHAR(100) NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signals_verification_id ON signals(verification_id);
CREATE INDEX idx_signals_type ON signals(signal_type);

-- TRUST SCORES
CREATE TABLE IF NOT EXISTS trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  total_score DECIMAL(5,2) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  identity_score DECIMAL(5,2) DEFAULT 0,
  social_score DECIMAL(5,2) DEFAULT 0,
  behavioral_score DECIMAL(5,2) DEFAULT 0,
  consistency_score DECIMAL(5,2) DEFAULT 0,
  explanation JSONB NOT NULL DEFAULT '{}',
  level VARCHAR(20) NOT NULL CHECK (level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trust_scores_verification_id ON trust_scores(verification_id);
CREATE INDEX idx_trust_scores_level ON trust_scores(level);

-- REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  trust_score_id UUID NOT NULL REFERENCES trust_scores(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  is_premium BOOLEAN DEFAULT false,
  shared_token VARCHAR(100) UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_verification_id ON reports(verification_id);
CREATE INDEX idx_reports_shared_token ON reports(shared_token);

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed demo user (password: demo1234)
INSERT INTO users (email, password_hash, full_name, plan)
VALUES ('demo@vetra.io', '$2b$10$rQZ9YT.9RZgGrHFNJNF6oeZQZ2wXRJKVxQJLQQJLQQJLQQJLQQJLQ', 'Demo User', 'premium')
ON CONFLICT (email) DO NOTHING;
