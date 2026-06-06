'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { ScoreRing } from '@/components/ScoreRing';
import { Card, StatCard, Badge, SkeletonCard, EmptyState, Button } from '@/components/ui/index';
import { api, Report } from '@/lib/api';

const LEVEL_BADGE: Record<string, any> = {
  very_high: 'green', high: 'blue', medium: 'yellow', low: 'red', very_low: 'red',
};
const LEVEL_LABEL: Record<string, string> = {
  very_high: 'Excelente', high: 'Alto', medium: 'Médio', low: 'Baixo', very_low: 'Muito Baixo',
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({ total: 0, avg: 0, high: 0 });

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.reports.list()
      .then(({ reports }) => {
        setReports(reports);
        if (reports.length > 0) {
          const avg = Math.round(reports.reduce((s, r) => s + r.total_score, 0) / reports.length);
          const high = reports.filter(r => ['high', 'very_high'].includes(r.level)).length;
          setStats({ total: reports.length, avg, high });
        }
      })
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, [user]);

  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-4 px-0 sm:px-0">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              Olá, {user.full_name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Painel de análises de confiança digital</p>
          </div>
          <div className="flex-shrink-0">
            {user.credits > 0 || user.credits === 999 ? (
              <Link href="/verify">
                <Button size="sm">+ Nova</Button>
              </Link>
            ) : (
              <Link href="/settings">
                <Button size="sm" variant="danger">⚠ Créditos</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Verificações" value={stats.total} icon="🔍" color="blue" />
          <StatCard label="Score médio" value={stats.avg || '—'} icon="📊" color="purple" />
          <StatCard label="Alta confiança" value={stats.high} icon="✓" color="green" />
          <StatCard
            label="Plano"
            value={user.plan === 'premium' ? 'Pro' : user.plan === 'enterprise' ? 'Power' : 'Grátis'}
            icon="⭐"
            color="amber"
          />
        </div>

        {/* Relatórios recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Verificações recentes
            </h2>
            <Link href="/history" className="text-xs text-blue-600 hover:underline">
              Ver tudo →
            </Link>
          </div>

          {loadingData ? (
            <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : reports.length === 0 ? (
            <Card>
              <EmptyState
                icon="🔍"
                title="Nenhuma verificação ainda"
                description="Inicie sua primeira análise de presença digital."
                action={<Link href="/verify"><Button size="md">Fazer primeira verificação</Button></Link>}
              />
            </Card>
          ) : (
            <div className="space-y-2">
              {reports.slice(0, 8).map(report => (
                <Link key={report.id} href={`/report/${report.id}`} className="block group">
                  <Card hover>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <ScoreRing score={Math.round(report.total_score)} level={report.level} size={48} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px] sm:max-w-none">{report.title}</p>
                          <Badge variant={LEVEL_BADGE[report.level] || 'gray'}>
                            {LEVEL_LABEL[report.level]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-0.5">
                          {report.subject_email && (
                            <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-mono border border-gray-100 truncate max-w-[120px]">
                              ✉ {report.subject_email}
                            </span>
                          )}
                          {report.subject_username && (
                            <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-mono border border-gray-100">
                              @ {report.subject_username}
                            </span>
                          )}
                          {report.subject_phone && (
                            <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-mono border border-gray-100">
                              ☎ {report.subject_phone}
                            </span>
                          )}
                        </div>
                        {report.summary && (
                          <p className="text-[11px] text-gray-400 truncate hidden sm:block">{report.summary}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-[10px] text-gray-400 font-mono">
                          {new Date(report.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <span className="text-gray-300 group-hover:text-blue-500 transition-colors text-sm mt-1 block">→</span>
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-semibold text-gray-700">Status dos serviços</p>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'API', ok: true },
                { label: 'IA', ok: true },
                { label: 'Instagram', ok: true },
                { label: 'Jurídico', ok: true },
                { label: 'Banco', ok: true },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-[11px] text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </AppLayout>
  );
}
