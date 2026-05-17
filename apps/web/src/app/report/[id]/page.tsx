'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { ScoreRing } from '@/components/ScoreRing';
import { api, Report, Signal } from '@/lib/api';

export default function ReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    api.reports.get(id)
      .then(({ report, signals }) => {
        setReport(report);
        setSignals(signals);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingData(false));
  }, [user, id]);

  if (loading || !user) return null;

  const levelColor: Record<string, string> = {
    very_high: 'var(--green)',
    high: 'var(--accent)',
    medium: 'var(--yellow)',
    low: 'var(--orange)',
    very_low: 'var(--red)',
  };

  const catLabel: Record<string, string> = {
    identity: 'Identidade',
    social: 'Social',
    behavioral: 'Comportamental',
    consistency: 'Consistência',
  };

  if (loadingData) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={styles.centerLoader}>
          <div style={styles.loaderDot} />
          <span style={{ color: 'var(--text-dim)' }}>Carregando relatório...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={styles.centerLoader}>
          <p style={{ color: 'var(--red)' }}>{error || 'Relatório não encontrado'}</p>
          <Link href="/dashboard" className="btn btn-ghost" style={{ marginTop: '16px' }}>
            ← Voltar
          </Link>
        </div>
      </div>
    );
  }

  const explanation = report.explanation as any;
  const breakdown = explanation?.breakdown || {};
  const factors = explanation?.factors || [];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>

        {/* Breadcrumb */}
        <div style={styles.breadcrumb} className="animate-in">
          <Link href="/dashboard" style={styles.backLink}>← Dashboard</Link>
          <span style={styles.sep}>/</span>
          <span style={{ color: 'var(--text-muted)' }}>Relatório</span>
        </div>

        {/* Hero */}
        <div className="card animate-in" style={styles.hero}>
          <div style={styles.heroLeft}>
            <ScoreRing
              score={Math.round(report.total_score)}
              level={report.level}
              size={160}
            />
          </div>
          <div style={styles.heroRight}>
            <div style={styles.heroTitleRow}>
              <h1 style={styles.h1}>{report.title}</h1>
            </div>
            <p style={styles.summary}>{report.summary}</p>

            {/* Subject info */}
            <div style={styles.subjectChips}>
              {report.subject_email && (
                <div style={styles.chip}><span style={{ opacity: 0.5 }}>✉</span> {report.subject_email}</div>
              )}
              {report.subject_phone && (
                <div style={styles.chip}><span style={{ opacity: 0.5 }}>☎</span> {report.subject_phone}</div>
              )}
              {report.subject_username && (
                <div style={styles.chip}><span style={{ opacity: 0.5 }}>@</span> {report.subject_username}</div>
              )}
            </div>

            <div style={styles.heroMeta}>
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                Gerado em {new Date(report.created_at).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div style={styles.twoCol}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={styles.sectionTitle}>Breakdown por Categoria</h2>
            {Object.entries(breakdown).map(([key, val]: [string, any]) => (
              <div key={key}>
                <div style={styles.barHeader}>
                  <span style={styles.barLabel}>{catLabel[key] || key}</span>
                  <span style={styles.barWeight}>peso {(val.weight * 100).toFixed(0)}%</span>
                  <span
                    style={{
                      ...styles.barScore,
                      color: levelColor[report.level],
                    }}
                  >
                    {val.score}
                  </span>
                </div>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${val.score}%`,
                      background: levelColor[report.level],
                    }}
                  />
                </div>
                {val.signals && val.signals.length > 0 && (
                  <div style={styles.signalList}>
                    {val.signals.map((s: string, i: number) => (
                      <span key={i} style={{
                        ...styles.signalChip,
                        color: s.startsWith('✓') ? 'var(--green)' : 'var(--text-dim)',
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Factors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={styles.sectionTitle}>Fatores de Impacto</h2>
            {factors.map((factor: any, i: number) => (
              <div key={i} className="card" style={styles.factorCard}>
                <div style={styles.factorHeader}>
                  <span style={styles.factorIcon}>
                    {factor.positive ? '▲' : '▽'}
                  </span>
                  <span style={styles.factorName}>{factor.name}</span>
                  <span
                    style={{
                      ...styles.factorContrib,
                      color: factor.positive ? 'var(--green)' : 'var(--red)',
                    }}
                  >
                    +{factor.contribution}
                  </span>
                </div>
                <p style={styles.factorDesc}>{factor.description}</p>
              </div>
            ))}
            {factors.length === 0 && (
              <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
                Nenhum fator identificado.
              </p>
            )}
          </div>
        </div>

        {/* Raw signals */}
        {signals.length > 0 && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: '20px' }}>
              Sinais Detectados ({signals.length})
            </h2>
            <div style={styles.signalTable}>
              <div style={styles.signalTableHeader}>
                <span>Sinal</span>
                <span>Tipo</span>
                <span>Fonte</span>
                <span>Peso</span>
                <span>Contribuição</span>
              </div>
              {signals.map((signal, i) => (
                <div key={i} style={styles.signalTableRow}>
                  <span style={styles.signalName}>
                    <span style={{ color: signal.value?.result ? 'var(--green)' : 'var(--red)' }}>
                      {signal.value?.result ? '✓' : '✗'}
                    </span>{' '}
                    {signal.signal_name.replace(/_/g, ' ')}
                  </span>
                  <span style={styles.signalType}>{signal.signal_type}</span>
                  <span style={styles.signalSource}>{signal.source}</span>
                  <span style={styles.signalWeight}>{signal.weight}</span>
                  <span style={styles.signalContrib}>
                    {signal.score_contribution > 0 ? `+${signal.score_contribution}` : '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  centerLoader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '12px',
  },
  loaderDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--accent)',
    animation: 'pulse-glow 1.5s infinite',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    fontSize: '13px',
  },
  backLink: {
    color: 'var(--accent)',
    textDecoration: 'none',
  },
  sep: { color: 'var(--text-dim)' },
  hero: {
    display: 'flex',
    gap: '40px',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '36px',
  },
  heroLeft: { flexShrink: 0 },
  heroRight: { flex: 1 },
  heroTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  h1: {
    fontFamily: 'var(--font-display)',
    fontSize: '26px',
    fontWeight: 400,
  },
  summary: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '16px',
  },
  subjectChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },
  chip: {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    background: 'var(--bg-card2)',
    border: '1px solid var(--border)',
    padding: '4px 12px',
    borderRadius: '6px',
  },
  heroMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  barHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  barLabel: {
    flex: 1,
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text)',
  },
  barWeight: {
    fontSize: '10px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
  },
  barScore: {
    fontSize: '14px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
    width: '30px',
    textAlign: 'right',
  },
  progressTrack: {
    height: '5px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.8s ease',
  },
  signalList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  signalChip: {
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    padding: '2px 8px',
    borderRadius: '4px',
    background: 'var(--bg-card2)',
  },
  factorCard: {
    padding: '16px 20px',
  },
  factorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  factorIcon: {
    fontSize: '10px',
    color: 'var(--text-dim)',
  },
  factorName: {
    flex: 1,
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text)',
  },
  factorContrib: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 500,
  },
  factorDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  signalTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  signalTableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1.5fr 0.5fr 0.8fr',
    padding: '8px 12px',
    borderBottom: '1px solid var(--border)',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-dim)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    gap: '12px',
  },
  signalTableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1.5fr 0.5fr 0.8fr',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    gap: '12px',
    alignItems: 'center',
  },
  signalName: {
    fontSize: '12px',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
  },
  signalType: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    textTransform: 'capitalize',
  },
  signalSource: {
    fontSize: '11px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
  },
  signalWeight: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    textAlign: 'center',
  },
  signalContrib: {
    fontSize: '12px',
    color: 'var(--green)',
    fontFamily: 'var(--font-mono)',
    textAlign: 'right',
  },
};
