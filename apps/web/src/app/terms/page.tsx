import MarketingNav from '@/components/marketing/layout/MarketingNav';
import MarketingFooter from '@/components/marketing/layout/MarketingFooter';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Aceitação dos Termos',
      content: `Ao utilizar o Vetra, você concorda com estes Termos de Uso. Se não concordar com qualquer parte, não utilize a plataforma. O uso contínuo após alterações constitui aceitação das novas condições.`,
    },
    {
      title: '2. Descrição do Serviço',
      content: `O Vetra é uma plataforma SaaS de análise de confiança digital que utiliza inteligência artificial para processar dados públicos e fornecidos voluntariamente pelo usuário, gerando relatórios estruturados com score de confiança de 0 a 100.`,
    },
    {
      title: '3. Uso Permitido',
      content: `O serviço pode ser utilizado para verificação de pessoas com consentimento explícito do verificado, análise de perfis públicos, suporte a decisões comerciais, de contratação ou parcerias, e pesquisa pessoal mediante consentimento.`,
    },
    {
      title: '4. Uso Proibido',
      content: `É expressamente proibido utilizar o Vetra para assédio, perseguição ou vigilância de indivíduos; discriminação por raça, gênero, religião ou orientação sexual; coleta massiva de dados sem finalidade legítima; compartilhamento não autorizado de relatórios; e qualquer finalidade que viole a LGPD ou legislação aplicável.`,
    },
    {
      title: '5. Dados e Privacidade',
      content: `O Vetra processa apenas dados públicos e fornecidos voluntariamente. Não acessamos bases governamentais, dados bancários ou informações privadas. CPFs são armazenados apenas como hash criptográfico irreversível. Consulte nossa Política de Privacidade para detalhes.`,
    },
    {
      title: '6. Planos e Pagamentos',
      content: `Os planos disponíveis são Explorar (pagamento único), Pro Insight (mensal ou anual) e Vetra Power (mensal ou anual). Assinaturas são renovadas automaticamente. O cancelamento pode ser feito a qualquer momento e tem efeito no fim do período vigente. Não realizamos reembolso de períodos parciais.`,
    },
    {
      title: '7. Limitação de Responsabilidade',
      content: `Os relatórios do Vetra são baseados em análise de sinais públicos e não constituem opinião jurídica, financeira ou de crédito. O Vetra não se responsabiliza por decisões tomadas com base nos relatórios gerados. O usuário é responsável pelo uso adequado das informações.`,
    },
    {
      title: '8. Propriedade Intelectual',
      content: `Toda a tecnologia, algoritmos, interfaces e conteúdo da plataforma são propriedade exclusiva do Vetra. É proibida a reprodução, engenharia reversa ou uso comercial sem autorização expressa.`,
    },
    {
      title: '9. Alterações nos Termos',
      content: `Podemos atualizar estes termos a qualquer momento, com aviso prévio de 15 dias por email. O uso continuado após o prazo constitui aceitação das novas condições.`,
    },
    {
      title: '10. Foro e Legislação',
      content: `Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.`,
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
          <h1 style={styles.h1}>Termos de Uso</h1>
          <p style={styles.updated}>Última atualização: Janeiro de 2025</p>
          <p style={styles.intro}>
            Leia com atenção antes de utilizar o Vetra. Estes termos definem os direitos e
            responsabilidades de todos os usuários da plataforma.
          </p>

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
              Dúvidas sobre estes termos?{' '}
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
  updated: { fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '24px' },
  intro: { fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' },
  content: { display: 'flex', flexDirection: 'column', gap: '32px' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sectionTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' },
  sectionText: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 },
  footer: { marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--border)', textAlign: 'center' as const },
  footerText: { fontSize: '14px', color: 'var(--text-muted)' },
  footerLink: { color: 'var(--accent)', textDecoration: 'none' },
};
