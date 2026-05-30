'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    api.auth.validateResetToken(token)
      .then(({ valid }) => setTokenValid(valid))
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.');
    if (password !== confirm) return setError('As senhas não coincidem.');
    setSubmitting(true);
    try {
      const { token: jwtToken } = await api.auth.resetPassword(token, password);
      localStorage.setItem('vetra_token', jwtToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha.');
    } finally {
      setSubmitting(false);
    }
  };

  function getStrength(p: string): number {
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }
  function strengthColor(p: string, seg: number): string {
    const s = getStrength(p);
    if (s < seg) return 'var(--border)';
    if (s <= 1) return '#fc8181';
    if (s === 2) return '#f6ad55';
    if (s === 3) return '#68d391';
    return 'var(--accent)';
  }
  const strengthLabels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  if (tokenValid === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Verificando link...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div style={styles.page}>
        <div style={styles.bg} />
        <div style={styles.wrapper}>
          <div style={styles.logo}><span style={styles.logoMark}>◈</span><span style={styles.logoText}>VETRA</span></div>
          <div style={styles.card}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', color: 'var(--red)', marginBottom: '12px' }}>✕</div>
              <h2 style={styles.title}>Link inválido ou expirado</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>
                Links de redefinição expiram após 1 hora.
              </p>
            </div>
            <Link href="/forgot-password" className="btn btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
              Solicitar novo link
            </Link>
            <div style={{ textAlign: 'center' }}>
              <Link href="/login" style={styles.backLink}>← Voltar ao login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.wrapper} className="animate-in">
        <div style={styles.logo}><span style={styles.logoMark}>◈</span><span style={styles.logoText}>VETRA</span></div>
        <p style={styles.tagline}>Sinais de Confiança Digital</p>

        <div style={styles.card}>
          <div>
            <h2 style={styles.title}>Criar nova senha</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>
              Escolha uma senha segura com pelo menos 8 caracteres.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label className="label">Nova senha</label>
              <input className="input" type="password" placeholder="Mínimo 8 caracteres"
                value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
            </div>

            {password.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', transition: 'background 0.2s', background: strengthColor(password, i) }} />
                ))}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px', minWidth: '48px' }}>
                  {strengthLabels[getStrength(password)]}
                </span>
              </div>
            )}

            <div>
              <label className="label">Confirmar nova senha</label>
              <input className="input" type="password" placeholder="Repita a senha"
                value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
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
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  error: { background: 'rgba(252, 129, 129, 0.08)', border: '1px solid rgba(252, 129, 129, 0.2)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: 'var(--red)' },
  backLink: { fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' },
};
