'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { ScoreRing } from '@/components/ScoreRing';
import { Card, StatCard, Badge, SkeletonCard, EmptyState, Button } from '@/components/ui/index';
import { api, Report } from '@/lib/api';

const LEVEL_BADGE: Record<string,any> = { very_high:'green', high:'blue', medium:'yellow', low:'red', very_low:'red' };
const LEVEL_LABEL: Record<string,string> = { very_high:'Excelente', high:'Alto', medium:'Médio', low:'Baixo', very_low:'Muito Baixo' };

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({ total:0, avg:0, high:0 });

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.reports.list()
      .then(({ reports }) => {
        setReports(reports);
        if (reports.length > 0) {
          const avg = Math.round(reports.reduce((s,r) => s + r.total_score, 0) / reports.length);
          const high = reports.filter(r => ['high','very_high'].includes(r.level)).length;
          setStats({ total: reports.length, avg, high });
        }
      })
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, [user]);

  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Olá, {user.full_name.split(' ')[0]} 👋</h1>
            <p className="text-xs text-gray-500 mt-0.5">Painel de análises de confiança digital</p>
          </div>
          <Link href="/verify" className="w-full sm:w-auto">
            <Button size="md" className="w-full sm:w-auto justify-center">+ Nova Verificação</Button>
          </Link>
        </div>

        {/* Stats — 2 cols mobile / 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} icon="🔍" color="blue" />
          <StatCard label="Score médio" value={stats.avg || '—'} icon="📊" color="purple" />
          <StatCard label="Alta confiança" value={stats.high} icon="✓" color="green" />
          <StatCard label="Plano" value={user.plan==='premium'?'Pro':user.plan==='enterprise'?'Power':'Grátis'} icon="⭐" color="amber" />
        </div>

        {/* Relatórios */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Verificações recentes</h2>
            <Link href="/history" className="text-xs text-blue-600 hover:underline">Ver histórico →</Link>
          </div>

          {loadingData ? (
            <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : reports.length === 0 ? (
            <Card>
              <EmptyState icon="🔍" title="Nenhuma verificação ainda"
                description="Inicie sua primeira análise para ver resultados aqui."
                action={<Link href="/verify"><Button size="md">Fazer primeira verificação</Button></Link>} />
            </Card>
          ) : (
            <div className="space-y-2">
              {reports.slice(0,8).map(report => (
                <Link key={report.id} href={`/report/${report.id}`} className="block group">
                  <Card hover>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <ScoreRing score={Math.round(report.total_score)} level={report.level} size={48} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 truncate">{report.title}</p>
                          <Badge variant={LEVEL_BADGE[report.level]||'gray'}>{LEVEL_LABEL[report.level]}</Badge>
                        </div>
                        <div className="hidden sm:flex flex-wrap gap-1.5">
                          {report.subject_email && <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-mono border border-gray-100">✉ {report.subject_email}</span>}
                          {report.subject_username && <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-mono border border-gray-100">@ {report.subject_username}</span>}
                          {report.subject_phone && <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-mono border border-gray-100">☎ {report.subject_phone}</span>}
                        </div>
                        <p className="sm:hidden text-xs text-gray-400 truncate">{report.summary}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-[10px] text-gray-400 font-mono whitespace-nowrap">{new Date(report.created_at).toLocaleDateString('pt-BR')}</p>
                        <span className="text-gray-300 group-hover:text-blue-500 text-sm block mt-1">→</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Status dos serviços</p>
              <p className="text-xs text-gray-400">Integrações ativas</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {['API','Gemini AI','Instagram','Análise jurídica','Banco'].map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-gray-500">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
