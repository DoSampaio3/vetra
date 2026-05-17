'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { ScoreRing } from '@/components/ScoreRing';
import { api, VerifyInput } from '@/lib/api';

export default function VerifyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<VerifyInput>({
    email: '',
    phone: '',
    username: '',
    cpf: '',
    birth_date: '',
  });
  const [preview, setPreview] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const handlePreview = async () => {
    const hasData = Object.values(form).some(v => v.trim());
    if (!hasData) {
      setError('Preencha ao menos um campo');
      return;
    }
    setPreviewing(true);
    setError('');
    try {
      const clean = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v.trim())
      ) as VerifyInput;
      const result = await api.verify.analyze(clean);
      setPreview(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async () => {
    if (!consent) {
      setError('Confirme o consentimento para prosseguir');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const clean = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v.trim())
      ) as VerifyInput;
      const result = await api.verify.submit(clean);
      router.push(`/report/${result.report_id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  const fields = [
    { key: 'email', label: 'Email', placeholder: 'usuario@exemplo.com', type: 'email', icon: '✉' },
    { key: 'phone', label: 'Telefone', placeholder: '(11) 99999-9999', type: 'tel', icon: '☎' },
    { key: 'username', label: 'Username (Instagram, etc)', placeholder: '@usuario', type: 'text', icon: '@' },
    { key: 'cpf', label: 'CPF (Mock — não verificado em base real)', placeholder: '000.000.000-00', type: 'text', icon: '#' },
    { key: 'birth_date', label: 'Data de Nascimento', placeholder: '', type: 'date', icon: '◷' },
  ] as const;

  const levelColor: Record<string, string> = {
    very_high: 'var(--green)',
    high: 'var(--accent)',
    medium: 'var(--yellow)',
    low: 'var(--orange)',
    very_low: 'var(--red)',
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px', maxWidth: '760px' }}>

        <div className="animate-in">
          <h1 style={styles.h1}>Nova Verificação</h1>
          <p style={styles.subtitle}>
            Informe os dados que deseja analisar. Apenas fontes públicas e consentidas são utilizadas.
          </p>
        </div>

        <div style={styles.grid}>
          {/* Form */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={styles.sectionTitle}>Dados para análise</p>

            {fields.map(field => (
              <div key={field.key}>
                <label className="label">
                  <span style={{ color: 'var(--accent)', marginRight: '6px' }}>{field.icon}</span>
                  {field.label}
                </label>
                <input
                  className="input"
                  type={field.type}
                  placeholder={'placeholder' in field ? field.placeholder : ''}
                  value={form[field.key as keyof VerifyInput]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                />
              </div>
            ))}

            {/* Consent */}
            <div style={styles.consentBox}>
              <label style={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: '16px', height: '16px', flexShrink: 0 }}
                />
                <span>
                  Declaro que tenho consentimento para analisar estes dados e concordo com os{' '}
                  <span style={{ color: 'var(--accent)' }}>Termos de Uso</span> da plataforma.
                  Nenhum dado privado ou governamental será acessado.
                </span>
              </label>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.actions}>
              <button
                onClick={handlePreview}
                className="btn btn-ghost"
                disabled={previewing}
              >
                {previewing ? '...' : '◎ Pré-visualizar'}
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={submitting || !consent}
              >
                {submitting ? 'Analisando...' : 'Gerar Relatório →'}
              </button>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="card animate-in" style={styles.preview}>
              <p style={styles.sectionTitle}>Prévia do Score</p>
              <div style={styles.previewCenter}>
                <ScoreRing score={preview.total_score} level={preview.level} size={120} />
              </div>

              <div style={styles.breakdown}>
                {Object.entries(preview.breakdown || {}).map(([key, val]: [string, any]) => (
                  <div key={key} style={styles.breakdownRow}>
                    <span style={styles.breakdownLabel}>{key}</span>
                    <div style={styles.breakdownBar}>
                      <div
                        style={{
                          ...styles.breakdownFill,
                          width: `${val.score}%`,
                          background: levelColor[preview.level] || 'var(--accent)',
                        }}
                      />
                    </div>
                    <span style={styles.breakdownValue}>{val.score}</span>
                  </div>
                ))}
              </div>

              <p style={styles.previewNote}>
                ◈ {preview.signals_found} sinais identificados
              </p>
            </div>
          )}

          {!preview && (
            <div className="card" style={styles.infoCard}>
              <p style={styles.sectionTitle}>Como funciona</p>
              <div style={styles.steps}>
                {[
                  ['◎', 'Sinais públicos', 'Analisamos padrões em dados públicos e fornecidos.'],
                  ['◈', 'Score calculado', 'Algoritmo ponderado gera score de 0 a 100.'],
                  ['◉', 'Relatório gerado', 'Explicação detalhada dos fatores encontrados.'],
                ].map(([icon, title, desc]) => (
                  <div key={title as string} style={styles.step}>
                    <span style={styles.stepIcon}>{icon}</span>
                    <div>
                      <p style={styles.stepTitle}>{title}</p>
                      <p style={styles.stepDesc}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h1: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: 400,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    marginBottom: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  consentBox: {
    background: 'rgba(99, 179, 237, 0.04)',
    border: '1px solid rgba(99, 179, 237, 0.12)',
    borderRadius: '8px',
    padding: '14px',
  },
  consentLabel: {
    display: 'flex',
    gap: '10px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    cursor: 'pointer',
    alignItems: 'flex-start',
  },
  error: {
    background: 'rgba(252, 129, 129, 0.08)',
    border: '1px solid rgba(252, 129, 129, 0.2)',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--red)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  preview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  previewCenter: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
  },
  breakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  breakdownLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    width: '80px',
    flexShrink: 0,
    textTransform: 'capitalize',
  },
  breakdownBar: {
    flex: 1,
    height: '4px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.8s ease',
  },
  breakdownValue: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    width: '28px',
    textAlign: 'right',
    flexShrink: 0,
  },
  previewNote: {
    fontSize: '11px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
    textAlign: 'center',
  },
  infoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  step: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
  },
  stepIcon: {
    fontSize: '20px',
    color: 'var(--accent)',
    flexShrink: 0,
    marginTop: '1px',
    opacity: 0.7,
  },
  stepTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: '3px',
  },
  stepDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
};
