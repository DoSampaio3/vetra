'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

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
          {sent ? (
            <div style={styles.successState}>
              <div style={styles.successIcon}>✉</div>
              <h2 style={styles.title}>Verifique seu email</h2>
              <p style={styles.description}>
                Enviamos as instruções para <strong style={{ color: 'var(--text)' }}>{email}</strong>.
                O link expira em 1 hora.
              </p>
              <p style={styles.hint}>
                Não recebeu? Confira o spam ou{' '}
                <button style={styles.retryBtn} onClick={() => setSent(false)}>tente novamente</button>.
              </p>
              <Link href="/login" style={styles.backLink}>← Voltar ao login</Link>
            </div>
          ) : (
            <>
              <div>
                <h2 style={styles.title}>Esqueceu sua senha?</h2>
                <p style={styles.description}>
                  Informe seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="voce@exemplo.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
                {error && <p style={styles.error}>{error}</p>}
                <button type="submit" className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>
              <div style={{ textAlign: 'center' }}>
                <Link href="/login" style={styles.backLink}>← Voltar ao login</Link>
              </div>
            </>
          )}
        </div>
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
  title: { fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: 0 },
  description: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '8px 0 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  error: { background: 'rgba(252, 129, 129, 0.08)', border: '1px solid rgba(252, 129, 129, 0.2)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: 'var(--red)' },
  backLink: { fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' },
  successState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' },
  successIcon: { fontSize: '40px', lineHeight: 1, color: 'var(--accent)' },
  hint: { fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 },
  retryBtn: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '13px', padding: 0, textDecoration: 'underline' },
};
