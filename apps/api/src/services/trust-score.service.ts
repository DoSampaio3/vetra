import crypto from 'crypto';

export interface SignalInput {
  type: 'identity' | 'social' | 'behavioral' | 'consistency';
  name: string;
  value: any;
  source: string;
}

export interface ScoreResult {
  total_score: number;
  identity_score: number;
  social_score: number;
  behavioral_score: number;
  consistency_score: number;
  level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  explanation: {
    summary: string;
    factors: Array<{
      name: string;
      contribution: number;
      description: string;
      positive: boolean;
    }>;
    breakdown: {
      identity: { score: number; weight: number; signals: string[] };
      social: { score: number; weight: number; signals: string[] };
      behavioral: { score: number; weight: number; signals: string[] };
      consistency: { score: number; weight: number; signals: string[] };
    };
  };
  signals: Array<SignalInput & { weight: number; score_contribution: number }>;
}

// Signal weights by type
const SIGNAL_WEIGHTS = {
  identity: {
    email_format_valid: 8,
    email_domain_reputable: 6,
    phone_valid_format: 7,
    phone_country_match: 5,
    cpf_format_valid: 9,
    birth_date_consistent: 6,
    name_consistency: 7,
  },
  social: {
    username_exists: 8,
    username_age_old: 7,
    username_has_posts: 5,
    username_follower_ratio: 6,
    username_verified: 10,
    username_bio_complete: 4,
    email_social_match: 6,
  },
  behavioral: {
    data_consistency: 8,
    multiple_signals_match: 9,
    no_suspicious_patterns: 7,
    request_normal_hours: 4,
    data_completeness: 6,
  },
  consistency: {
    cross_signal_match: 10,
    temporal_consistency: 7,
    geographic_consistency: 6,
    format_consistency: 5,
  },
};

// Category weights for final score
const CATEGORY_WEIGHTS = {
  identity: 0.35,
  social: 0.25,
  behavioral: 0.20,
  consistency: 0.20,
};

function getReputableEmailDomains(): string[] {
  return ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'protonmail.com', 'me.com', 'live.com', 'uol.com.br', 'bol.com.br',
    'terra.com.br', 'ig.com.br', 'globo.com'];
}

function analyzeEmail(email?: string): SignalInput[] {
  if (!email) return [];
  const signals: SignalInput[] = [];

  // Valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  signals.push({
    type: 'identity',
    name: 'email_format_valid',
    value: emailRegex.test(email),
    source: 'format_validation',
  });

  // Domain reputation
  const domain = email.split('@')[1]?.toLowerCase() || '';
  signals.push({
    type: 'identity',
    name: 'email_domain_reputable',
    value: getReputableEmailDomains().includes(domain),
    source: 'domain_list',
  });

  return signals;
}

function analyzePhone(phone?: string): SignalInput[] {
  if (!phone) return [];
  const signals: SignalInput[] = [];

  const cleaned = phone.replace(/\D/g, '');
  const validBR = cleaned.length >= 10 && cleaned.length <= 11;

  signals.push({
    type: 'identity',
    name: 'phone_valid_format',
    value: validBR,
    source: 'format_validation',
  });

  // Brazilian country code presence
  signals.push({
    type: 'identity',
    name: 'phone_country_match',
    value: cleaned.startsWith('55') || cleaned.length === 11,
    source: 'country_validation',
  });

  return signals;
}

function analyzeCPF(cpf?: string): SignalInput[] {
  if (!cpf) return [];

  // MOCK ONLY - no real validation against government databases
  const cleaned = cpf.replace(/\D/g, '');
  const validFormat = cleaned.length === 11 && !/^(\d)\1+$/.test(cleaned);

  return [{
    type: 'identity',
    name: 'cpf_format_valid',
    value: validFormat,
    source: 'mock_format_validation',
  }];
}

