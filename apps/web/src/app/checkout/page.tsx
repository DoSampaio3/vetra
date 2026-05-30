'use client';
import { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MarketingNav from '@/components/marketing/layout/MarketingNav';
import { api } from '@/lib/api';

const PLANS: Record<string, { name: string; price: string; priceValue: string; period: string; description: string; color: string; features: string[] }> = {
  explorer: { name: 'Explorar', price: 'R$ 49,90', priceValue: '49,90', period: 'pagamento único', color: '#38bdf8', description: '1 relatório premium com análise completa por IA', features: ['1 relatório premium completo', 'Score de confiança 0–100', 'Análise por Gemini AI', 'Verificação Instagram real', 'Consulta Datajud CNJ', 'Exportação PDF'] },
  pro: { name: 'Pro Insight', price: 'R$ 97,90', priceValue: '97,90', period: '/mês', color: '#38bdf8', description: '10 relatórios por mês com histórico e PDF', features: ['10 relatórios/mês', 'Score de confiança 0–100', 'Análise aprofundada por IA', 'Verificação Instagram real', 'Consulta Datajud CNJ', 'Histórico completo', 'Exportação PDF premium', 'Suporte prioritário'] },
  power: { name: 'Vetra Power', price: 'R$ 197,90', priceValue: '197,90', period: '/mês', color: '#a78bfa', description: 'Pesquisas ilimitadas com API e prioridade total', features: ['Pesquisas ilimitadas', 'IA avançada (Gemini Pro)', 'Verificação Instagram real', 'Consulta Datajud CNJ', 'Histórico ilimitado', 'PDF + API access', 'Dashboard premium', 'Suporte dedicado'] },
};

type BillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';
type Step = 'form' | 'pix';

const PAYMENT_METHODS: { key: BillingType; label: string; icon: string; desc: string }[] = [
  { key: 'PIX', label: 'Pix', icon: '⚡', desc: 'Aprovação em segundos · 24h por dia' },
  { key: 'BOLETO', label: 'Boleto', icon: '🧾', desc: 'Vence em 3 dias úteis' },
  { key: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳', desc: 'Débito imediato' },
];

function formatCpf(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 14);
  if (n.length <= 11) return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3').replace(/(\d{3})(\d{1,3})/, '$1.$2');
  return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4').replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3').replace(/(\d{2})(\d{1,3})/, '$1.$2');
}

