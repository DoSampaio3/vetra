import MarketingNav from '@/components/marketing/layout/MarketingNav';
import MarketingFooter from '@/components/marketing/layout/MarketingFooter';

export default function CookiesPage() {
  const cookies = [
    { name: 'vetra_token', type: 'Essencial', duration: '7 dias', purpose: 'Token de autenticação JWT. Necessário para manter a sessão ativa.' },
    { name: '__session', type: 'Essencial', duration: 'Sessão', purpose: 'Controle de sessão do usuário. Removido ao fechar o navegador.' },
    { name: 'next-auth', type: 'Essencial', duration: '30 dias', purpose: 'Estado de autenticação do Next.js.' },
  ];

  return (
    <>
      <MarketingNav />
      <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={styles.container}>
          <div style={styles.labelRow}>
            <span style={styles.labelDot} />
            <span style={styles.labelText}>Legal</span>
          </div>
          <h1 style={styles.h1}>Política de Cookies</h1>
          <p style={styles.updated}>Última atualização: Janeiro de 2025</p>

          <div style={styles.noBanner}>
            <span style={{ fontSize: '20px' }}>🍪</span>
            <p style={styles.noBannerText}>
              <strong style={{ color: 'var(--text)' }}>Boas notícias:</strong> o Vetra não usa cookies de rastreamento, publicidade ou análise comportamental de terceiros. Apenas cookies estritamente necessários para o funcionamento da plataforma.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.h2}>O que são cookies?</h2>
            <p style={styles.text}>
              Cookies são pequenos arquivos de texto armazenados no seu navegador quando você
              acessa um site. Eles permitem que o site lembre de suas preferências e mantenha
              você autenticado entre visitas.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.h2}>Cookies que utilizamos</h2>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span>Nome</span>
                <span>Tipo</span>
                <span>Duração</span>
                <span>Finalidade</span>
              </div>
              {cookies.map((c, i) => (
                <div key={i} style={styles.tableRow}>
                  <span style={styles.cookieName}>{c.name}</span>
                  <span style={styles.cookieType}>{c.type}</span>
                  <span style={styles.cookieDuration}>{c.duration}</span>
                  <span style={styles.cookiePurpose}>{c.purpose}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.h2}>Como gerenciar cookies</h2>
            <p style={styles.text}>
              Como usamos apenas cookies essenciais, desativá-los impedirá o funcionamento
              correto da plataforma — você não conseguirá manter sessão ativa. Para gerenciar
              cookies, acesse as configurações do seu navegador:
            </p>
            <ul style={styles.list}>
              {['Chrome: Configurações → Privacidade → Cookies', 'Firefox: Preferências → Privacidade e Segurança', 'Safari: Preferências → Privacidade', 'Edge: Configurações → Privacidade, pesquisa e serviços'].map((b, i) => (
                <li key={i} style={styles.listItem}>{b}</li>
              ))}
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.h2}>Não usamos</h2>
            <div style={styles.noList}>
              {['Google Analytics ou similares', 'Pixel do Facebook/Meta', 'Cookies de publicidade', 'Rastreamento entre sites', 'Fingerprinting de dispositivo'].map((item, i) => (
                <div key={i} style={styles.noItem}>
                  <span style={styles.noIcon}>✗</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Dúvidas?{' '}
              <a href="/contact" style={styles.footerLink}>Entre em contato</a>
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '720px', margin: '0 auto', padding: '0 24px' },
  labelRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' },
  labelDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' },
  labelText: { fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' as const },
  h1: { fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px' },
  updated: { fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '32px' },
  noBanner: { display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(104,211,145,0.06)', border: '1px solid rgba(104,211,145,0.2)', borderRadius: '10px', padding: '18px 20px', marginBottom: '48px' },
  noBannerText: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 },
  section: { marginBottom: '40px' },
  h2: { fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)', marginBottom: '14px', fontWeight: 400 },
  text: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '16px' },
  table: { border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 2fr', padding: '12px 16px', background: 'var(--bg-card2)', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, gap: '12px' },
  tableRow: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 2fr', padding: '14px 16px', borderTop: '1px solid var(--border)', gap: '12px', alignItems: 'start' },
  cookieName: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)' },
  cookieType: { fontSize: '12px', color: 'var(--green)', fontFamily: 'var(--font-mono)' },
  cookieDuration: { fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  cookiePurpose: { fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' },
  listItem: { fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '16px', position: 'relative' as const },
  noList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  noItem: { display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'var(--text-muted)' },
  noIcon: { color: 'var(--red)', fontFamily: 'var(--font-mono)', flexShrink: 0 },
  footer: { marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)', textAlign: 'center' as const },
  footerText: { fontSize: '14px', color: 'var(--text-muted)' },
  footerLink: { color: 'var(--accent)', textDecoration: 'none' },
};