function analyzeUsername(username?: string): SignalInput[] {
  if (!username) return [];
  const signals: SignalInput[] = [];

  const cleaned = username.replace('@', '').toLowerCase();

  // Basic existence heuristic (mock - no real API call)
  const hasValidFormat = /^[a-z0-9._]{3,30}$/.test(cleaned);
  signals.push({
    type: 'social',
    name: 'username_exists',
    value: hasValidFormat,
    source: 'mock_social_check',
  });

  // Length suggests established account
  signals.push({
    type: 'social',
    name: 'username_has_posts',
    value: cleaned.length > 4,
    source: 'mock_social_check',
  });

  // Bio completeness heuristic
  signals.push({
    type: 'social',
    name: 'username_bio_complete',
    value: !cleaned.includes('user') && !cleaned.includes('1234'),
    source: 'mock_social_check',
  });

  return signals;
}

function analyzeConsistency(data: {
  email?: string;
  phone?: string;
  username?: string;
  cpf?: string;
  birth_date?: string;
}): SignalInput[] {
  const signals: SignalInput[] = [];
  const providedFields = Object.values(data).filter(Boolean).length;

  // More data = more consistency possible
  signals.push({
    type: 'behavioral',
    name: 'data_completeness',
    value: providedFields >= 3,
    source: 'completeness_check',
  });

  signals.push({
    type: 'behavioral',
    name: 'multiple_signals_match',
    value: providedFields >= 2,
    source: 'cross_validation',
  });

  // No suspicious patterns
  const suspiciousPatterns = ['test', 'fake', 'null', 'undefined', '000'];
  const hasSuspicious = Object.values(data).some(v =>
    v && suspiciousPatterns.some(p => v.toLowerCase().includes(p))
  );
  signals.push({
    type: 'behavioral',
    name: 'no_suspicious_patterns',
    value: !hasSuspicious,
    source: 'pattern_analysis',
  });

  // Cross-signal consistency
  signals.push({
    type: 'consistency',
    name: 'cross_signal_match',
    value: providedFields >= 3,
    source: 'cross_validation',
  });

  signals.push({
    type: 'consistency',
    name: 'format_consistency',
    value: !hasSuspicious,
    source: 'format_validation',
  });

  return signals;
}

function calculateCategoryScore(
  signals: SignalInput[],
  category: 'identity' | 'social' | 'behavioral' | 'consistency'
): { score: number; signalNames: string[] } {
  const categorySignals = signals.filter(s => s.type === category);
  if (categorySignals.length === 0) return { score: 0, signalNames: [] };

  const weights = SIGNAL_WEIGHTS[category] as Record<string, number>;
  let totalWeight = 0;
  let weightedScore = 0;
  const signalNames: string[] = [];

  for (const signal of categorySignals) {
    const weight = weights[signal.name] || 5;
    totalWeight += weight;

    if (signal.value === true) {
      weightedScore += weight * 100;
      signalNames.push(`✓ ${signal.name.replace(/_/g, ' ')}`);
    } else if (signal.value === false) {
      signalNames.push(`✗ ${signal.name.replace(/_/g, ' ')}`);
    }
  }

  return {
    score: totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0,
    signalNames,
  };
}

function getLevel(score: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
  if (score < 20) return 'very_low';
  if (score < 40) return 'low';
  if (score < 60) return 'medium';
  if (score < 80) return 'high';
  return 'very_high';
}

function generateSummary(score: number, level: string): string {
  const summaries: Record<string, string> = {
    very_low: 'Sinais digitais muito limitados. Poucas informações verificáveis foram encontradas.',
    low: 'Presença digital limitada. Alguns sinais básicos identificados mas insuficientes para alta confiança.',
    medium: 'Presença digital moderada. Sinais consistentes identificados com alguns pontos de atenção.',
    high: 'Presença digital sólida. Múltiplos sinais consistentes e verificáveis identificados.',
    very_high: 'Presença digital excelente. Alta consistência e múltiplos sinais positivos verificados.',
  };
  return summaries[level] || 'Análise concluída.';
}

