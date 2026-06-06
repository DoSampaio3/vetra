'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { ScoreRing } from '@/components/ScoreRing';
import { Card, Badge, Button, ScoreBar, Skeleton } from '@/components/ui/index';
import { api, Report, Signal } from '@/lib/api';

const LEVEL_LABEL: Record<string,string> = { very_high:'Excelente', high:'Alto', medium:'Médio', low:'Baixo', very_low:'Muito Baixo' };
const LEVEL_BADGE: Record<string,any> = { very_high:'green', high:'blue', medium:'yellow', low:'red', very_low:'red' };
const SIGNAL_TYPE_LABEL: Record<string,string> = { identity:'Identidade', social:'Social', behavioral:'Comportamental', consistency:'Consistência' };
const CAT_LABEL: Record<string,string> = { identity:'Identidade', social:'Social', behavioral:'Comportamental', consistency:'Consistência' };

export default function ReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    api.reports.get(id)
      .then((res: any) => {
        setReport(res.report);
        setSignals(res.signals || []);
        setIsLocked(res.is_locked === true);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingData(false));
  }, [user, id]);

  if (loading || !user) return null;

  if (loadingData) return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
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
            <Link href="/dashboard"><Button variant="ghost">← Voltar</Button></Link>
          </div>
        </Card>
      </div>
    </AppLayout>
  );

  // ── TELA PAYWALL (usuário free) ──────────────────────────────
  if (isLocked) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto space-y-4 px-2">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-gray-400 hover:text-blue-600">Painel</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-medium">Resultado da Análise</span>
          </div>

          {/* Card de resultado parcial */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">V</span>
                </div>
                <span className="text-xs text-slate-300 font-mono">Vetra · Análise de Confiança Digital</span>
              </div>
              <span className="text-[10px] font-bold text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono">
                ⚠ CONFIDENCIAL
              </span>
            </div>

            {/* Score central */}
            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Score de Confiança Digital
              </p>
              <ScoreRing score={Math.round(report.total_score)} level={report.level} size={140} />
              <div className="mt-4 mb-3">
                <Badge variant={LEVEL_BADGE[report.level]}>
                  {LEVEL_LABEL[report.level]}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 font-mono mb-4">
                Análise gerada em {new Date(report.created_at).toLocaleString('pt-BR')}
              </p>

              {/* Consulta jurídica */}
              {report.has_judicial_check && (
                <div className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-2">
                  <span className="text-xl flex-shrink-0">⚖️</span>
                  <p className="text-xs text-amber-800 text-left leading-relaxed">
                    <strong>Consulta jurídica realizada.</strong> Registros públicos foram verificados como parte desta análise.
                  </p>
                </div>
              )}

              {/* Barra desfocada — indica que há mais conteúdo */}
              <div className="w-full mt-4 space-y-2 relative">
                <div className="h-8 bg-gray-100 rounded-lg filter blur-sm opacity-60" />
                <div className="h-8 bg-gray-100 rounded-lg filter blur-sm opacity-40" />
                <div className="h-8 bg-gray-100 rounded-lg filter blur-sm opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
              </div>
            </div>

            {/* Paywall */}
            <div className="px-4 sm:px-8 pb-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl mb-4">🔒</div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                Encontramos informações adicionais relevantes
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-sm">
                Para visualizar o relatório completo — riscos identificados, evidências,
                análise detalhada e recomendações — adquira um plano.
              </p>

              {/* Benefícios */}
              <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left space-y-2">
                {[
                  'Score detalhado por categoria',
                  'Análise completa por IA',
                  'Riscos e evidências identificados',
                  'Consulta jurídica detalhada',
                  'Histórico completo de verificações',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-blue-800">
                    <span className="text-blue-500 flex-shrink-0">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Botões */}
              <div className="w-full space-y-2">
                <Link href="/settings" className="block w-full">
                  <Button size="lg" className="w-full justify-center text-sm">
                    🔓 Desbloquear Relatório Completo
                  </Button>
                </Link>
                <Link href="/settings" className="block w-full">
                  <Button variant="ghost" size="md" className="w-full justify-center text-sm">
                    Ver planos disponíveis →
                  </Button>
                </Link>
              </div>

              <p className="text-[10px] text-gray-400 mt-4 font-mono">
                Acesso imediato após assinatura · Cancele quando quiser
              </p>
            </div>

            {/* Rodapé */}
            <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 text-center">
              <p className="text-[10px] text-gray-400 font-mono">
                DOCUMENTO RESTRITO · VETRA © {new Date().getFullYear()} · LGPD COMPLIANT
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── RELATÓRIO COMPLETO (usuário premium) ────────────────────
  const explanation = report.explanation as any;
  const breakdown = explanation?.breakdown || {};
  const factors = explanation?.factors || [];
  const ai = explanation?.ai_analysis;
  const datajud = explanation?.datajud;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4 px-0 sm:px-0">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-gray-400 hover:text-blue-600">Painel</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-medium">Relatório Completo</span>
        </div>

        {/* Header do relatório */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">V</span>
              </div>
              <span className="text-xs text-slate-300 font-mono">Vetra · Relatório de Confiança Digital</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono">⚠ CONFIDENCIAL</span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:block">ID: {report.id?.slice(0,8).toUpperCase()}</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-2 mx-auto sm:mx-0">
              <ScoreRing score={Math.round(report.total_score)} level={report.level} size={110} />
              <Badge variant={LEVEL_BADGE[report.level]}>{LEVEL_LABEL[report.level]}</Badge>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{report.title}</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{report.summary}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {report.subject_email && <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-mono">✉ {report.subject_email}</span>}
                {report.subject_phone && <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-mono">☎ {report.subject_phone}</span>}
                {report.subject_username && <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-mono">@ {report.subject_username}</span>}
              </div>
              <p className="text-[10px] text-gray-400 font-mono">
                {new Date(report.created_at).toLocaleString('pt-BR')} · Powered by Gemini AI
              </p>
            </div>
          </div>
          <div className="bg-gray-50 border-t border-gray-100 px-4 py-1.5 text-center">
            <p className="text-[10px] text-gray-400 font-mono">DOCUMENTO RESTRITO PARA FINS DE ANÁLISE DIGITAL · VETRA © {new Date().getFullYear()} · LGPD COMPLIANT</p>
          </div>
        </div>

        {/* Score + Fatores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Score por categoria</h2>
            <div className="space-y-3">
              {Object.entries(breakdown).map(([key,val]:[string,any]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{CAT_LABEL[key]||key}</span>
                    <span className="text-[10px] text-gray-400 font-mono">peso {Math.round((val.weight||0)*100)}%</span>
                  </div>
                  <ScoreBar score={val.score||0} label="" />
                  {val.signals?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {val.signals.slice(0,4).map((s:string,i:number) => (
                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${s.startsWith('✓')?'bg-emerald-50 text-emerald-600':'bg-red-50 text-red-500'}`}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Fatores de impacto</h2>
            <div className="space-y-2">
              {factors.length === 0 && <p className="text-xs text-gray-400">Nenhum fator identificado.</p>}
              {factors.map((f:any,i:number) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${f.positive?'bg-emerald-50 border-emerald-200':'bg-red-50 border-red-200'}`}>
                  <span className={`text-xs mt-0.5 flex-shrink-0 ${f.positive?'text-emerald-600':'text-red-500'}`}>{f.positive?'▲':'▽'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{f.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${f.positive?'text-emerald-600':'text-red-500'}`}>+{f.contribution}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Consulta jurídica */}
        {datajud && (
          <Card style={{
            background: datajud.risk_level==='high'?'rgba(239,68,68,0.03)':datajud.risk_level==='medium'?'rgba(251,191,36,0.03)':'rgba(16,185,129,0.03)',
            border: `1px solid ${datajud.risk_level==='high'?'rgba(239,68,68,0.2)':datajud.risk_level==='medium'?'rgba(251,191,36,0.2)':'rgba(16,185,129,0.2)'}`,
          }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-base flex-shrink-0">⚖️</div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Registros Judiciais Públicos</h2>
                  <p className="text-[10px] text-gray-400 font-mono">Consulta jurídica</p>
                </div>
              </div>
              <Badge variant={datajud.risk_level==='none'?'green':datajud.risk_level==='low'?'blue':datajud.risk_level==='medium'?'yellow':'red'}>
                {datajud.risk_level==='none'?'✓ Sem registros':datajud.risk_level==='low'?'Risco baixo':datajud.risk_level==='medium'?'Risco médio':'⚠ Risco alto'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{datajud.summary}</p>
            {datajud.total_records > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  {label:'Alto risco',count:datajud.risk_breakdown?.high_risk_count??0,c:'red'},
                  {label:'Médio',count:datajud.risk_breakdown?.medium_risk_count??0,c:'amber'},
                  {label:'Baixo',count:datajud.risk_breakdown?.low_risk_count??0,c:'blue'},
                ].map(item => (
                  <div key={item.label} className={`text-center p-2.5 rounded-xl bg-${item.c}-50 border border-${item.c}-100`}>
                    <p className={`text-lg font-bold text-${item.c}-600`}>{item.count}</p>
                    <p className={`text-[10px] text-${item.c}-500`}>{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Análise IA */}
        {ai && (
          <Card style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.03),rgba(56,189,248,0.03))', border:'1px solid rgba(124,58,237,0.15)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-sm flex-shrink-0">✦</div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Análise por Inteligência Artificial</h2>
                <span className="text-[10px] text-violet-600 font-mono">Gemini AI</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed italic">"{ai.summary}"</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{ai.interpretation}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {ai.risk_flags?.length > 0 && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-3">
                  <p className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">⚠ Pontos de atenção</p>
                  <ul className="space-y-1">{ai.risk_flags.map((f:string,i:number) => <li key={i} className="text-xs text-amber-700 flex gap-1.5"><span>•</span>{f}</li>)}</ul>
                </div>
              )}
              {ai.positive_highlights?.length > 0 && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3">
                  <p className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">✓ Destaques positivos</p>
                  <ul className="space-y-1">{ai.positive_highlights.map((h:string,i:number) => <li key={i} className="text-xs text-emerald-700 flex gap-1.5"><span>•</span>{h}</li>)}</ul>
                </div>
              )}
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 mb-3">
              <p className="text-[10px] font-bold text-blue-700 mb-1 uppercase">→ Recomendação</p>
              <p className="text-sm text-blue-800">{ai.recommendation}</p>
            </div>
            <p className="text-[10px] text-gray-400 font-mono border-t border-gray-100 pt-3">◷ {ai.confidence_note}</p>
          </Card>
        )}

        {/* Tabela de sinais — scroll horizontal no mobile */}
        {signals.length > 0 && (
          <Card>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Sinais detectados <span className="text-gray-400 font-normal normal-case">({signals.length})</span>
            </h2>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Sinal','Categoria','Fonte','Peso','Resultado','Contribuição'].map(h => (
                      <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 pb-2.5 pr-3 font-mono whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {signals.map((s:any,i:number) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 pr-3 text-xs font-mono text-gray-700 whitespace-nowrap">{(s.signal_name||'').replace(/_/g,' ')}</td>
                      <td className="py-2 pr-3"><Badge variant={s.signal_type==='social'?'blue':s.signal_type==='identity'?'purple':'gray'}>{SIGNAL_TYPE_LABEL[s.signal_type]||s.signal_type}</Badge></td>
                      <td className="py-2 pr-3 text-[10px] text-gray-400 font-mono whitespace-nowrap">{s.source}</td>
                      <td className="py-2 pr-3 text-xs text-gray-500 font-mono">{s.weight}</td>
                      <td className="py-2 pr-3"><span className={`text-xs font-semibold ${s.value?.result?'text-emerald-600':'text-red-500'}`}>{s.value?.result?'✓ Positivo':'✗ Negativo'}</span></td>
                      <td className="py-2"><span className={`text-xs font-mono font-semibold ${s.score_contribution>0?'text-emerald-600':'text-gray-300'}`}>{s.score_contribution>0?`+${s.score_contribution}`:'0'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-mono">DOCUMENTO RESTRITO · VETRA © {new Date().getFullYear()} · ID {report.id?.slice(0,8).toUpperCase()}</p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
