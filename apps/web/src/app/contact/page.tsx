'use client';
import { useState } from 'react';
import MarketingNav from '@/components/marketing/layout/MarketingNav';
import MarketingFooter from '@/components/marketing/layout/MarketingFooter';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setSending(false);
  };

  return (
    <>
      <MarketingNav />
      <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={styles.container}>

          <div style={styles.labelRow}>
            <span style={styles.labelDot} />
            <span style={styles.labelText}>Contato</span>
          </div>

          <h1 style={styles.h1}>Fale com a gente</h1>
          <p style={styles.lead}>Dúvidas, sugestões ou problemas técnicos — respondemos em até 24h.</p>

          <div style={styles.grid}>
            {/* Info */}
            <div style={styles.info}>
              {[
                { icon: '✉', title: 'Email', value: 'suporte@vetra.ai' },
                { icon: '⏱', title: 'Tempo de resposta', value: 'Até 24 horas úteis' },
                { icon: '◈', title: 'Plataforma', value: 'Disponível 24/7' },
              ].map((item, i) => (
                <div key={i} style={styles.infoCard}>
                  <span style={styles.infoIcon}>{item.icon}</span>
                  <div>
                    <p style={styles.infoTitle}>{item.title}</p>
                    <p style={styles.infoValue}>{item.value}</p>
                  </div>
                </div>
              ))}

              <div style={styles.infoNote}>
                <p style={styles.infoNoteText}>
                  Para suporte técnico urgente, clientes <strong style={{ color: 'var(--accent)' }}>Pro</strong> e{' '}
                  <strong style={{ color: 'var(--green)' }}>Power</strong> têm prioridade de atendimento.
                </p>
              </div>
            </div>

            {/* Form */}
            <div style={styles.formCard}>
              {sent ? (
                <div style={styles.successBox}>
                  <span style={styles.successIcon}>✓</span>
                  <h2 style={styles.successTitle}>Mensagem enviada!</h2>
                  <p style={styles.successText}>Recebemos seu contato e responderemos em breve no email informado.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Nome</label>
                      <input className="input" type="text" placeholder="Seu nome" required
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Email</label>
                      <input className="input" type="email" placeholder="voce@exemplo.com" required
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={styles.label}>Assunto</label>
                    <select className="input" value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      style={{ cursor: 'pointer' }}>
                      <option value="">Selecione um assunto</option>
                      <option>Dúvida sobre planos</option>
                      <option>Problema técnico</option>
                      <option>Cancelamento</option>
                      <option>Sugestão de melhoria</option>
                      <option>Parceria comercial</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Mensagem</label>
                    <textarea className="input" placeholder="Descreva sua dúvida ou problema com detalhes..." required
                      rows={5} value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      style={{ resize: 'vertical', minHeight: '120px', fontFamily: 'var(--font-sans)' }} />
                  </div>
                  <button type="submit" disabled={sending} style={styles.submitBtn}>
                    {sending ? 'Enviando...' : 'Enviar mensagem →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '0 24px' },
  labelRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' },
  labelDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' },
  labelText: { fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' as const },
  h1: { fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 400, color: 'var(--text)', marginBottom: '16px' },
  lead: { fontSize: '16px', color: 'var(--text-muted)', marginBottom: '48px', lineHeight: 1.6 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '32px', alignItems: 'start' },
  info: { display: 'flex', flexDirection: 'column', gap: '12px' },
  infoCard: { display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' },
  infoIcon: { fontSize: '20px', color: 'var(--accent)', width: '32px', textAlign: 'center' as const, flexShrink: 0 },
  infoTitle: { fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '2px' },
  infoValue: { fontSize: '14px', color: 'var(--text)', fontWeight: 500 },
  infoNote: { background: 'rgba(99,179,237,0.05)', border: '1px solid rgba(99,179,237,0.15)', borderRadius: '10px', padding: '16px', marginTop: '4px' },
  infoNoteText: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 },
  formCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'flex', gap: '12px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '6px' },
  submitBtn: { padding: '13px', background: 'var(--accent)', color: '#080c0f', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.2s' },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 20px', textAlign: 'center' as const },
  successIcon: { width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--green)' },
  successTitle: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text)' },
  successText: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 },
};