export function calculateTrustScore(data: {
  email?: string;
  phone?: string;
  username?: string;
  cpf?: string;
  birth_date?: string;
}): ScoreResult {
  // Collect all signals
  const allSignals: SignalInput[] = [
    ...analyzeEmail(data.email),
    ...analyzePhone(data.phone),
    ...analyzeCPF(data.cpf),
    ...analyzeUsername(data.username),
    ...analyzeConsistency(data),
  ];

  // Calculate category scores
  const identityResult = calculateCategoryScore(allSignals, 'identity');
  const socialResult = calculateCategoryScore(allSignals, 'social');
  const behavioralResult = calculateCategoryScore(allSignals, 'behavioral');
  const consistencyResult = calculateCategoryScore(allSignals, 'consistency');

  // Weighted final score
  const total_score = Math.round(
    identityResult.score * CATEGORY_WEIGHTS.identity +
    socialResult.score * CATEGORY_WEIGHTS.social +
    behavioralResult.score * CATEGORY_WEIGHTS.behavioral +
    consistencyResult.score * CATEGORY_WEIGHTS.consistency
  );

  const level = getLevel(total_score);

  // Build enriched signals with weights
  const weights = { ...SIGNAL_WEIGHTS.identity, ...SIGNAL_WEIGHTS.social, ...SIGNAL_WEIGHTS.behavioral, ...SIGNAL_WEIGHTS.consistency };
  const enrichedSignals = allSignals.map(s => ({
    ...s,
    weight: (weights as Record<string, number>)[s.name] || 5,
    score_contribution: s.value === true ? (weights as Record<string, number>)[s.name] || 5 : 0,
  }));

  // Build explanation factors
  const factors = [];

  if (identityResult.score > 0) {
    factors.push({
      name: 'Verificação de Identidade',
      contribution: Math.round(identityResult.score * CATEGORY_WEIGHTS.identity),
      description: `Pontuação de identidade: ${identityResult.score}/100`,
      positive: identityResult.score >= 60,
    });
  }

  if (socialResult.score > 0) {
    factors.push({
      name: 'Presença Social',
      contribution: Math.round(socialResult.score * CATEGORY_WEIGHTS.social),
      description: `Pontuação social: ${socialResult.score}/100`,
      positive: socialResult.score >= 60,
    });
  }

  if (behavioralResult.score > 0) {
    factors.push({
      name: 'Padrões Comportamentais',
      contribution: Math.round(behavioralResult.score * CATEGORY_WEIGHTS.behavioral),
      description: `Pontuação comportamental: ${behavioralResult.score}/100`,
      positive: behavioralResult.score >= 60,
    });
  }

  if (consistencyResult.score > 0) {
    factors.push({
      name: 'Consistência de Dados',
      contribution: Math.round(consistencyResult.score * CATEGORY_WEIGHTS.consistency),
      description: `Pontuação de consistência: ${consistencyResult.score}/100`,
      positive: consistencyResult.score >= 60,
    });
  }

  return {
    total_score,
    identity_score: identityResult.score,
    social_score: socialResult.score,
    behavioral_score: behavioralResult.score,
    consistency_score: consistencyResult.score,
    level,
    explanation: {
      summary: generateSummary(total_score, level),
      factors,
      breakdown: {
        identity: {
          score: identityResult.score,
          weight: CATEGORY_WEIGHTS.identity,
          signals: identityResult.signalNames,
        },
        social: {
          score: socialResult.score,
          weight: CATEGORY_WEIGHTS.social,
          signals: socialResult.signalNames,
        },
        behavioral: {
          score: behavioralResult.score,
          weight: CATEGORY_WEIGHTS.behavioral,
          signals: behavioralResult.signalNames,
        },
        consistency: {
          score: consistencyResult.score,
          weight: CATEGORY_WEIGHTS.consistency,
          signals: consistencyResult.signalNames,
        },
      },
    },
    signals: enrichedSignals,
  };
}
