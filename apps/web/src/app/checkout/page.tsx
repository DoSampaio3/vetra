'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MarketingNav from '@/components/marketing/layout/MarketingNav';
import { api } from '@/lib/api';

const PLANS: Record<string, {
  name: string; price: string; priceValue: string;
  period: string; description: string; color: string; features: string[];
}> = {
  explorer: {
    name: 'Explorar', price: 'R$ 49,90', priceValue: '49,90',
    period: 'pagamento único', color: '#38bdf8',
    description: '1 relatório premium com análise completa por IA',
    features: ['1 relatório premium completo', 'Score de confiança 0–100', 'Análise por Gemini AI', 'Verificação Instagram real', 'Consulta Datajud CNJ', 'Exportação PDF'],
  },
  pro: {
    name: 'Pro Insight', price: 'R$ 97,90', priceValue: '97,90',
    period: '/mês', color: '#38bdf8',
    description: '10 relatórios por mês com histórico e PDF',
    features: ['10 relatórios/mês', 'Score de confiança 0–100', 'Análise aprofundada por IA', 'Verificação Instagram real', 'Consulta Datajud CNJ', 'Histórico completo', 'Exportação PDF premium', 'Suporte prioritário'],
  },
  power: {
    name: 'Vetra Power', price: 'R$ 197,90', priceValue: '197,90',
    period: '/mês', color: '#a78bfa',
    description: 'Pesquisas ilimitadas com API e prioridade total',
    features: ['Pesquisas ilimitadas', 'IA avançada (Gemini Pro)', 'Verificação Instagram real', 'Consulta Datajud CNJ', 'Histórico ilimitado', 'PDF + API access', 'Dashboard premium', 'Suporte dedicado'],
  },
};

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const planKey = params.get('plan') || 'explorer';
  const plan = PLANS[planKey] || PLANS['explorer'];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vetra_token') : null;
      if (!token) {
        router.push('/register?plan=' + planKey);
        return;
      }
      const res = await api.billing.createCheckout(planKey);
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        setError('Erro ao iniciar pagamento. Tente novamente.');
      }
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.toLowerCase().includes('token')) {
        router.push('/register?plan=' + planKey);
      } else {
        setError(err.message || 'Erro ao processar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.bg} />
      <div style={S.wrapper}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontFamily: 'Georgia, serif', color: 'white', marginBottom: '8px' }}>
            Finalizar compra
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(100,116,139,0.7)' }}>
            Acesso imediato após confirmação do pagamento
          </p>
        </div>

        <div style={S.grid}>

          {/* ORDER SUMMARY */}
          <div style={S.summaryCol}>
            <div style={S.sectionLabel}>Resumo do pedido</div>

            <div style={{ ...S.planCard, borderColor: plan.color + '35' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${plan.color}, transparent)`, borderRadius: '12px 12px 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: plan.color, display: 'inline-block' }} />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{plan.name}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(100,116,139,0.6)', marginLeft: '16px' }}>{plan.description}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{plan.price}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(100,116,139,0.5)' }}>{plan.period}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#34d399', flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.7)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={S.totalRow}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Total hoje</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: plan.color, fontFamily: 'monospace' }}>R$ {plan.priceValue}</span>
            </div>

            {/* Trust signals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '🔒', text: 'Pagamento 100% seguro via Stripe' },
                { icon: '⚡', text: 'Acesso liberado imediatamente após o pagamento' },
                { icon: '↩', text: 'Cancele quando quiser, sem multa' },
                { icon: '📋', text: '100% LGPD compliant' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', width: '22px', textAlign: 'center' }}>{t.icon}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(100,116,139,0.6)' }}>{t.text}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Link href="/#planos" style={{ fontSize: '12px', color: 'rgba(56,189,248,0.6)', textDecoration: 'none' }}>
                ← Trocar de plano
              </Link>
            </div>
          </div>

          {/* PAYMENT */}
          <div style={S.paymentCol}>
            <div style={S.sectionLabel}>Forma de pagamento</div>

            {/* Método badge */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
              {['Cartão de crédito', 'Pix', 'Boleto'].map(m => (
                <span key={m} style={{
                  fontSize: '11px', padding: '4px 10px', borderRadius: '6px',
                  background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
                  color: 'rgba(56,189,248,0.8)', fontFamily: 'monospace', fontWeight: 600,
                }}>{m}</span>
              ))}
            </div>

            {/* Stripe info */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '20px', marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #635bff, #7c74ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', flexShrink: 0,
                }}>💳</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Powered by Stripe</div>
                  <div style={{ fontSize: '11px', color: 'rgba(100,116,139,0.6)', marginTop: '2px' }}>
                    Você será redirecionado para a página segura do Stripe
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'rgba(148,163,184,0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399', flexShrink: 0 }}>✓</span>
                  No checkout do Stripe você escolhe: <strong style={{ color: 'rgba(148,163,184,0.9)' }}>Cartão, Pix ou Boleto</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399', flexShrink: 0 }}>✓</span>
                  QR Code Pix gerado automaticamente com validade de 24h
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399', flexShrink: 0 }}>✓</span>
                  Confirmação instantânea por email após pagamento
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399', flexShrink: 0 }}>✓</span>
                  Dados criptografados — Vetra nunca vê seu cartão
                </div>
              </div>
            </div>

            {/* Pix highlight */}
            <div style={{
              background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.18)',
              borderRadius: '12px', padding: '14px 16px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>⚡</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#34d399' }}>Pix — aprovação em segundos</div>
                <div style={{ fontSize: '11px', color: 'rgba(52,211,153,0.6)', marginTop: '2px' }}>
                  Disponível 24h por dia · Sem dados de cartão necessários
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: '13px', color: '#f87171',
              }}>⚠ {error}</div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              style={{
                ...S.payBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading
                ? '⏳ Redirecionando...'
                : `🔒 Ir para o pagamento — R$ ${plan.priceValue}`}
            </button>

            <p style={{ fontSize: '11px', color: 'rgba(100,116,139,0.4)', textAlign: 'center', marginTop: '14px' }}>
              Ao clicar, você será redirecionado para o ambiente seguro do Stripe. Escolha Cartão, Pix ou Boleto lá.
            </p>

            {/* Brand logos */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
              {['Visa', 'Mastercard', 'Amex', 'Pix', 'Boleto', 'Elo'].map(c => (
                <span key={c} style={{
                  fontSize: '10px', color: 'rgba(100,116,139,0.5)', fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  padding: '3px 8px', borderRadius: '4px',
                }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', paddingTop: '80px', paddingBottom: '60px',
    position: 'relative', background: 'linear-gradient(135deg, #020817 0%, #0a1628 100%)',
  },
  bg: {
    position: 'fixed', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(56,189,248,0.05) 0%, transparent 70%)',
  },
  wrapper: { maxWidth: '940px', margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' },
  grid: {
    display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
    gap: '24px', alignItems: 'start',
  },
  summaryCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  paymentCol: {
    background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(56,189,248,0.12)',
    borderRadius: '20px', padding: 'clamp(20px,4vw,32px)', backdropFilter: 'blur(10px)',
  },
  sectionLabel: {
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'rgba(56,189,248,0.7)',
    fontFamily: 'monospace', marginBottom: '16px',
  },
  planCard: {
    position: 'relative', background: 'rgba(10,22,40,0.8)', border: '1px solid',
    borderRadius: '16px', padding: '20px', backdropFilter: 'blur(10px)',
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  payBtn: {
    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
    color: '#020817', fontWeight: 700, fontSize: '15px',
    fontFamily: 'sans-serif', transition: 'all 0.2s',
    background: 'linear-gradient(135deg, #38bdf8, #0891b2)',
    boxShadow: '0 0 24px rgba(56,189,248,0.35)',
  },
};

export default function CheckoutPage() {
  return (
    <>
      <MarketingNav />
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#020817' }} />}>
        <CheckoutForm />
      </Suspense>
    </>
  );
}
