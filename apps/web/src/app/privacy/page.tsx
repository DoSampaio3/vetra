import MarketingNav from '@/components/marketing/layout/MarketingNav';
import MarketingFooter from '@/components/marketing/layout/MarketingFooter';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Dados que coletamos',
      content: `Coletamos apenas o necessário para operar o serviço: dados de cadastro (nome, email, senha em hash), dados fornecidos para análise (email, telefone, username, data de nascimento, CPF apenas em formato hash irreversível), dados de uso (logs de acesso, relatórios gerados) e dados de pagamento processados por terceiros (Stripe) — não armazenamos números de cartão.`,
    },
    {
      title: '2. Como usamos seus dados',
      content: `Seus dados são usados exclusivamente para: autenticação e acesso à plataforma, geração de relatórios de confiança, melhoria dos algoritmos de análise (de forma anonimizada), comunicações transacionais (confirmações, recibos) e suporte ao cliente.`,
    },
    {
      title: '3. Dados de terceiros analisados',
      content: `Quando você solicita análise de outra pessoa, processamos apenas dados públicos disponíveis na internet e informações fornecidas por você. Não armazenamos dados de terceiros indefinidamente — eles são usados para geração do relatório e mantidos pelo prazo contratual.`,
    },
    {
      title: '4. Compartilhamento de dados',
      content: `Não vendemos dados. Compartilhamos apenas com: provedores de infraestrutura (Supabase/PostgreSQL, Redis), processador de pagamentos (Stripe), serviços de IA (Google Gemini — apenas os scores, não dados pessoais identificáveis), e quando exigido por lei ou ordem judicial.`,
    },
    {
      title: '5. Segurança',
      content: `Utilizamos criptografia TLS para transmissão, senhas em bcrypt hash, CPFs em SHA-256 hash irreversível, tokens JWT com expiração, e controle de acesso por autenticação. Realizamos auditorias periódicas de segurança.`,
    },
    {
      title: '6. Seus direitos (LGPD)',
      content: `Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a: confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos, anonimização ou exclusão de dados desnecessários, portabilidade, informação sobre compartilhamento, e revogação de consentimento. Para exercer esses direitos, contate privacidade@vetra.ai.`,
    },
    {
      title: '7. Retenção de dados',
      content: `Mantemos seus dados pelo período contratual + 90 dias após cancelamento. Logs de acesso por 12 meses. Relatórios gerados por 24 meses ou conforme plano. Após esses prazos, os dados são excluídos ou anonimizados permanentemente.`,
    },
    {
      title: '8. Cookies',
      content: `Utilizamos cookies essenciais para funcionamento da plataforma e tokens de sessão. Não utilizamos cookies de rastreamento de terceiros ou publicidade. Consulte nossa Política de Cookies para detalhes.`,
    },
    {
      title: '9. Contato para privacidade',
      content: `Para questões relacionadas à privacidade, proteção de dados ou exercício dos seus direitos LGPD, entre em contato pelo email privacidade@vetra.ai. Respondemos em até 15 dias úteis.`,
    },
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
          <h1 style={styles.h1}>Política de Privacidade</h1>
          <p style={styles.updated}>Última atualização: Janeiro de 2025</p>

          <div style={styles.lgpdBadge}>
            <span style={styles.lgpdIcon}>🔒</span>
            <p style={styles.lgpdText}>
              O Vetra é 100% LGPD compliant. Seus dados são tratados com responsabilidade
              e transparência, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).
            </p>
          </div>

          <div style={styles.content}>
            {sections.map((s, i) => (
              <div key={i} style={styles.section}>
                <h2 style={styles.sectionTitle}>{s.title}</h2>
                <p style={styles.sectionText}>{s.content}</p>
              </div>
            ))}
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Dúvidas sobre privacidade?{' '}
              <a href="mailto:privacidade@vetra.ai" style={styles.footerLink}>privacidade@vetra.ai</a>
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
  updated: { fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '24px' },
  lgpdBadge: { display: 'flex', gap: '14px', background: 'rgba(104,211,145,0.06)', border: '1px solid rgba(104,211,145,0.2)', borderRadius: '10px', padding: '18px 20px', marginBottom: '48px', alignItems: 'flex-start' },
  lgpdIcon: { fontSize: '20px', flexShrink: 0, marginTop: '2px' },
  lgpdText: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 },
  content: { display: 'flex', flexDirection: 'column', gap: '32px' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sectionTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' },
  sectionText: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 },
  footer: { marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--border)', textAlign: 'center' as const },
  footerText: { fontSize: '14px', color: 'var(--text-muted)' },
  footerLink: { color: 'var(--accent)', textDecoration: 'none' },
};
