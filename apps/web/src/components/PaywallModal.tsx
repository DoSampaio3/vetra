'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    key: 'explorer',
    name: 'Explorar',
    price: 'R$ 49,90',
    period: 'pagamento único',
    color: '#64748b',
    features: ['1 relatório premium', 'Score 0–100', 'Gemini AI', 'Instagram real', 'Datajud CNJ', 'PDF'],
    badge: null,
  },
  {
    key: 'pro',
    name: 'Pro Insight',
    price: 'R$ 97,90',
    period: '/mês',
    color: '#38bdf8',
    features: ['10 relatórios/mês', 'Score 0–100', 'IA aprofundada', 'Instagram real', 'Histórico completo', 'PDF premium'],
    badge: 'Mais escolhido',
  },
  {
    key: 'power',
    name: 'Vetra Power',
    price: 'R$ 197,90',
    period: '/mês',
    color: '#a78bfa',
    features: ['Ilimitado', 'IA avançada', 'API access', 'Dashboard premium', 'Suporte dedicado'],
    badge: 'Ilimitado',
  },
];

interface PaywallModalProps {
  onClose: () => void;
}

export function PaywallModal({ onClose }: PaywallModalProps) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: 'rgba(2, 8, 23, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '860px', maxHeight: '90vh', overflowY: 'auto',
        borderRadius: '20px', border: '1px solid rgba(56,189,248,0.2)',
        background: 'linear-gradient(135deg, #0a1628 0%, #050d1f 100%)',
        boxShadow: '0 0 0 1px rgba(56,189,248,0.08), 0 40px 100px rgba(0,0,0,0.7)',
        animation: 'slideUp 0.25s ease',
        position: 'relative',
      }}>

        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.6), transparent)',
        }} />

        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', color: '#94a3b8', cursor: 'pointer',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '16px', zIndex: 1,
        }}>×</button>

        <div style={{ padding: '40px 32px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '52px', height: '52px', borderRadius: '14px', marginBottom: '16px',
              background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
            }}>
              <span style={{ fontSize: '24px' }}>🔒</span>
            </div>
            <h2 style={{
              color: 'white', fontSize: '22px', fontWeight: 700,
              marginBottom: '8px',
            }}>
              Desbloqueie o relatório completo
            </h2>
            <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
              O score foi calculado. Para ver registros judiciais, análise completa por IA e todos os dados, escolha um plano.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {PLANS.map(plan => (
              <div
                key={plan.key}
                style={{
                  borderRadius: '14px', padding: '20px',
                  background: plan.key === 'pro'
                    ? 'linear-gradient(135deg, rgba(14,30,60,0.9), rgba(10,22,50,0.9))'
                    : 'rgba(10,22,40,0.6)',
                  border: plan.key === 'pro'
                    ? '1px solid rgba(56,189,248,0.35)'
                    : '1px solid rgba(255,255,255,0.07)',
                  position: 'relative', cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
                onClick={() => router.push(`/checkout?plan=${plan.key}`)}
              >
                {plan.key === 'pro' && (
                  <div style={{
                    position: 'absolute', top: '-1px', left: '20%', right: '20%', height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.7), transparent)',
                  }} />
                )}
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                    background: plan.key === 'pro'
                      ? 'linear-gradient(135deg, #1d4ed8, #0891b2)'
                      : `linear-gradient(135deg, ${plan.color}80, ${plan.color}40)`,
                    color: 'white', fontSize: '10px', fontWeight: 700,
                    padding: '3px 12px', borderRadius: '100px', whiteSpace: 'nowrap',
                  }}>{plan.badge}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: plan.color }} />
                  <span style={{ color: plan.color, fontSize: '12px', fontWeight: 600 }}>{plan.name}</span>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>{plan.price}</span>
                  <span style={{ color: 'rgba(100,116,139,0.7)', fontSize: '11px', marginLeft: '4px' }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#34d399', fontSize: '10px' }}>✓</span>
                      <span style={{ color: 'rgba(148,163,184,0.8)', fontSize: '11px' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: plan.key === 'pro' ? 'none' : `1px solid ${plan.color}30`,
                    background: plan.key === 'pro'
                      ? 'linear-gradient(135deg, #1d4ed8, #0891b2)'
                      : `${plan.color}15`,
                    color: plan.key === 'pro' ? 'white' : plan.color,
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  }}
                  onClick={(e) => { e.stopPropagation(); router.push(`/checkout?plan=${plan.key}`); }}
                >
                  Assinar {plan.name} →
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
              {['🔒 Pagamento seguro SSL', '⚡ Acesso imediato', '↩ Cancele quando quiser', '📋 LGPD compliant'].map((t, i) => (
                <span key={i} style={{ color: 'rgba(100,116,139,0.5)', fontSize: '11px' }}>{t}</span>
              ))}
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: 'rgba(100,116,139,0.5)',
              fontSize: '12px', cursor: 'pointer', textDecoration: 'underline',
            }}>
              Agora não, voltar à verificação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
