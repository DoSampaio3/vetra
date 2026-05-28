import crypto from 'crypto';

export interface PDFData {
  report_id: string;
  title: string;
  created_at: string;
  subject_email?: string;
  subject_phone?: string;
  subject_username?: string;
  total_score: number;
  level: string;
  identity_score: number;
  social_score: number;
  behavioral_score: number;
  consistency_score: number;
  explanation: any;
  signals?: any[];
}

function getLevelLabel(level: string) {
  const m: Record<string, string> = {
    very_high: 'Excelente', high: 'Alto', medium: 'Médio', low: 'Baixo', very_low: 'Muito Baixo',
  };
  return m[level] || level;
}

function getLevelColor(level: string) {
  const m: Record<string, string> = {
    very_high: '#10B981', high: '#3B82F6', medium: '#F59E0B', low: '#EF4444', very_low: '#DC2626',
  };
  return m[level] || '#6B7280';
}

export function generatePDFHTML(data: PDFData): string {
  const color = getLevelColor(data.level);
  const label = getLevelLabel(data.level);
  const ai = data.explanation?.ai_analysis;
  const hash = crypto.createHash('sha256')
    .update(`${data.report_id}${data.total_score}${data.created_at}`)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();

  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (data.total_score / 100) * circ;

  const categories = [
    { label: 'Identidade', score: data.identity_score, weight: '35%' },
    { label: 'Social', score: data.social_score, weight: '25%' },
    { label: 'Comportamental', score: data.behavioral_score, weight: '20%' },
    { label: 'Consistência', score: data.consistency_score, weight: '20%' },
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Relatório Vetra — ${data.report_id.slice(0,8).toUpperCase()}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#020817;color:#e2e8f0;min-height:100vh}
.page{max-width:860px;margin:0 auto;padding-bottom:48px}
.header{background:linear-gradient(135deg,#0a1628,#0d1f3c);border-bottom:1px solid rgba(56,189,248,.15);padding:28px 40px;display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:center;gap:10px}
.logo-mark{width:30px;height:30px;background:linear-gradient(135deg,#1d4ed8,#0891b2);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px}
.logo-text{font-size:17px;font-weight:700;color:white;letter-spacing:.06em}
.header-meta{text-align:right;font-size:11px;color:rgba(100,116,139,.7);font-family:monospace}
.header-meta strong{display:block;color:rgba(56,189,248,.8);font-size:10px;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}
.hero{padding:36px 40px;background:linear-gradient(180deg,#0a1628,#050d1f);display:flex;gap:32px;align-items:flex-start}
.score-wrap{flex-shrink:0;text-align:center}
.score-label{font-size:10px;color:rgba(100,116,139,.6);text-transform:uppercase;letter-spacing:2px;margin-top:6px;font-family:monospace}
.report-info{flex:1}
.report-title{font-size:20px;font-weight:700;color:white;margin-bottom:8px}
.report-summary{font-size:13px;color:rgba(148,163,184,.7);line-height:1.7;margin-bottom:14px}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}
.chip{font-size:11px;color:rgba(148,163,184,.6);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);padding:3px 10px;border-radius:20px;font-family:monospace}
.report-date{font-size:11px;color:rgba(100,116,139,.5);font-family:monospace}
.section{padding:24px 40px;border-bottom:1px solid rgba(255,255,255,.04)}
.section-title{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(56,189,248,.6);font-family:monospace;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-title::after{content:'';flex:1;height:1px;background:rgba(56,189,248,.08)}
.breakdown-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.breakdown-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:14px}
.breakdown-label{font-size:12px;font-weight:600;color:rgba(226,232,240,.8);margin-bottom:2px}
.breakdown-weight{font-size:10px;color:rgba(100,116,139,.5);margin-bottom:8px;font-family:monospace}
.progress{height:3px;background:rgba(255,255,255,.06);border-radius:2px;margin-bottom:6px;overflow:hidden}
.progress-fill{height:100%;border-radius:2px}
.breakdown-score{font-size:18px;font-weight:700;font-family:monospace}
.factors-list{display:flex;flex-direction:column;gap:8px}
.factor{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:9px}
.factor.pos{background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.15)}
.factor.neg{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15)}
.factor-name{font-size:12px;font-weight:600;color:white;margin-bottom:2px}
.factor-desc{font-size:11px;color:rgba(148,163,184,.6)}
.factor-contrib{margin-left:auto;font-size:13px;font-weight:700;font-family:monospace;flex-shrink:0}
.ai-block{background:linear-gradient(135deg,rgba(124,58,237,.06),rgba(56,189,248,.06));border:1px solid rgba(124,58,237,.15);border-radius:14px;padding:20px}
.ai-header{display:flex;align-items:center;gap:8px;margin-bottom:14px}
.ai-badge{background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.2);color:#a78bfa;padding:3px 10px;border-radius:20px;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:1px}
.ai-summary{background:rgba(255,255,255,.03);border-radius:9px;padding:14px;font-size:13px;color:rgba(226,232,240,.8);line-height:1.7;font-style:italic;margin-bottom:12px}
.ai-two{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.ai-risks{background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.15);border-radius:9px;padding:12px}
.ai-pos{background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.15);border-radius:9px;padding:12px}
.ai-list-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:7px;font-family:monospace}
.ai-item{font-size:11px;line-height:1.5;margin-bottom:3px}
.ai-rec{background:rgba(56,189,248,.05);border:1px solid rgba(56,189,248,.15);border-radius:9px;padding:12px}
.ai-confidence{font-size:10px;color:rgba(100,116,139,.5);font-family:monospace;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.05)}
.signals-table{width:100%;border-collapse:collapse}
.signals-table th{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:rgba(100,116,139,.5);font-weight:600;padding:7px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);font-family:monospace}
.signals-table td{font-size:11px;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.03);color:rgba(226,232,240,.7);font-family:monospace}
.ok{color:#10B981}.fail{color:#EF4444}
.hash-block{padding:16px 40px;background:rgba(56,189,248,.03);border-top:1px solid rgba(56,189,248,.06)}
.hash-label{font-size:10px;color:rgba(100,116,139,.4);font-family:monospace;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.hash-value{font-size:12px;color:rgba(56,189,248,.5);font-family:monospace;word-break:break-all}
.footer{padding:18px 40px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(56,189,248,.06);background:rgba(5,13,31,.5)}
.footer-left{font-size:10px;color:rgba(100,116,139,.4);font-family:monospace}
.footer-right{font-size:10px;color:rgba(100,116,139,.3);font-family:monospace}
.disclaimer{padding:12px 40px;font-size:10px;color:rgba(100,116,139,.3);line-height:1.6;font-family:monospace}
</style>
</head>
<body>
<div class="page">
<div class="header">
  <div class="logo">
    <div class="logo-mark">V</div>
    <span class="logo-text">VETRA</span>
  </div>
  <div class="header-meta">
    <strong>Relatório de Confiança Digital</strong>
    ID: ${data.report_id.slice(0,8).toUpperCase()} &nbsp;·&nbsp;
    ${new Date(data.created_at).toLocaleString('pt-BR')}
  </div>
</div>

<div class="hero">
  <div class="score-wrap">
    <svg width="130" height="130" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="${radius}" fill="none" stroke="rgba(56,189,248,.08)" stroke-width="10"/>
      <circle cx="70" cy="70" r="${radius}" fill="none" stroke="${color}" stroke-width="10"
        stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
        stroke-linecap="round" transform="rotate(-90 70 70)"/>
      <text x="70" y="67" text-anchor="middle" font-size="30" font-weight="bold" fill="white" font-family="serif">${Math.round(data.total_score)}</text>
      <text x="70" y="85" text-anchor="middle" font-size="9" fill="${color}" font-family="monospace" letter-spacing="2">${label.toUpperCase()}</text>
    </svg>
    <div class="score-label">Trust Score</div>
  </div>
  <div class="report-info">
    <div class="report-title">${data.title}</div>
    <div class="report-summary">${data.explanation?.summary || ''}</div>
    <div class="chips">
      ${data.subject_email ? `<span class="chip">✉ ${data.subject_email}</span>` : ''}
      ${data.subject_phone ? `<span class="chip">☎ ${data.subject_phone}</span>` : ''}
      ${data.subject_username ? `<span class="chip">@ ${data.subject_username}</span>` : ''}
    </div>
    <div class="report-date">Gerado em ${new Date(data.created_at).toLocaleString('pt-BR')} · Powered by Gemini AI · LGPD compliant</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Score por categoria</div>
  <div class="breakdown-grid">
    ${categories.map(c => `
    <div class="breakdown-card">
      <div class="breakdown-label">${c.label}</div>
      <div class="breakdown-weight">Peso ${c.weight}</div>
      <div class="progress"><div class="progress-fill" style="width:${Math.round(c.score)}%;background:${color}"></div></div>
      <div class="breakdown-score" style="color:${color}">${Math.round(c.score)}</div>
    </div>`).join('')}
  </div>
</div>

${data.explanation?.factors?.length ? `
<div class="section">
  <div class="section-title">Fatores de impacto</div>
  <div class="factors-list">
    ${data.explanation.factors.map((f: any) => `
    <div class="factor ${f.positive ? 'pos' : 'neg'}">
      <span style="color:${f.positive ? '#10B981' : '#EF4444'};font-size:12px;margin-top:1px">${f.positive ? '▲' : '▽'}</span>
      <div style="flex:1">
        <div class="factor-name">${f.name}</div>
        <div class="factor-desc">${f.description}</div>
      </div>
      <span class="factor-contrib" style="color:${f.positive ? '#10B981' : '#EF4444'}">+${f.contribution}</span>
    </div>`).join('')}
  </div>
</div>` : ''}

${ai ? `
<div class="section">
  <div class="section-title">Análise por inteligência artificial</div>
  <div class="ai-block">
    <div class="ai-header">
      <span style="font-size:15px;color:#a78bfa">✦</span>
      <span class="ai-badge">Gemini 1.5 Flash</span>
    </div>
    <div class="ai-summary">"${ai.summary}"</div>
    <p style="font-size:12px;color:rgba(148,163,184,.65);line-height:1.7;margin-bottom:12px">${ai.interpretation}</p>
    <div class="ai-two">
      ${ai.risk_flags?.length ? `
      <div class="ai-risks">
        <div class="ai-list-title" style="color:#fbbf24">⚠ Pontos de atenção</div>
        ${ai.risk_flags.map((f: string) => `<div class="ai-item" style="color:rgba(251,191,36,.8)">• ${f}</div>`).join('')}
      </div>` : '<div></div>'}
      ${ai.positive_highlights?.length ? `
      <div class="ai-pos">
        <div class="ai-list-title" style="color:#10B981">✓ Destaques positivos</div>
        ${ai.positive_highlights.map((h: string) => `<div class="ai-item" style="color:rgba(16,185,129,.8)">• ${h}</div>`).join('')}
      </div>` : '<div></div>'}
    </div>
    <div class="ai-rec">
      <div class="ai-list-title" style="color:#38bdf8">→ Recomendação</div>
      <div style="font-size:12px;color:rgba(226,232,240,.8)">${ai.recommendation}</div>
    </div>
    <div class="ai-confidence">◷ ${ai.confidence_note}</div>
  </div>
</div>` : ''}

${data.signals?.length ? `
<div class="section">
  <div class="section-title">Sinais detectados (${data.signals.length})</div>
  <table class="signals-table">
    <thead><tr>
      <th>Sinal</th><th>Tipo</th><th>Resultado</th><th>Peso</th><th>Contribuição</th>
    </tr></thead>
    <tbody>
      ${data.signals.map((s: any) => `
      <tr>
        <td>${(s.signal_name || '').replace(/_/g, ' ')}</td>
        <td>${s.signal_type || ''}</td>
        <td class="${s.value?.result ? 'ok' : 'fail'}">${s.value?.result ? '✓ Positivo' : '✗ Negativo'}</td>
        <td>${s.weight || 0}</td>
        <td style="color:${(s.score_contribution || 0) > 0 ? '#10B981' : 'rgba(100,116,139,.5)'}">
          ${(s.score_contribution || 0) > 0 ? '+' + s.score_contribution : '0'}
        </td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>` : ''}

<div class="hash-block">
  <div class="hash-label">Hash de integridade do relatório</div>
  <div class="hash-value">${hash}</div>
</div>

<div class="footer">
  <div class="footer-left">VETRA v2.0 · ID ${data.report_id.slice(0,8).toUpperCase()}</div>
  <div class="footer-right">app.vetra.ai · Powered by Gemini AI</div>
</div>
<div class="disclaimer">
  Este relatório foi gerado com base em dados públicos e fornecidos com consentimento. Não constitui opinião jurídica ou financeira.
  O Vetra não acessa bases privadas ou sigilosas. Dados judiciais via Datajud/CNJ público. LGPD compliant.
</div>
</div>
</body>
</html>`;
}
