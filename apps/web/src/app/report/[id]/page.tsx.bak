'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { ScoreRing } from '@/components/ScoreRing';
import { Card, Badge, Button, ScoreBar, Skeleton } from '@/components/ui/index';
import { api, Report, Signal } from '@/lib/api';

const LEVEL_LABEL: Record<string, string> = {
  very_high: 'Excelente', high: 'Alto', medium: 'Médio',
  low: 'Baixo', very_low: 'Muito Baixo',
};
const LEVEL_BADGE: Record<string, any> = {
  very_high: 'green', high: 'blue', medium: 'yellow',
  low: 'red', very_low: 'red',
};
const SIGNAL_TYPE_LABEL: Record<string, string> = {
  identity: 'Identidade', social: 'Social',
  behavioral: 'Comportamental', consistency: 'Consistência',
};
const SIGNAL_TYPE_BADGE: Record<string, any> = {
  identity: 'purple', social: 'blue',
  behavioral: 'yellow', consistency: 'gray',
};
const CAT_LABEL: Record<string, string> = {
  identity: 'Identidade', social: 'Social',
  behavioral: 'Comportamental', consistency: 'Consistência',
};

export default function ReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    api.reports.get(id)
      .then(({ report, signals }) => { setReport(report); setSignals(signals); })
      .catch(err => setError(err.message))
      .finally(() => setLoadingData(false));
  }, [user, id]);

  if (loading || !user) return null;

  if (loadingData) return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64" /><Skeleton className="h-64" />
        </div>
      </div>
    </AppLayout>
  );

  if (error || !report) return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="flex flex-col items-center py-10 gap-4">
            <span className="text-4xl">⚠️</span>
            <p className="text-gray-500 text-sm">{error || 'Relatório não encontrado.'}</p>
            <Link href="/dashboard"><Button variant="ghost">← Voltar ao painel</Button></Link>
          </div>
        </Card>
      </div>
    </AppLayout>
  );

  const explanation = report.explanation as any;
  const breakdown = explanation?.breakdown || {};
  const factors = explanation?.factors || [];
  const ai = explanation?.ai_analysis;
  const datajud = explanation?.datajud;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-gray-400 hover:text-blue-600 transition-colors">
            Painel
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-medium">Relatório</span>
        </div>

        {/* ── CABEÇALHO DO RELATÓRIO ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Faixa CONFIDENCIAL */}
          <div className="bg-slate-900 text-white px-5 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">V</span>
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase font-mono">Vetra</span>
              <span className="text-slate-500 text-xs mx-1">·</span>
              <span className="text-xs text-slate-400 font-mono">Relatório de Confiança Digital</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-widest text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono">
                ⚠ CONFIDENCIAL
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ID: {report.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Hero */}
          <div className="p-6 flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <ScoreRing score={Math.round(report.total_score)} level={report.level} size={120} />
              <Badge variant={LEVEL_BADGE[report.level]}>
                {LEVEL_LABEL[report.level]}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{report.summary}</p>

              {/* Dados analisados */}
              <div className="flex flex-wrap gap-2 mb-4">
                {report.subject_email && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 font-mono">
                    ✉ {report.subject_email}
                  </span>
                )}
                {report.subject_phone && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 font-mono">
                    ☎ {report.subject_phone}
                  </span>
                )}
                {report.subject_username && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 font-mono">
                    @ {report.subject_username}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-mono">
                <span>Gerado em {new Date(report.created_at).toLocaleString('pt-BR')}</span>
                <span>·</span>
                <span>Powered by Gemini AI</span>
                <span>·</span>
                <span className="text-red-400 font-semibold">Documento Restrito</span>
              </div>
            </div>
          </div>

          {/* Rodapé confidencial */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-2 text-center">
            <p className="text-[10px] text-gray-400 font-mono tracking-wide">
              DOCUMENTO RESTRITO PARA FINS DE ANÁLISE DIGITAL · USO EXCLUSIVO DO SOLICITANTE ·
              VETRA © {new Date().getFullYear()} · LGPD COMPLIANT
            </p>
          </div>
        </div>

        {/* ── SCORE POR CATEGORIA + FATORES ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Breakdown */}
          <Card>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Score por categoria
            </h2>
            <div className="space-y-4">
              {Object.entries(breakdown).map(([key, val]: [string, any]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-700">{CAT_LABEL[key] || key}</span>
                    <span className="text-xs text-gray-400 font-mono">
                      peso {Math.round((val.weight || 0) * 100)}%
                    </span>
                  </div>
                  <ScoreBar score={val.score || 0} label="" />
                  {val.signals?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {val.signals.slice(0, 5).map((s: string, i: number) => (
                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          s.startsWith('✓')
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-500'
                        }`}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Fatores */}
          <Card>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Fatores de impacto
            </h2>
            <div className="space-y-3">
              {factors.length === 0 && (
                <p className="text-xs text-gray-400">Nenhum fator identificado.</p>
              )}
              {factors.map((f: any, i: number) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  f.positive
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <span className={`text-xs mt-0.5 flex-shrink-0 ${f.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {f.positive ? '▲' : '▽'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{f.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${f.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    +{f.contribution}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── DATAJUD ── */}
        {datajud && (
          <Card style={{
            background: datajud.risk_level === 'high'
              ? 'rgba(239,68,68,0.03)'
              : datajud.risk_level === 'medium'
              ? 'rgba(251,191,36,0.03)'
              : 'rgba(16,185,129,0.03)',
            border: `1px solid ${
              datajud.risk_level === 'high' ? 'rgba(239,68,68,0.2)'
              : datajud.risk_level === 'medium' ? 'rgba(251,191,36,0.2)'
              : 'rgba(16,185,129,0.2)'
            }`,
          }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-base flex-shrink-0">⚖️</div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Registros Judiciais Públicos</h2>
                  <p className="text-xs text-gray-400 font-mono">Consulta Jurídica</p>
                </div>
              </div>
              <Badge variant={
                datajud.risk_level === 'none' ? 'green'
                : datajud.risk_level === 'low' ? 'blue'
                : datajud.risk_level === 'medium' ? 'yellow'
                : 'red'
              }>
                {datajud.risk_level === 'none' ? '✓ Sem registros'
                : datajud.risk_level === 'low' ? 'Risco baixo'
                : datajud.risk_level === 'medium' ? 'Risco médio'
                : '⚠ Risco alto'}
              </Badge>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{datajud.summary}</p>

            {datajud.total_records > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { label: 'Alto risco', count: datajud.risk_breakdown?.high_risk_count ?? 0, color: 'red' },
                  { label: 'Risco médio', count: datajud.risk_breakdown?.medium_risk_count ?? 0, color: 'amber' },
                  { label: 'Baixo risco', count: datajud.risk_breakdown?.low_risk_count ?? 0, color: 'blue' },
                ].map(item => (
                  <div key={item.label} className={`text-center p-3 rounded-xl border bg-${item.color}-50 border-${item.color}-100`}>
                    <p className={`text-xl font-bold text-${item.color}-600`}>{item.count}</p>
                    <p className={`text-xs text-${item.color}-500 mt-1`}>{item.label}</p>
                  </div>
                ))}
              </div>
            )}

            {datajud.risk_breakdown?.sensitive_subjects?.length > 0 && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs font-semibold text-red-700 mb-1">⚠ Assuntos sensíveis detectados</p>
                <p className="text-xs text-red-600">{datajud.risk_breakdown.sensitive_subjects.join(' · ')}</p>
              </div>
            )}

            {datajud.tribunals_searched?.length > 0 && (
              <p className="text-[10px] text-gray-400 font-mono mt-3">
                Tribunais consultados: {datajud.tribunals_searched.join(' · ')}
              </p>
            )}
          </Card>
        )}

        {/* ── ANÁLISE DE IA ── */}
        {ai && (
          <Card style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.03), rgba(56,189,248,0.03))',
            border: '1px solid rgba(124,58,237,0.15)',
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-sm flex-shrink-0">✦</div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Análise por Inteligência Artificial</h2>
                <span className="text-xs text-violet-600 font-mono">Gemini 1.5 Flash</span>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed italic">"{ai.summary}"</p>
            </div>

            {/* Interpretação */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{ai.interpretation}</p>

            {/* Alertas e positivos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {ai.risk_flags?.length > 0 && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                  <p className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">⚠ Pontos de atenção</p>
                  <ul className="space-y-1.5">
                    {ai.risk_flags.map((f: string, i: number) => (
                      <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                        <span className="flex-shrink-0 mt-0.5">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ai.positive_highlights?.length > 0 && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                  <p className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">✓ Destaques positivos</p>
                  <ul className="space-y-1.5">
                    {ai.positive_highlights.map((h: string, i: number) => (
                      <li key={i} className="text-xs text-emerald-700 flex items-start gap-1.5">
                        <span className="flex-shrink-0 mt-0.5">•</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recomendação */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-3">
              <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">→ Recomendação</p>
              <p className="text-sm text-blue-800">{ai.recommendation}</p>
            </div>

            <p className="text-xs text-gray-400 font-mono pt-3 border-t border-gray-100">
              ◷ {ai.confidence_note}
            </p>
          </Card>
        )}

        {/* ── TABELA DE SINAIS ── */}
        {signals.length > 0 && (
          <Card>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Sinais detectados <span className="text-gray-400 font-normal normal-case">({signals.length} total)</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Sinal', 'Categoria', 'Fonte', 'Peso', 'Resultado', 'Contribuição'].map(h => (
                      <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 pb-3 pr-4 font-mono">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {signals.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4">
                        <span className="text-xs font-mono text-gray-700">
                          {s.signal_name.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={SIGNAL_TYPE_BADGE[s.signal_type] || 'gray'}>
                          {SIGNAL_TYPE_LABEL[s.signal_type] || s.signal_type}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="text-[10px] text-gray-400 font-mono">{s.source}</span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="text-xs text-gray-500 font-mono">{s.weight}</span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs font-semibold ${(s as any).value?.result ? 'text-emerald-600' : 'text-red-500'}`}>
                          {(s as any).value?.result ? '✓ Positivo' : '✗ Negativo'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs font-mono font-semibold ${s.score_contribution > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                          {s.score_contribution > 0 ? `+${s.score_contribution}` : '0'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rodapé do relatório */}
            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-mono">
                DOCUMENTO RESTRITO PARA FINS DE ANÁLISE DIGITAL ·
                VETRA © {new Date().getFullYear()} ·
                ID {report.id.slice(0, 8).toUpperCase()} ·
                {new Date(report.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
