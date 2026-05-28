import Link from 'next/link';
import MarketingNav from '@/components/marketing/layout/MarketingNav';
import MarketingFooter from '@/components/marketing/layout/MarketingFooter';

export const metadata = {
  title: 'Blog Vetra — Inteligência Digital, Segurança e Proteção',
  description: 'Artigos sobre confiança digital, verificação de identidade, segurança em encontros online e proteção contra golpes digitais.',
};

export const posts = [
  {
    slug: 'o-que-e-trust-score-digital',
    tag: 'Conceito', tagColor: '#38bdf8',
    title: 'O que é um Trust Score Digital e por que você precisa conhecer',
    excerpt: 'Em um mundo onde relações pessoais e comerciais migram para o digital, saber avaliar a confiabilidade de uma pessoa online virou habilidade essencial.',
    date: '15 Jan 2025', readTime: '5 min', featured: true,
  },
  {
    slug: 'como-identificar-perfil-fake-instagram',
    tag: 'Guia', tagColor: '#34d399',
    title: 'Como identificar um perfil fake no Instagram em menos de 2 minutos',
    excerpt: 'Aprenda os 8 sinais mais confiáveis para detectar contas falsas, bots e perfis comprados antes de qualquer encontro ou negócio.',
    date: '10 Jan 2025', readTime: '7 min', featured: false,
  },
  {
    slug: 'lgpd-verificacao-pessoas',
    tag: 'Jurídico', tagColor: '#fbbf24',
    title: 'LGPD e verificação de pessoas: o que você pode e não pode fazer',
    excerpt: 'A Lei Geral de Proteção de Dados mudou as regras do jogo. Entenda o que é legalmente permitido ao pesquisar informações sobre terceiros.',
    date: '05 Jan 2025', readTime: '8 min', featured: false,
  },
  {
    slug: 'ia-analise-dados-publicos',
    tag: 'Tecnologia', tagColor: '#a78bfa',
    title: 'Como a IA transforma dados públicos em inteligência acionável',
    excerpt: 'O Gemini AI consegue interpretar dezenas de sinais digitais simultaneamente e gerar análises que levariam horas para um humano produzir.',
    date: '28 Dez 2024', readTime: '6 min', featured: false,
  },
  {
    slug: 'seguranca-encontros-tinder',
    tag: 'Segurança', tagColor: '#f87171',
    title: '7 coisas que você precisa verificar antes do primeiro encontro do Tinder',
    excerpt: 'Perfis podem ser construídos em minutos. Antes de se encontrar com alguém que conheceu online, estas verificações podem te proteger.',
    date: '20 Dez 2024', readTime: '9 min', featured: false,
  },
  {
    slug: 'datajud-registros-judiciais-publicos',
    tag: 'Jurídico', tagColor: '#fbbf24',
    title: 'base jurídica pública: como consultar registros judiciais públicos gratuitamente',
    excerpt: 'O portal base jurídica pública do  é uma fonte poderosa de informações públicas. Veja como ele funciona e como o Vetra o usa na análise de confiança.',
    date: '15 Dez 2024', readTime: '6 min', featured: false,
  },
];

export default function BlogPage() {
  const [featured, ...rest] = posts;
  return (
    <>
      <MarketingNav />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #020817 0%, #050d1f 100%)', paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' }}>

          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ height: '1px', width: '32px', background: 'rgba(56,189,248,0.5)' }} />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(56,189,248,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Blog</span>
            </div>
            <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'white', marginBottom: '12px', lineHeight: 1.1 }}>
              Inteligência digital,<br />direto ao ponto
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(148,163,184,0.6)', maxWidth: '500px' }}>
              Conteúdo sobre confiança digital, análise de dados e decisões mais seguras.
            </p>
          </div>

          {/* Featured */}
          <Link href={`/blog/${featured.slug}`} style={{ display: 'block', textDecoration: 'none', marginBottom: '24px' }}>
            <div style={{
              background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(56,189,248,0.12)',
              borderRadius: '20px', padding: 'clamp(24px,4vw,40px)', transition: 'border-color 0.2s',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', color: featured.tagColor, background: `${featured.tagColor}15`, border: `1px solid ${featured.tagColor}30`, fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {featured.tag}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(100,116,139,0.5)', fontFamily: 'monospace' }}>Destaque</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(100,116,139,0.4)', fontFamily: 'monospace' }}>{featured.readTime} de leitura</span>
              </div>
              <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(1.3rem,3vw,2rem)', color: 'white', marginBottom: '12px', lineHeight: 1.25 }}>{featured.title}</h2>
              <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.6)', lineHeight: 1.7, marginBottom: '20px' }}>{featured.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'rgba(100,116,139,0.4)', fontFamily: 'monospace' }}>{featured.date}</span>
                <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 500 }}>Ler artigo →</span>
              </div>
            </div>
          </Link>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,280px),1fr))', gap: '16px', marginBottom: '60px' }}>
            {rest.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px', padding: '24px', height: '100%',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', color: post.tagColor, background: `${post.tagColor}15`, border: `1px solid ${post.tagColor}25`, fontFamily: 'monospace', textTransform: 'uppercase' }}>
                      {post.tag}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(100,116,139,0.4)', fontFamily: 'monospace' }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontFamily: 'serif', fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'white', lineHeight: 1.35, flex: 1 }}>{post.title}</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.5)', lineHeight: 1.6 }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(100,116,139,0.4)', fontFamily: 'monospace' }}>{post.date}</span>
                    <span style={{ fontSize: '12px', color: '#38bdf8' }}>Ler →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{
            background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(56,189,248,0.12)',
            borderRadius: '20px', padding: 'clamp(24px,4vw,40px)', textAlign: 'center',
          }}>
            <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(1.3rem,3vw,1.8rem)', color: 'white', marginBottom: '8px' }}>Novos artigos toda semana</h2>
            <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.5)', marginBottom: '24px' }}>Receba conteúdo sobre confiança digital direto no seu email.</p>
            <div style={{ display: 'flex', gap: '10px', maxWidth: '480px', margin: '0 auto', flexWrap: 'wrap' }}>
              <input type="email" placeholder="seu@email.com" style={{
                flex: 1, minWidth: '200px', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.15)',
                background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif',
              }} />
              <button style={{
                padding: '12px 24px', background: 'linear-gradient(135deg, #1d4ed8, #0891b2)', color: 'white',
                border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>Inscrever →</button>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
