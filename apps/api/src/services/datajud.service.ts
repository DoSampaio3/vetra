// ─────────────────────────────────────────────────────────────────
// VETRA — Integração Datajud CNJ (API Pública)
// Glossário: https://api-publica.datajud.cnj.jus.br/api-publica/glossario
// Apenas dados públicos (nivelSigilo = 0) · LGPD compliant
// ─────────────────────────────────────────────────────────────────

const DATAJUD_BASE = process.env.DATAJUD_BASE_URL || 'https://api-publica.datajud.cnj.jus.br';

// Índices dos principais tribunais disponíveis na API pública
const TRIBUNAL_INDICES = [
  'api_publica_tjsp',   // Tribunal de Justiça de São Paulo
  'api_publica_tjrj',   // Tribunal de Justiça do Rio de Janeiro
  'api_publica_tjmg',   // Tribunal de Justiça de Minas Gerais
  'api_publica_tjrs',   // Tribunal de Justiça do Rio Grande do Sul
  'api_publica_tjpr',   // Tribunal de Justiça do Paraná
  'api_publica_tjba',   // Tribunal de Justiça da Bahia
  'api_publica_tjsc',   // Tribunal de Justiça de Santa Catarina
  'api_publica_trf1',   // Tribunal Regional Federal 1ª Região
  'api_publica_trf3',   // Tribunal Regional Federal 3ª Região
];

// Códigos de classes processuais relevantes para análise de risco (TPU)
const HIGH_RISK_CLASS_CODES = new Set([
  1107, // Inquérito Policial
  1109, // Ação Penal - Procedimento Ordinário
  1110, // Ação Penal - Procedimento Sumário
  283,  // Ação Penal Privada
  14,   // Medida Protetiva de Urgência (Lei Maria da Penha)
  1127, // Execução Penal
  40,   // Processo de Execução Penal
]);

const MEDIUM_RISK_CLASS_CODES = new Set([
  1116, // Execução Fiscal
  155,  // Ação de Cobrança
  729,  // Embargos à Execução
  1150, // Monitória
  526,  // Concordata
  17,   // Falência
  18,   // Recuperação Judicial
]);

// Códigos de assuntos sensíveis (TPU - assuntos)
const SENSITIVE_SUBJECT_CODES = new Set([
  10441, // Violência doméstica
  12356, // Estelionato
  11971, // Furto
  11972, // Roubo
  11982, // Homicídio
  7651,  // Tráfico de entorpecentes
  10444, // Assédio sexual
  10891, // Stalking
  6218,  // Crimes contra a honra
]);

export interface ConsultaJuridicaRecord {
  numeroProcesso: string;
  tribunal: string;
  dataAjuizamento: string;
  grau: string;
  nivelSigilo: number;
  classe: { codigo: number; nome: string };
  assuntos: Array<{ codigo: number; nome: string }>;
  orgaoJulgador: { codigo: number; nome: string; codigoMunicipioIBGE?: number };
  movimentos?: Array<{
    codigo: number;
    nome: string;
    dataHora: string;
  }>;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  riskReason: string;
}

