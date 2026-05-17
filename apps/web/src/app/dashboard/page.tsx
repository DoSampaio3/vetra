'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { ScoreRing } from '@/components/ScoreRing';
import { api, Report } from '@/lib/api';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({ total: 0, avg: 0, high: 0 });

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

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

  const levelColor: Record<string, string> = {
    very_high: 'var(--green)',
    high: 'var(--accent)',
    medium: 'var(--yellow)',
    low: 'var(--orange)',
    very_low: 'var(--red)',
  };

  const levelLabel: Record<string, string> = {
    very_high: 'Excelente',
    high: 'Alto',
    medium: 'Médio',
    low: 'Baixo',
    very_low: 'Muito Baixo',
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>

        {/* Header */}
        <div style={styles.header} className="animate-in">
          <div>
            <h1 style={styles.h1}>
              Olá, {user.full_name.split(' ')[0]}
            </h1>
            <p style={styles.subtitle}>
              Painel de análises de confiança digital
            </p>
          </div>
          <Link href="/verify" className="btn btn-primary">
            <span>+</span> Nova Verificação
          </Link>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid} className="animate-in">
          {[
            { label: 'Total de Verificações', value: stats.total, icon: '◎' },
            { label: 'Score Médio', value: stats.avg || '—', icon: '◈' },
            { label: 'Alta Confiança', value: stats.high, icon: '◉' },
          ].map((stat, i) => (
            <div key={i} className="card" style={styles.statCard}>
              <span style={styles.statIcon}>{stat.icon}</span>
              <div>
                <p style={styles.statValue}>{stat.value}</p>
                <p style={styles.statLabel}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reports */}
        <div style={styles.section}>
          <h2 style={styles.h2}>Relatórios Recentes</h2>

          {loadingData ? (
            <div style={styles.loading}>
              <div style={styles.loadingDot} />
              <span>Carregando relatórios...</span>
            </div>
          ) : reports.length === 0 ? (
            <div style={styles.empty}>
              <span style={styles.emptyIcon}>◎</span>
              <p style={styles.emptyTitle}>Nenhuma verificação ainda</p>
              <p style={styles.emptyText}>
                Inicie uma nova verificação para gerar seu primeiro relatório de confiança.
              </p>
              <Link href="/verify" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Iniciar verificação
              </Link>
            </div>
          ) : (
            <div style={styles.reportsList}>
              {reports.map((report, i) => (
                <Link
                  key={report.id}
                  href={`/report/${report.id}`}
                  style={{
                    ...styles.reportCard,
                    animationDelay: `${i * 0.06}s`,
                  }}
                  className="animate-in"
                >
                  <div style={styles.reportLeft}>
                    <ScoreRing score={Math.round(report.total_score)} level={report.level} size={72} />
                    <div style={styles.reportInfo}>
                      <div style={styles.reportTitle}>{report.title}</div>
                      <div style={styles.reportMeta}>
                        {report.subject_email && (
                          <span style={styles.metaChip}>✉ {report.subject_email}</span>
                        )}
                        {report.subject_username && (
                          <span style={styles.metaChip}>@ {report.subject_username}</span>
                        )}
                        {report.subject_phone && (
                          <span style={styles.metaChip}>☎ {report.subject_phone}</span>
                        )}
                      </div>
                      <p style={styles.reportSummary}>{report.summary}</p>
                    </div>
                  </div>
                  <div style={styles.reportRight}>
                    <span
                      style={{
                        ...styles.levelBadge,
                        color: levelColor[report.level],
                        background: `${levelColor[report.level]}18`,
                        borderColor: `${levelColor[report.level]}30`,
                      }}
                    >
                      {levelLabel[report.level]}
                    </span>
                    <span style={styles.reportDate}>
                      {new Date(report.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span style={styles.arrow}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '36px',
  },
  h1: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    fontWeight: 400,
    color: 'var(--text)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '40px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
  },
  statIcon: {
    fontSize: '24px',
    color: 'var(--accent)',
    lineHeight: 1,
    opacity: 0.7,
  },
  statValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '28px',
    fontWeight: 400,
    color: 'var(--text)',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  h2: {
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-dim)',
    fontSize: '14px',
    padding: '40px 0',
  },
  loadingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--accent)',
    animation: 'pulse-glow 1.5s infinite',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '64px 24px',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-lg)',
  },
  emptyIcon: {
    fontSize: '48px',
    color: 'var(--text-dim)',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontFamily: 'var(--font-display)',
    color: 'var(--text)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    maxWidth: '320px',
  },
  reportsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  reportCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px 24px',
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  reportLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: 1,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: '6px',
  },
  reportMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '8px',
  },
  metaChip: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    background: 'var(--bg-card2)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: 'var(--font-mono)',
  },
  reportSummary: {
    fontSize: '12px',
    color: 'var(--text-dim)',
    lineHeight: 1.4,
  },
  reportRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    flexShrink: 0,
    marginLeft: '20px',
  },
  levelBadge: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: '100px',
    border: '1px solid',
    fontFamily: 'var(--font-mono)',
  },
  reportDate: {
    fontSize: '11px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
  },
  arrow: {
    fontSize: '16px',
    color: 'var(--text-dim)',
  },
};
