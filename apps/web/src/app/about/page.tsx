import Link from 'next/link';
import MarketingNav from '@/components/marketing/layout/MarketingNav';
import MarketingFooter from '@/components/marketing/layout/MarketingFooter';

export default function AboutPage() {
  return (
    <>
      <MarketingNav />
      <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={styles.container}>

          <div style={styles.label}>
            <span style={styles.labelDot} />
            Sobre o Vetra
          </div>

          <h1 style={styles.h1}>
            Confiança digital deveria ser<br />
            <span style={styles.accent}>simples de verificar</span>
          </h1>

          <p style={styles.lead}>
            O Vetra nasceu de uma necessidade real: tomar decisões importantes sobre pessoas
            e empresas sem ter acesso rápido a informações confiáveis. Pesquisar manualmente
            levava horas e ainda gerava dúvida.
          </p>

          <div style={styles.divider} />

          <div style={styles.grid}>
            <div style={styles.block}>
              <h2 style={styles.h2}>Nossa missão</h2>
              <p style={styles.text}>
                Democratizar o acesso a análises de confiança digital, usando inteligência artificial
                para transformar dados públicos em relatórios claros, rápidos e acionáveis —
                sem invasão de privacidade, sem acesso a dados privados.
              </p>
            </div>
            <div style={styles.block}>
              <h2 style={styles.h2}>O que nos diferencia</h2>
              <p style={styles.text}>
                Não somos um banco de dados de pessoas. Somos uma plataforma de análise de
                sinais digitais públicos. Tudo que o Vetra verifica é acessível publicamente —
                nós apenas estruturamos e interpretamos com IA.
              </p>
            </div>
          </div>

          <div style={styles.valuesGrid}>
            {[
              { icon: '🔒', title: 'Privacidade primeiro', desc: 'Apenas dados públicos. LGPD compliant. Nunca acessamos bases privadas ou governamentais.' },
              { icon: '🤖', title: 'IA explicável', desc: 'Cada score tem uma explicação. Você sempre sabe por que um resultado foi gerado.' },
              { icon: '⚡', title: 'Velocidade real', desc: 'Relatório completo em menos de 60 segundos. Sem espera, sem burocracia.' },
              { icon: '🎯', title: 'Foco em decisão', desc: 'Não geramos dados por gerar. Cada informação existe para ajudar você a decidir melhor.' },
            ].map((v, i) => (
              <div key={i} style={styles.valueCard}>
                <span style={styles.valueIcon}>{v.icon}</span>
                <h3 style={styles.valueTitle}>{v.title}</h3>
                <p style={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>

          <div style={styles.cta}>
            <p style={styles.ctaText}>Pronto para tomar decisões com dados?</p>
            <Link href="/register" style={styles.ctaBtn}>Começar por R$ 25 →</Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '760px', margin: '0 auto', padding: '0 24px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '24px' },
  labelDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' },
  h1: { fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.15, marginBottom: '24px' },
  accent: { color: 'var(--accent)' },
  lead: { fontSize: '18px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '48px' },
  divider: { height: '1px', background: 'var(--border)', marginBottom: '48px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '64px' },
  block: { display: 'flex', flexDirection: 'column', gap: '12px' },
  h2: { fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)', fontWeight: 400 },
  text: { fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 },
  valuesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '64px' },
  valueCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' },
  valueIcon: { fontSize: '24px' },
  valueTitle: { fontSize: '15px', fontWeight: 600, color: 'var(--text)' },
  valueDesc: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 },
  cta: { textAlign: 'center' as const, padding: '48px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  ctaText: { fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--text)' },
  ctaBtn: { padding: '13px 28px', background: 'var(--accent)', color: '#080c0f', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' },
};
