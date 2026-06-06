'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import MarketingNav from '@/components/marketing/layout/MarketingNav';

const PLANS: Record<string, { name: string; price: string; description: string; color: string }> = {
  explorer:     { name: 'Explorar',    price: 'R$ 49,90',     description: '1 relatório completo · Pagamento único',  color: '#6b8ba4' },
  pro:          { name: 'Pro Insight', price: 'R$ 97,90/mês', description: '10 relatórios/mês · Cancele quando quiser', color: '#63b3ed' },
  'pro-annual': { name: 'Pro Insight', price: 'R$ 77,90/mês', description: '10 relatórios/mês · Cobrado anualmente',    color: '#63b3ed' },
  power:        { name: 'Vetra Power', price: 'R$ 197,90/mês', description: 'Ilimitado · API · Prioridade',              color: '#68d391' },
  'power-annual':{ name: 'Vetra Power',price: 'R$ 157,90/mês', description: 'Ilimitado · API · Cobrado anualmente',      color: '#68d391' },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get('plan') || 'explorer';
  const plan = PLANS[planKey] || PLANS['explorer'];

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'register') {
        const { token } = await api.auth.register(form.email, form.password, form.full_name);
        localStorage.setItem('vetra_token', token);
      } else {
        const { token } = await api.auth.login(form.email, form.password);
        localStorage.setItem('vetra_token', token);
      }
      // Redireciona para checkout com plano selecionado
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.wrapper}>

        {/* Plano selecionado */}
        <div style={{ ...styles.planBadge, borderColor: plan.color + '40', background: plan.color + '10' }}>
          <span style={{ ...styles.planDot, background: plan.color }} />
          <div>
            <span style={{ ...styles.planName, color: plan.color }}>{plan.name}</span>
            <span style={styles.planPrice}> · {plan.price}</span>
          </div>
          <Link href="/#planos" style={styles.changePlan}>trocar plano</Link>
        </div>

        <h1 style={styles.title}>
          {mode === 'register' ? 'Crie sua conta' : 'Entre na sua conta'}
        </h1>
        <p style={styles.subtitle}>{plan.description}</p>

        <div style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {(['register', 'login'] as const).map(tab => (
              <button key={tab} onClick={() => setMode(tab)} style={{
                ...styles.tab,
                ...(mode === tab ? styles.tabActive : {}),
              }}>
                {tab === 'register' ? 'Criar conta' : 'Já tenho conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {mode === 'register' && (
              <div>
                <label style={styles.label}>Nome completo</label>
                <input className="input" type="text" placeholder="Seu nome completo"
                  value={form.full_name} required
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
            )}
            <div>
              <label style={styles.label}>Email</label>
              <input className="input" type="email" placeholder="voce@exemplo.com"
                value={form.email} required
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label style={styles.label}>Senha</label>
              <input className="input" type="password"
                placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                value={form.password} required
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {mode === "login" && (
              <div style={{textAlign:"center"}}>
                <a href="/forgot-password" style={{fontSize:"12px",color:"var(--accent)",textDecoration:"none",opacity:0.8}}>Esqueci minha senha</a>
              </div>
            )}

            <button type="submit" disabled={submitting} style={{
              ...styles.cta,
              background: plan.color,
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Aguarde...' : mode === 'register' ? `Continuar para pagamento →` : `Entrar e continuar →`}
            </button>
          </form>

          <p style={styles.trust}>🔒 Dados protegidos · Pagamento seguro via Stripe</p>
        </div>

        <p style={styles.login}>
          Já tem conta?{' '}
          <button onClick={() => setMode('login')} style={styles.loginLink}>
            Entrar aqui
          </button>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <MarketingNav />
      <Suspense>
        <RegisterForm />
      </Suspense>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px', position: 'relative' },
  bg: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,179,237,0.07) 0%, transparent 70%)', pointerEvents: 'none' },
  wrapper: { width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  planBadge: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1px solid', fontSize: '13px' },
  planDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  planName: { fontWeight: 600, fontFamily: 'var(--font-mono)' },
  planPrice: { color: 'var(--text-muted)', fontSize: '12px' },
  changePlan: { marginLeft: 'auto', fontSize: '11px', color: 'var(--text-dim)', textDecoration: 'underline' },
  title: { fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--text)', textAlign: 'center' },
  subtitle: { fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '-10px' },
  card: { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' },
  tabs: { display: 'flex', borderBottom: '1px solid var(--border)' },
  tab: { flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s', marginBottom: '-1px' },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '6px' },
  error: { background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: 'var(--red)' },
  cta: { width: '100%', padding: '13px', borderRadius: '8px', border: 'none', color: '#080c0f', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-sans)' },
  trust: { textAlign: 'center' as const, fontSize: '11px', color: 'var(--text-dim)' },
  login: { fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' as const },
  loginLink: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' },
};
