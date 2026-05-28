import crypto from 'crypto';
import { generateGeminiAnalysis, GeminiAnalysis } from './gemini.service';
import { analyzeInstagramProfile, InstagramAnalysis } from './instagram.service';
import { searchConsultaJuridica, ConsultaJuridicaAnalysis, datajudToSignals } from './datajud.service';

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
    instagram?: InstagramAnalysis;
    datajud?: ConsultaJuridicaAnalysis;
  };
  signals: Array<SignalInput & { weight: number; score_contribution: number }>;
  ai_analysis: GeminiAnalysis | null;
}

// Pesos dos sinais
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
    // Mock (quando não há username)
    username_exists: 4,
    username_has_posts: 3,
    username_bio_complete: 2,
    // Reais (quando Instagram é verificado via API)
    instagram_profile_exists: 10,
    instagram_is_public: 7,
    instagram_is_verified: 15,
    instagram_has_bio: 6,
    instagram_has_profile_pic: 6,
    instagram_has_posts: 8,
    instagram_good_follower_ratio: 9,
    instagram_enough_followers: 8,
    instagram_not_bot_pattern: 12,
    instagram_has_external_url: 5,
  },
  behavioral: {
    data_consistency: 8,
    multiple_signals_match: 9,
    no_suspicious_patterns: 7,
    data_completeness: 6,
  },
  consistency: {
    cross_signal_match: 10,
    temporal_consistency: 7,
    format_consistency: 5,
    datajud_no_records: 12,
    datajud_no_high_risk: 15,
    datajud_low_risk: 10,
    datajud_no_sensitive_subjects: 13,
  },
};

const CATEGORY_WEIGHTS = {
  identity: 0.35,
  social: 0.25,
  behavioral: 0.20,
  consistency: 0.20,
};

function getReputableEmailDomains(): string[] {
  return [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'protonmail.com', 'me.com', 'live.com', 'uol.com.br', 'bol.com.br',
    'terra.com.br', 'ig.com.br', 'globo.com',
  ];
}