export interface ConsultaJuridicaAnalysis {
  found: boolean;
  total_records: number;
  public_records: number;
  records: ConsultaJuridicaRecord[];
  risk_level: 'none' | 'low' | 'medium' | 'high';
  risk_breakdown: {
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
    sensitive_subjects: string[];
  };
  summary: string;
  last_movement_date?: string;
  tribunals_searched: string[];
  searched_at: string;
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function classifyRecord(record: Partial<ConsultaJuridicaRecord>): { level: 'none' | 'low' | 'medium' | 'high'; reason: string } {
  if ((record.nivelSigilo ?? 0) > 0) {
    return { level: 'none', reason: 'Processo sigiloso — não analisado' };
  }
  if (record.classe && HIGH_RISK_CLASS_CODES.has(record.classe.codigo)) {
    return { level: 'high', reason: `Processo criminal: ${record.classe.nome}` };
  }
  const sensitiveSubject = record.assuntos?.find(a => SENSITIVE_SUBJECT_CODES.has(a.codigo));
  if (sensitiveSubject) {
    return { level: 'high', reason: `Assunto sensível: ${sensitiveSubject.nome}` };
  }
  if (record.classe && MEDIUM_RISK_CLASS_CODES.has(record.classe.codigo)) {
    return { level: 'medium', reason: `Processo financeiro/civil: ${record.classe.nome}` };
  }
  return { level: 'low', reason: `Processo ${record.classe?.nome || 'cível/trabalhista'}` };
}

// ── BUG 1 CORRIGIDO: query usando "nested" para o campo "partes" ──
// O Datajud indexa o array "partes" como objeto nested no Elasticsearch.
// Sem o wrapper { nested: { path: "partes", query: ... } } a busca retorna
// 0 resultados mesmo com CPF correto — o Elasticsearch ignora silenciosamente.
function buildSearchQuery(name?: string, cpf?: string): object {
  let mustQuery: object;

  if (cpf) {
    const cleanCpf = cpf.replace(/\D/g, '');
    // Nested query obrigatória para campos dentro de arrays de objetos
    mustQuery = {
      nested: {
        path: 'partes',
        query: {
          bool: {
            should: [
              { match: { 'partes.cpfCnpj': cleanCpf } },
              { match: { 'partes.documento': cleanCpf } },
            ],
            minimum_should_match: 1,
          },
        },
      },
    };
  } else if (name) {
    // Busca por nome também é nested
    mustQuery = {
      nested: {
        path: 'partes',
        query: {
          match: {
            'partes.nome': {
              query: name,
              operator: 'and',
              minimum_should_match: '80%',
            },
          },
        },
      },
    };
  } else {
    mustQuery = { match_all: {} };
  }

  return {
    query: {
      bool: {
        must: [mustQuery],
        filter: [
          { term: { nivelSigilo: 0 } }, // Apenas processos públicos
        ],
      },
    },
    size: 20,
    sort: [{ dataAjuizamento: { order: 'desc' } }],
    _source: [
      'numeroProcesso',
      'tribunal',
      'dataAjuizamento',
      'grau',
      'nivelSigilo',
      'classe.codigo',
      'classe.nome',
      'assuntos.codigo',
      'assuntos.nome',
      'orgaoJulgador.codigo',
      'orgaoJulgador.nome',
      'orgaoJulgador.codigoMunicipioIBGE',
      'movimentos.codigo',
      'movimentos.nome',
      'movimentos.dataHora',
    ],
  };
}

async function searchTribunal(
  tribunalIndex: string,
  query: object,
  apiKey: string,
  timeoutMs = 8000
): Promise<ConsultaJuridicaRecord[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${DATAJUD_BASE}/${tribunalIndex}/_search`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `APIKey ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 404) return [];
      // ── BUG 3 CORRIGIDO: loga o corpo do erro para diagnóstico ──
      const errorBody = await response.text().catch(() => '');
      console.warn(`Datajud ${tribunalIndex}: HTTP ${response.status} — ${errorBody.slice(0, 200)}`);
      return [];
    }

    const data = await response.json();
    const hits = data?.hits?.hits || [];

    return hits
      .filter((hit: any) => (hit._source?.nivelSigilo ?? 0) === 0)
      .map((hit: any): ConsultaJuridicaRecord => {
        const src = hit._source || {};
        const classification = classifyRecord(src);
        return {
          numeroProcesso: src.numeroProcesso || '',
          tribunal: src.tribunal || tribunalIndex.replace('api_publica_', '').toUpperCase(),
          dataAjuizamento: src.dataAjuizamento || '',
          grau: src.grau || '',
          nivelSigilo: src.nivelSigilo || 0,
          classe: src.classe || { codigo: 0, nome: 'Não informado' },
          assuntos: src.assuntos || [],
          orgaoJulgador: src.orgaoJulgador || { codigo: 0, nome: '' },
          movimentos: (src.movimentos || []).slice(0, 5),
          riskLevel: classification.level,
          riskReason: classification.reason,
        };
      });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.warn(`Datajud ${tribunalIndex}: timeout após ${timeoutMs}ms`);
    } else {
      console.warn(`Datajud ${tribunalIndex}: ${err.message}`);
    }
    return [];
  }
}

function deduplicateRecords(records: ConsultaJuridicaRecord[]): ConsultaJuridicaRecord[] {
  const seen = new Set<string>();
  return records.filter(r => {
    if (!r.numeroProcesso || seen.has(r.numeroProcesso)) return false;
    seen.add(r.numeroProcesso);
    return true;
  });
}

function calculateOverallRisk(records: ConsultaJuridicaRecord[]): ConsultaJuridicaAnalysis['risk_level'] {
  if (records.length === 0) return 'none';
  if (records.some(r => r.riskLevel === 'high')) return 'high';
  if (records.filter(r => r.riskLevel === 'medium').length >= 2) return 'medium';
  if (records.some(r => r.riskLevel === 'medium')) return 'medium';
  if (records.length >= 5) return 'medium';
  return 'low';
}

function buildSummary(
  total: number,
  riskLevel: string,
  breakdown: ConsultaJuridicaAnalysis['risk_breakdown']
): string {
  if (total === 0) {
    return 'Nenhum processo judicial público encontrado no Datajud CNJ.';
  }
  const parts: string[] = [`${total} processo(s) público(s) encontrado(s) no Datajud CNJ.`];
  if (breakdown.high_risk_count > 0) {
    parts.push(`${breakdown.high_risk_count} processo(s) de alto risco (criminal/penal).`);
  }
  if (breakdown.medium_risk_count > 0) {
    parts.push(`${breakdown.medium_risk_count} processo(s) de risco médio (financeiro/civil).`);
  }
  if (breakdown.sensitive_subjects.length > 0) {
    parts.push(`Assuntos sensíveis: ${breakdown.sensitive_subjects.slice(0, 3).join(', ')}.`);
  }
  return parts.join(' ');
}