function PixScreen({ qrCode, pixKey, planKey, paymentId, planColor }: { qrCode: string; pixKey: string; planKey: string; paymentId: string; planColor: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [seconds, setSeconds] = useState(900);
  const intervalRef = useRef<any>(null);

  const copy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('vetra_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/api/billing/payment-status/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.confirmed) {
          clearInterval(intervalRef.current);
          setConfirmed(true);
          setTimeout(() => router.push('/dashboard?payment=success'), 2000);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [paymentId, router]);

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  if (confirmed) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#020817,#0a1628)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>✓</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>Pagamento confirmado!</div>
      <div style={{ fontSize: '13px', color: 'rgba(100,116,139,0.7)' }}>Redirecionando para o dashboard...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#020817,#0a1628)', paddingTop: '80px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(56,189,248,0.7)', fontFamily: 'monospace', marginBottom: '8px' }}>Pagamento via Pix</div>
          <h1 style={{ fontSize: '24px', fontFamily: 'Georgia,serif', color: 'white', marginBottom: '6px' }}>Escaneie o QR Code</h1>
          <p style={{ fontSize: '13px', color: 'rgba(100,116,139,0.6)' }}>Abra o app do seu banco e escaneie o código abaixo</p>
        </div>
        <div style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: seconds < 120 ? 'rgba(239,68,68,0.1)' : 'rgba(56,189,248,0.08)', border: `1px solid ${seconds < 120 ? 'rgba(239,68,68,0.3)' : 'rgba(56,189,248,0.2)'}`, borderRadius: '20px', padding: '6px 14px', marginBottom: '24px' }}>
            <span style={{ fontSize: '12px' }}>⏱</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: seconds < 120 ? '#f87171' : '#38bdf8', fontFamily: 'monospace' }}>{mins}:{secs}</span>
            <span style={{ fontSize: '11px', color: 'rgba(100,116,139,0.6)' }}>para expirar</span>
          </div>
          <div style={{ display: 'inline-block', padding: '16px', background: 'white', borderRadius: '16px', marginBottom: '24px', boxShadow: `0 0 40px ${planColor}30` }}>
            {qrCode ? (
              <img src={`data:image/png;base64,${qrCode}`} alt="QR Code Pix" style={{ width: '200px', height: '200px', display: 'block' }} />
            ) : (
              <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '13px' }}>QR Code indisponível</div>
            )}
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(100,116,139,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pix Copia e Cola</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', fontSize: '11px', color: 'rgba(148,163,184,0.7)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                {pixKey ? pixKey.slice(0, 40) + '...' : 'Carregando...'}
              </div>
              <button onClick={copy} style={{ flexShrink: 0, padding: '10px 16px', borderRadius: '10px', border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(56,189,248,0.3)'}`, cursor: 'pointer', fontWeight: 700, fontSize: '12px', background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(56,189,248,0.15)', color: copied ? '#34d399' : '#38bdf8' }}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(56,189,248,0.7)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Como pagar</div>
            {['Abra o app do seu banco', 'Vá em área Pix e toque em Pagar', 'Escaneie o QR Code ou cole a chave', `Confirme o pagamento de R$ ${PLANS[planKey]?.priceValue}`].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: i < 3 ? '8px' : '0' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', fontSize: '10px', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.7)' }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: 'rgba(100,116,139,0.6)' }}>Aguardando confirmação do pagamento...</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href={`/checkout?plan=${planKey}`} style={{ fontSize: '12px', color: 'rgba(56,189,248,0.5)', textDecoration: 'none' }}>← Voltar e trocar forma de pagamento</Link>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const planKey = params.get('plan') || 'explorer';
  const plan = PLANS[planKey] || PLANS['explorer'];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [billingType, setBillingType] = useState<BillingType>('PIX');
  const [cpf, setCpf] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [pixData, setPixData] = useState<{ qrCode: string; pixKey: string; paymentId: string } | null>(null);

  const handlePay = async () => {
    setError(''); setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vetra_token') : null;
      if (!token) { router.push('/register?plan=' + planKey); return; }
      const cleanCpf = cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11 && cleanCpf.length !== 14) { setError('CPF ou CNPJ inválido.'); setLoading(false); return; }
      const res = await api.billing.createCheckout(planKey, billingType, cleanCpf);
      if (billingType === 'PIX' && res.pix_qr_code) {
        setPixData({ qrCode: res.pix_qr_code, pixKey: res.pix_key, paymentId: res.payment_id });
        setStep('pix');
      } else if (res.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        setError('Erro ao iniciar pagamento. Tente novamente.');
      }
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.toLowerCase().includes('token')) { router.push('/register?plan=' + planKey); }
      else { setError(err.message || 'Erro ao processar. Tente novamente.'); }
    } finally { setLoading(false); }
  };

  if (step === 'pix' && pixData) {
    return <PixScreen qrCode={pixData.qrCode} pixKey={pixData.pixKey} planKey={planKey} paymentId={pixData.paymentId} planColor={plan.color} />;
  }

  return (
    <div style={S.page}>
      <div style={S.bg} />
      <div style={S.wrapper}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontFamily: 'Georgia, serif', color: 'white', marginBottom: '8px' }}>Finalizar compra</h1>
          <p style={{ fontSize: '13px', color: 'rgba(100,116,139,0.7)' }}>Acesso imediato após confirmação do pagamento</p>
        </div>
        <div style={S.grid}>
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
            <div style={S.totalRow}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Total hoje</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: plan.color, fontFamily: 'monospace' }}>R$ {plan.priceValue}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[{ icon: '🔒', text: 'Pagamento 100% seguro via Asaas' }, { icon: '⚡', text: 'Acesso liberado imediatamente após o pagamento' }, { icon: '↩', text: 'Cancele quando quiser, sem multa' }, { icon: '📋', text: '100% LGPD compliant' }].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', width: '22px', textAlign: 'center' }}>{t.icon}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(100,116,139,0.6)' }}>{t.text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Link href="/#planos" style={{ fontSize: '12px', color: 'rgba(56,189,248,0.6)', textDecoration: 'none' }}>← Trocar de plano</Link>
            </div>
          </div>
          <div style={S.paymentCol}>
            <div style={S.sectionLabel}>Forma de pagamento</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {PAYMENT_METHODS.map(m => (
                <div key={m.key} onClick={() => setBillingType(m.key)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${billingType === m.key ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.07)'}`, background: billingType === m.key ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.02)', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(100,116,139,0.6)', marginTop: '2px' }}>{m.desc}</div>
                  </div>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${billingType === m.key ? '#38bdf8' : 'rgba(255,255,255,0.2)'}`, background: billingType === m.key ? '#38bdf8' : 'transparent', transition: 'all 0.15s' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.8)', display: 'block', marginBottom: '6px' }}>CPF ou CNPJ</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={e => setCpf(formatCpf(e.target.value))}
                maxLength={18}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#00c6a7,#0099cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🇧🇷</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>Powered by Asaas</div>
                <div style={{ fontSize: '11px', color: 'rgba(100,116,139,0.5)' }}>Plataforma brasileira · Regulada pelo Banco Central</div>
              </div>
            </div>
            {error && <div style={{ padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '13px', color: '#f87171' }}>⚠ {error}</div>}
            <button onClick={handlePay} disabled={loading} style={{ ...S.payBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? '⏳ Gerando pagamento...' : billingType === 'PIX' ? `⚡ Gerar QR Code Pix — R$ ${plan.priceValue}` : `🔒 Pagar com ${PAYMENT_METHODS.find(m => m.key === billingType)?.label} — R$ ${plan.priceValue}`}
            </button>
            {billingType === 'PIX' && <p style={{ fontSize: '11px', color: 'rgba(100,116,139,0.4)', textAlign: 'center', marginTop: '10px' }}>O QR Code aparecerá aqui nesta página.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', paddingTop: '80px', paddingBottom: '60px', position: 'relative', background: 'linear-gradient(135deg, #020817 0%, #0a1628 100%)' },
  bg: { position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(56,189,248,0.05) 0%, transparent 70%)' },
  wrapper: { maxWidth: '940px', margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' },
  summaryCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  paymentCol: { background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '20px', padding: 'clamp(20px,4vw,32px)', backdropFilter: 'blur(10px)' },
  sectionLabel: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(56,189,248,0.7)', fontFamily: 'monospace', marginBottom: '16px' },
  planCard: { position: 'relative', background: 'rgba(10,22,40,0.8)', border: '1px solid', borderRadius: '16px', padding: '20px', backdropFilter: 'blur(10px)' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  payBtn: { width: '100%', padding: '16px', borderRadius: '12px', border: 'none', color: '#020817', fontWeight: 700, fontSize: '15px', fontFamily: 'sans-serif', transition: 'all 0.2s', background: 'linear-gradient(135deg, #38bdf8, #0891b2)', boxShadow: '0 0 24px rgba(56,189,248,0.35)' },
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
