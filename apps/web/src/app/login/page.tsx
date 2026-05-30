'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { user, login, register, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'entrar' | 'cadastrar'>('entrar');
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'entrar') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.full_name);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.wrapper} className="animate-in">
        <div style={styles.logo}>
          <span style={styles.logoMark}>◈</span>
          <span style={styles.logoText}>VETRA</span>
        </div>
        <p style={styles.tagline}>Sinais de Confiança Digital</p>

        <div style={styles.card}>
          <div style={styles.tabs}>
            {(['entrar', 'cadastrar'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                style={{ ...styles.tab, ...(mode === tab ? styles.tabActive : {}) }}
              >
                {tab === 'entrar' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {mode === 'cadastrar' && (
              <div>
                <label className="label">Nome completo</label>
                <input className="input" type="text" placeholder="Seu nome"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="voce@exemplo.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password"
                placeholder={mode === 'cadastrar' ? 'Mínimo 8 caracteres' : '••••••••'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              disabled={submitting}>
              {submitting ? 'Processando...' : mode === 'entrar' ? 'Entrar na plataforma' : 'Criar conta'}
            </button>
          </form>

          {mode === 'entrar' && (
            <div style={styles.bottomLinks}>
              <Link href="/forgot-password" style={styles.forgotLink}>
                Esqueci minha senha
              </Link>
            </div>
          )}
        </div>

        <p style={styles.footer}>
          Dados analisados com consentimento. Sem scraping ou bases privadas.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' },
  bg: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,179,237,0.06) 0%, transparent 70%)', pointerEvents: 'none' },
  wrapper: { width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { fontSize: '28px', color: 'var(--accent)', lineHeight: 1 },
  logoText: { fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 500, letterSpacing: '0.18em', color: 'var(--text)' },
  tagline: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '-12px' },
  card: { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' },
  tabs: { display: 'flex', borderBottom: '1px solid var(--border)', gap: '0', marginBottom: '4px' },
  tab: { flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s', marginBottom: '-1px' },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  forgotLink: { fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', opacity: 0.85 },
  bottomLinks: { textAlign: 'center' as const },
  error: { background: 'rgba(252, 129, 129, 0.08)', border: '1px solid rgba(252, 129, 129, 0.2)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: 'var(--red)' },
  footer: { fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', maxWidth: '320px' },
};