function analyzeEmail(email?: string): SignalInput[] {
  if (!email) return [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return [
    {
      type: 'identity',
      name: 'email_format_valid',
      value: emailRegex.test(email),
      source: 'Verificação',
    },
    {
      type: 'identity',
      name: 'email_domain_reputable',
      value: getReputableEmailDomains().includes(domain),
      source: 'Verificação',
    },
  ];
}

function analyzePhone(phone?: string): SignalInput[] {
  if (!phone) return [];
  const cleaned = phone.replace(/\D/g, '');
  return [
    {
      type: 'identity',
      name: 'phone_valid_format',
      value: cleaned.length >= 10 && cleaned.length <= 11,
      source: 'Verificação',
    },
    {
      type: 'identity',
      name: 'phone_country_match',
      value: cleaned.startsWith('55') || cleaned.length === 11,
      source: 'Verificação',
    },
  ];
}

function analyzeCPF(cpf?: string): SignalInput[] {
  if (!cpf) return [];
  const cleaned = cpf.replace(/\D/g, '');
  return [{
    type: 'identity',
    name: 'cpf_format_valid',
    value: cleaned.length === 11 && !/^(\d)\1+$/.test(cleaned),
    source: 'Verificação',
  }];
}

// Converte sinais reais do Instagram em SignalInputs com pesos corretos
function buildInstagramSignals(igAnalysis: InstagramAnalysis): SignalInput[] {
  if (!igAnalysis.found) {
    return [{
      type: 'social',
      name: 'instagram_profile_exists',
      value: false,
      source: 'Instagram API',
    }];
  }

  const s = igAnalysis.signals;
  return [
    { type: 'social', name: 'instagram_profile_exists', value: s.profile_exists, source: 'Instagram API' },
    { type: 'social', name: 'instagram_is_public',      value: s.is_public,       source: 'Instagram API' },
    { type: 'social', name: 'instagram_is_verified',    value: s.is_verified,     source: 'Instagram API' },
    { type: 'social', name: 'instagram_has_bio',        value: s.has_bio,         source: 'Instagram API' },
    { type: 'social', name: 'instagram_has_profile_pic',value: s.has_profile_pic, source: 'Instagram API' },
    { type: 'social', name: 'instagram_has_posts',      value: s.has_posts,       source: 'Instagram API' },
    { type: 'social', name: 'instagram_good_follower_ratio', value: s.good_follower_ratio, source: 'Instagram API' },
    { type: 'social', name: 'instagram_enough_followers',    value: s.enough_followers,    source: 'Instagram API' },
    { type: 'social', name: 'instagram_not_bot_pattern',     value: s.not_bot_pattern,     source: 'Instagram API' },
    { type: 'social', name: 'instagram_has_external_url',    value: s.has_external_url,    source: 'Instagram API' },
  ];
}

// Sinais mock quando não há username (fallback)
function analyzeMockUsername(username?: string): SignalInput[] {
  if (!username) return [];
  const cleaned = username.replace('@', '').toLowerCase();
  return [
    {
      type: 'social',
      name: 'username_exists',
      value: /^[a-z0-9._]{3,30}$/.test(cleaned),
      source: 'Verificação',
    },
    {
      type: 'social',
      name: 'username_has_posts',
      value: cleaned.length > 4,
      source: 'Verificação',
    },
    {
      type: 'social',
      name: 'username_bio_complete',
      value: !cleaned.includes('user') && !cleaned.includes('1234'),
      source: 'Verificação',
    },
  ];
}

function analyzeConsistency(data: {
  email?: string;
  phone?: string;
  username?: string;
  cpf?: string;
  birth_date?: string;
}): SignalInput[] {
  const providedFields = Object.values(data).filter(Boolean).length;
  const suspiciousPatterns = ['test', 'fake', 'null', 'undefined', '000'];
  const hasSuspicious = Object.values(data).some(v =>
    v && suspiciousPatterns.some(p => v.toLowerCase().includes(p))
  );

  return [
    {
      type: 'behavioral',
      name: 'data_completeness',
      value: providedFields >= 3,
      source: 'Análise',
    },
    {
      type: 'behavioral',
      name: 'multiple_signals_match',
      value: providedFields >= 2,
      source: 'Análise',
    },
    {
      type: 'behavioral',
      name: 'no_suspicious_patterns',
      value: !hasSuspicious,
      source: 'Análise',
    },
    {
      type: 'consistency',
      name: 'cross_signal_match',
      value: providedFields >= 3,
      source: 'Análise',
    },
    {
      type: 'consistency',
      name: 'format_consistency',
      value: !hasSuspicious,
      source: 'Verificação',
    },
  ];
}


const SIGNAL_TRANSLATIONS: Record<string, string> = {
  email_format_valid:            'Formato de email válido',
  email_domain_reputable:        'Domínio de email reconhecido',
  phone_valid_format:            'Formato de telefone válido',
  phone_country_match:           'Telefone padrão brasileiro',
  cpf_format_valid:              'Formato de CPF válido',
  birth_date_consistent:         'Data de nascimento consistente',
  name_consistency:              'Consistência do nome',
  username_exists:               'Username com formato válido',
  username_has_posts:            'Username com histórico de posts',
  username_bio_complete:         'Bio do username preenchida',
  instagram_profile_exists:      'Perfil do Instagram encontrado',
  instagram_is_public:           'Perfil público no Instagram',
  instagram_is_verified:         'Conta verificada no Instagram',
  instagram_has_bio:             'Bio do Instagram preenchida',
  instagram_has_profile_pic:     'Foto de perfil presente',
  instagram_has_posts:           'Posts publicados no Instagram',
  instagram_good_follower_ratio: 'Proporção seguidores/seguindo saudável',
  instagram_enough_followers:    'Número de seguidores suficiente',
  instagram_not_bot_pattern:     'Ausência de padrão de bot',
  instagram_has_external_url:    'URL externa cadastrada',
  data_completeness:             'Completude dos dados fornecidos',
  multiple_signals_match:        'Múltiplos sinais consistentes',
  no_suspicious_patterns:        'Ausência de padrões suspeitos',
  request_normal_hours:          'Horário de acesso normal',
  data_consistency:              'Consistência geral dos dados',
  cross_signal_match:            'Cruzamento de sinais validado',
  temporal_consistency:          'Consistência temporal',
  geographic_consistency:        'Consistência geográfica',
  format_consistency:            'Consistência de formatos',
  datajud_no_records:            'Sem registros judiciais públicos',
  datajud_no_high_risk:          'Sem processos de alto risco',
  datajud_low_risk:              'Risco judicial baixo ou nulo',
  datajud_no_sensitive_subjects: 'Sem assuntos sensíveis detectados',
};

function translateSignal(name: string): string {
  return SIGNAL_TRANSLATIONS[name] || name.replace(/_/g, ' ');
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
      signalNames.push(`✓ ${translateSignal(signal.name)}`);
    } else {
      signalNames.push(`✗ ${translateSignal(signal.name)}`);
    }
  }

  return {
    score: totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0,
    signalNames,
  };
}