function getLastMovementDate(records: ConsultaJuridicaRecord[]): string | undefined {
  const dates = records
    .flatMap(r => r.movimentos || [])
    .map(m => m.dataHora)
    .filter(Boolean)
    .sort()
    .reverse();
  return dates[0];
}

// ── Export principal ──────────────────────────────────────────────

export async function searchConsultaJuridica(
  name?: string,
  cpf?: string
): Promise<ConsultaJuridicaAnalysis> {
  const apiKey = process.env.DATAJUD_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  DATAJUD_API_KEY não configurada.');
    return {
      found: false, total_records: 0, public_records: 0,
      records: [], risk_level: 'none',
      risk_breakdown: { high_risk_count: 0, medium_risk_count: 0, low_risk_count: 0, sensitive_subjects: [] },
      summary: 'Datajud não configurado (sem API key).',
      tribunals_searched: [],
      searched_at: new Date().toISOString(),
      error: 'DATAJUD_API_KEY não configurada',
    };
  }

  if (!name && !cpf) {
    return {
      found: false, total_records: 0, public_records: 0,
      records: [], risk_level: 'none',
      risk_breakdown: { high_risk_count: 0, medium_risk_count: 0, low_risk_count: 0, sensitive_subjects: [] },
      summary: 'Dados insuficientes para consulta judicial (nome ou CPF necessário).',
      tribunals_searched: [],
      searched_at: new Date().toISOString(),
    };
  }

  const query = buildSearchQuery(name, cpf);
  console.log(`🔍 Datajud CNJ: consultando "${cpf ? 'CPF ***' + cpf.slice(-3) : name}" em ${TRIBUNAL_INDICES.length} tribunais...`);

  try {
    const results = await Promise.allSettled(
      TRIBUNAL_INDICES.map(t => searchTribunal(t, query, apiKey))
    );

    const allRecords = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<ConsultaJuridicaRecord[]>).value);

    const unique = deduplicateRecords(allRecords);

    const breakdown: ConsultaJuridicaAnalysis['risk_breakdown'] = {
      high_risk_count: unique.filter(r => r.riskLevel === 'high').length,
      medium_risk_count: unique.filter(r => r.riskLevel === 'medium').length,
      low_risk_count: unique.filter(r => r.riskLevel === 'low').length,
      sensitive_subjects: [
        ...new Set(
          unique
            .flatMap(r => r.assuntos)
            .filter(a => SENSITIVE_SUBJECT_CODES.has(a.codigo))
            .map(a => a.nome)
        ),
      ],
    };

    const riskLevel = calculateOverallRisk(unique);
    const summary = buildSummary(unique.length, riskLevel, breakdown);
    const lastMovement = getLastMovementDate(unique);

    console.log(`✅ Datajud CNJ: ${unique.length} processos únicos | Risco: ${riskLevel}`);

    return {
      found: unique.length > 0,
      total_records: unique.length,
      public_records: unique.length,
      records: unique.slice(0, 10),
      risk_level: riskLevel,
      risk_breakdown: breakdown,
      summary,
      last_movement_date: lastMovement,
      tribunals_searched: TRIBUNAL_INDICES.map(t => t.replace('api_publica_', '').toUpperCase()),
      searched_at: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('❌ Erro geral no Datajud:', err.message);
    return {
      found: false, total_records: 0, public_records: 0,
      records: [], risk_level: 'none',
      risk_breakdown: { high_risk_count: 0, medium_risk_count: 0, low_risk_count: 0, sensitive_subjects: [] },
      summary: 'Erro na consulta judicial. Verifique a API key do Datajud.',
      tribunals_searched: [],
      searched_at: new Date().toISOString(),
      error: err.message,
    };
  }
}

// ── Converte resultado em sinais para o score ─────────────────────

export function datajudToSignals(analysis: ConsultaJuridicaAnalysis) {
  return [
    {
      type: 'consistency' as const,
      name: 'datajud_no_records',
      value: analysis.total_records === 0,
      source: 'datajud_cnj',
    },
    {
      type: 'consistency' as const,
      name: 'datajud_no_high_risk',
      value: analysis.risk_breakdown.high_risk_count === 0,
      source: 'datajud_cnj',
    },
    {
      type: 'behavioral' as const,
      name: 'datajud_low_risk',
      value: analysis.risk_level === 'none' || analysis.risk_level === 'low',
      source: 'datajud_cnj',
    },
    {
      type: 'behavioral' as const,
      name: 'datajud_no_sensitive_subjects',
      value: analysis.risk_breakdown.sensitive_subjects.length === 0,
      source: 'datajud_cnj',
    },
  ];
}
