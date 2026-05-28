// ─────────────────────────────────────────────
// VETRA — Integração Google Gemini AI
// Modelo: gemini-1.5-flash (gratuito)
// Docs: https://ai.google.dev/
// ─────────────────────────────────────────────

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiAnalysis {
  summary: string;           // Resumo principal em linguagem natural
  interpretation: string;   // Interpretação aprofundada do score
  risk_flags: string[];      // Alertas de risco identificados pela IA
  positive_highlights: string[]; // Pontos positivos destacados pela IA
  recommendation: string;   // Recomendação final da IA
  confidence_note: string;  // Nota de confiança da análise
  powered_by: 'gemini-1.5-flash';
}

interface GeminiInput {
  total_score: number;
  level: string;
  identity_score: number;
  social_score: number;
  behavioral_score: number;
  consistency_score: number;
  positive_signals: string[];
  negative_signals: string[];
  data_provided: string[];
  instagram?: {
    followers: number;
    following: number;
    posts: number;
    is_verified: boolean;
    is_private: boolean;
    account_quality: string;
    follower_ratio: number;
    has_bio: boolean;
  } | null;
  datajud?: {
    total_records: number;
    public_records: number;
    risk_level: string;
    summary: string;
    risk_breakdown?: {
      high_risk_count: number;
      medium_risk_count: number;
      low_risk_count: number;
      sensitive_subjects: string[];
    };
    last_movement_date?: string;
    tribunals_searched?: string[];
  } | null;
}

function buildPrompt(input: GeminiInput): string {
  const levelLabel: Record<string, string> = {
    very_high: 'Excelente (80-100)',
    high: 'Alto (60-79)',
    medium: 'Médio (40-59)',
    low: 'Baixo (20-39)',
    very_low: 'Muito Baixo (0-19)',
  };

  const positiveCount = input.positive_signals.length;
  const negativeCount = input.negative_signals.length;
  const totalSignals = positiveCount + negativeCount;
  const signalRatio = totalSignals > 0 ? Math.round((positiveCount / totalSignals) * 100) : 0;

  return `Você é um especialista sênior em inteligência digital e análise de reputação da plataforma VETRA.
Sua análise deve ser precisa, contextual, em português brasileiro formal e nunca genérica.

════════════════════════════════════
DADOS DA VERIFICAÇÃO
════════════════════════════════════
Score Total: ${input.total_score}/100 (Nível: ${levelLabel[input.level] || input.level})
Distribuição: Identidade ${input.identity_score}/100 · Social ${input.social_score}/100 · Comportamental ${input.behavioral_score}/100 · Consistência ${input.consistency_score}/100

Sinais positivos (${positiveCount}): ${input.positive_signals.slice(0, 8).join(', ') || 'nenhum'}
Sinais negativos (${negativeCount}): ${input.negative_signals.slice(0, 8).join(', ') || 'nenhum'}
Taxa de sinais positivos: ${signalRatio}%
Tipos de dados fornecidos: ${input.data_provided.join(', ')}

${input.instagram ? `════════════════════════════════════
INSTAGRAM (verificação real via API)
════════════════════════════════════
Seguidores: ${input.instagram.followers} · Seguindo: ${input.instagram.following}
Posts publicados: ${input.instagram.posts}
Conta verificada: ${input.instagram.is_verified ? 'Sim ✓' : 'Não'}
Conta privada: ${input.instagram.is_private ? 'Sim' : 'Não (pública)'}
Qualidade detectada: ${input.instagram.account_quality}
Ratio seguidores/seguindo: ${input.instagram.follower_ratio}
Bio preenchida: ${input.instagram.has_bio ? 'Sim' : 'Não'}` : ''}

${input.datajud ? `════════════════════════════════════
DATAJUD / CNJ (registros judiciais públicos)
════════════════════════════════════
Total de processos públicos: ${input.datajud.total_records}
Nível de risco judicial: ${input.datajud.risk_level}
Processos de alto risco (criminal/penal): ${input.datajud.risk_breakdown?.high_risk_count ?? 0}
Processos de risco médio (financeiro): ${input.datajud.risk_breakdown?.medium_risk_count ?? 0}
Assuntos sensíveis: ${input.datajud.risk_breakdown?.sensitive_subjects?.join(', ') || 'nenhum'}
Resumo Consulta Jurídica: ${input.datajud.summary}` : ''}

════════════════════════════════════
INSTRUÇÕES DE ANÁLISE
════════════════════════════════════
- Seja específico com os dados disponíveis, nunca genérico
- Faça correlações entre os sinais (ex: Instagram com muitos seguidores mas sem bio é suspeito)
- Se Consulta Jurídica retornou processos, mencione de forma séria mas sem dramatizar
- Se a API do Instagram não retornou dados, mencione a limitação
- Use linguagem corporativa e técnica, mas compreensível
- NÃO invente dados. NÃO extrapole além do que foi fornecido
- NÃO use frases genéricas como "perfil com características normais"

Responda APENAS com JSON válido, sem markdown, sem texto fora do JSON:

{
  "summary": "Resumo executivo de 1-2 frases específicas sobre este perfil, mencionando os dados reais encontrados",
  "interpretation": "Análise técnica de 2-3 frases correlacionando os scores entre si e com os dados do Instagram/Consulta Jurídica",
  "risk_flags": ["alertas específicos baseados nos dados — deixe vazio se não houver"],
  "positive_highlights": ["destaques positivos específicos encontrados — com base nos dados reais"],
  "recommendation": "Recomendação clara e objetiva de 1-2 frases sobre como usar este resultado",
  "confidence_note": "Nota sobre confiança desta análise dado o volume e qualidade dos dados disponíveis"
}`;
}

export async function generateGeminiAnalysis(
  input: GeminiInput
): Promise<GeminiAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  GEMINI_API_KEY não configurada. Análise IA desativada.');
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.4,      // Baixo para respostas consistentes e factuais
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('❌ Gemini API error:', response.status, err);
      return null;
    }

    const data = await response.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!rawText) {
      console.error('❌ Gemini retornou resposta vazia');
      return null;
    }

    // Remove possíveis marcadores markdown que o modelo inclua mesmo pedindo JSON puro
    const cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned) as Omit<GeminiAnalysis, 'powered_by'>;

    return {
      ...parsed,
      powered_by: 'gemini-1.5-flash',
    };
  } catch (err) {
    console.error('❌ Erro ao chamar Gemini:', err);
    return null;  // Nunca derruba o sistema — análise IA é complementar
  }
}