function getLevel(score: number): ScoreResult['level'] {
  if (score < 20) return 'very_low';
  if (score < 40) return 'low';
  if (score < 60) return 'medium';
  if (score < 80) return 'high';
  return 'very_high';
}

function generateSummary(score: number, level: string): string {
  const summaries: Record<string, string> = {
    very_low:  'Sinais digitais muito limitados. Poucas informações verificáveis foram encontradas.',
    low:       'Presença digital limitada. Alguns sinais básicos identificados mas insuficientes para alta confiança.',
    medium:    'Presença digital moderada. Sinais consistentes identificados com alguns pontos de atenção.',
    high:      'Presença digital sólida. Múltiplos sinais consistentes e verificáveis identificados.',
    very_high: 'Presença digital excelente. Alta consistência e múltiplos sinais positivos verificados.',
  };
  return summaries[level] || 'Análise concluída.';
}

export async function calculateTrustScore(data: {
  email?: string;
  phone?: string;
  username?: string;
  cpf?: string;
  birth_date?: string;
}): Promise<ScoreResult> {

  // Roda Instagram e Consulta Jurídica em paralelo
  const [igAnalysis, datajudAnalysis] = await Promise.all([
    data.username
      ? analyzeInstagramProfile(data.username)
      : Promise.resolve(null),
    // BUG CORRIGIDO: passa CPF quando disponível; se não houver CPF mas houver
    // nome/email, passa como fallback — evita chamar com (undefined, undefined)
    // que retornava "dados insuficientes" silenciosamente.
    data.cpf
      ? searchConsultaJuridica(undefined, data.cpf)
      : Promise.resolve(null),
  ]);

  // Monta sinais sociais: reais (Instagram API) ou mock (sem username)
  const socialSignals: SignalInput[] = igAnalysis
    ? buildInstagramSignals(igAnalysis)
    : analyzeMockUsername(data.username);

  const datajudSignals = datajudAnalysis
    ? datajudToSignals(datajudAnalysis)
    : [];

  const allSignals: SignalInput[] = [
    ...analyzeEmail(data.email),
    ...analyzePhone(data.phone),
    ...analyzeCPF(data.cpf),
    ...socialSignals,
    ...datajudSignals,
    ...analyzeConsistency(data),
  ];

  const identityResult    = calculateCategoryScore(allSignals, 'identity');
  const socialResult      = calculateCategoryScore(allSignals, 'social');
  const behavioralResult  = calculateCategoryScore(allSignals, 'behavioral');
  const consistencyResult = calculateCategoryScore(allSignals, 'consistency');

  const total_score = Math.round(
    identityResult.score    * CATEGORY_WEIGHTS.identity +
    socialResult.score      * CATEGORY_WEIGHTS.social +
    behavioralResult.score  * CATEGORY_WEIGHTS.behavioral +
    consistencyResult.score * CATEGORY_WEIGHTS.consistency
  );

  const level = getLevel(total_score);

  const weights = {
    ...SIGNAL_WEIGHTS.identity,
    ...SIGNAL_WEIGHTS.social,
    ...SIGNAL_WEIGHTS.behavioral,
    ...SIGNAL_WEIGHTS.consistency,
  };

  const enrichedSignals = allSignals.map(s => ({
    ...s,
    weight: (weights as Record<string, number>)[s.name] || 5,
    score_contribution: s.value === true ? (weights as Record<string, number>)[s.name] || 5 : 0,
  }));

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
    const igProfile = igAnalysis?.profile;
    const qualityLabel: Record<string, string> = {
        verified: 'verificada', high: 'alta', medium: 'média',
        low: 'baixa', suspicious: 'suspeita', fake: 'possivelmente falsa',
      };
      const desc = igProfile
      ? `Instagram @${igProfile.username}: ${igProfile.followers} seguidores, ${igProfile.posts_count} posts, qualidade da conta: ${qualityLabel[igProfile.account_quality] || igProfile.account_quality}`
      : `Pontuação social: ${socialResult.score}/100`;
    factors.push({
      name: 'Presença Social (Instagram)',
      contribution: Math.round(socialResult.score * CATEGORY_WEIGHTS.social),
      description: desc,
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

  // Gemini recebe dados reais do Instagram para análise mais precisa
  const ai_analysis = await generateGeminiAnalysis({
    total_score,
    level,
    identity_score:    identityResult.score,
    social_score:      socialResult.score,
    behavioral_score:  behavioralResult.score,
    consistency_score: consistencyResult.score,
    positive_signals: enrichedSignals.filter(s => s.value === true).map(s => s.name),
    negative_signals: enrichedSignals.filter(s => s.value === false).map(s => s.name),
    data_provided: Object.keys(data).filter(k => data[k as keyof typeof data]),
    datajud: datajudAnalysis ? {
      total_records: datajudAnalysis.total_records,
      public_records: datajudAnalysis.public_records,
      risk_level: datajudAnalysis.risk_level,
      summary: datajudAnalysis.summary,
      risk_breakdown: datajudAnalysis.risk_breakdown,
      last_movement_date: datajudAnalysis.last_movement_date,
      tribunals_searched: datajudAnalysis.tribunals_searched,
    } : null,
    instagram: igAnalysis?.profile ? {
      followers:              igAnalysis.profile.followers,
      following:              igAnalysis.profile.following,
      posts:                  igAnalysis.profile.posts_count,
      is_verified:            igAnalysis.profile.is_verified,
      is_private:             igAnalysis.profile.is_private,
      account_quality:        igAnalysis.profile.account_quality,
      follower_ratio:         igAnalysis.profile.follower_following_ratio,
      has_bio:                igAnalysis.profile.biography.length > 10,
    } : null,
  });

  return {
    total_score,
    identity_score:    identityResult.score,
    social_score:      socialResult.score,
    behavioral_score:  behavioralResult.score,
    consistency_score: consistencyResult.score,
    level,
    explanation: {
      summary: ai_analysis?.summary || generateSummary(total_score, level),
      factors,
      breakdown: {
        identity:    { score: identityResult.score,    weight: CATEGORY_WEIGHTS.identity,    signals: identityResult.signalNames    },
        social:      { score: socialResult.score,      weight: CATEGORY_WEIGHTS.social,      signals: socialResult.signalNames      },
        behavioral:  { score: behavioralResult.score,  weight: CATEGORY_WEIGHTS.behavioral,  signals: behavioralResult.signalNames  },
        consistency: { score: consistencyResult.score, weight: CATEGORY_WEIGHTS.consistency, signals: consistencyResult.signalNames },
      },
      instagram: igAnalysis ?? undefined,
      datajud: datajudAnalysis ?? undefined,
    },
    signals: enrichedSignals,
    ai_analysis,
  };
}
