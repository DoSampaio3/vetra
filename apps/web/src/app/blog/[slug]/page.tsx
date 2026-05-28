import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarketingNav from '@/components/marketing/layout/MarketingNav';
import MarketingFooter from '@/components/marketing/layout/MarketingFooter';
import { articles } from '../articles';
import { posts } from '../page';

export function generateStaticParams() {
  return Object.keys(articles).map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];
  if (!article) return { title: 'Artigo não encontrado — Vetra Blog' };
  return {
    title: `${article.title} — Vetra Blog`,
    description: article.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];
  if (!article) notFound();

  const related = posts.filter(p => p.slug !== params.slug).slice(0, 3);

  return (
    <>
      <MarketingNav />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #020817 0%, #050d1f 100%)', paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '13px' }}>
            <Link href="/blog" style={{ color: 'rgba(56,189,248,0.7)', textDecoration: 'none' }}>Blog</Link>
            <span style={{ color: 'rgba(100,116,139,0.4)' }}>/</span>
            <span style={{ color: 'rgba(100,116,139,0.6)' }}>{article.tag}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <span style={{
              display: 'inline-block', fontSize: '10px', fontWeight: 700, padding: '4px 12px',
              borderRadius: '100px', color: article.tagColor, background: `${article.tagColor}15`,
              border: `1px solid ${article.tagColor}30`, fontFamily: 'monospace',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px',
            }}>
              {article.tag}
            </span>
            <h1 style={{
              fontFamily: 'serif', fontSize: 'clamp(1.6rem,4vw,2.5rem)', color: 'white',
              lineHeight: 1.2, marginBottom: '16px',
            }}>
              {article.title}
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(148,163,184,0.7)', lineHeight: 1.6, marginBottom: '20px' }}>
              {article.excerpt}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'white', fontWeight: 700 }}>V</span>
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(148,163,184,0.7)' }}>Equipe Vetra</span>
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(100,116,139,0.5)', fontFamily: 'monospace' }}>{article.date}</span>
              <span style={{ fontSize: '12px', color: 'rgba(100,116,139,0.5)', fontFamily: 'monospace' }}>{article.readTime} de leitura</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ marginBottom: '60px' }} dangerouslySetInnerHTML={{
            __html: `<style>
              .article-body { color: rgba(148,163,184,0.85); line-height: 1.85; font-size: 15px; }
              .article-body p { margin-bottom: 20px; }
              .article-body h2 {
                font-family: 'DM Serif Display', serif;
                font-size: clamp(1.2rem, 3vw, 1.6rem);
                color: white; font-weight: 400;
                margin: 40px 0 16px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(56,189,248,0.1);
              }
              .article-body ul, .article-body ol { padding-left: 20px; margin-bottom: 20px; }
              .article-body li { margin-bottom: 8px; }
              .article-body strong { color: rgba(226,232,240,0.95); font-weight: 600; }
              .article-body em { color: rgba(167,139,250,0.9); font-style: italic; }
              .article-body blockquote {
                border-left: 3px solid #38bdf8;
                margin: 28px 0; padding: 14px 20px;
                background: rgba(56,189,248,0.04);
                border-radius: 0 12px 12px 0;
                font-style: italic; color: rgba(148,163,184,0.8);
              }
              .article-body a { color: #38bdf8; }
            </style>
            <div class="article-body">${article.content}</div>`
          }} />

          {/* CTA */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(29,78,216,0.12), rgba(8,145,178,0.08))',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: '20px', padding: 'clamp(24px,4vw,36px)',
            textAlign: 'center', marginBottom: '60px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
            <h3 style={{ fontFamily: 'serif', fontSize: 'clamp(1.2rem,3vw,1.6rem)', color: 'white', marginBottom: '10px' }}>
              Pronto para verificar antes de confiar?
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.6)', marginBottom: '20px' }}>
              Gere um relatório completo com score de confiança, análise IA e consulta ao base jurídica pública em menos de 60 segundos.
            </p>
            <Link href="/register?plan=explorer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 28px', borderRadius: '12px', textDecoration: 'none',
              background: 'linear-gradient(135deg, #1d4ed8, #0891b2)',
              color: 'white', fontWeight: 700, fontSize: '14px',
              boxShadow: '0 0 20px rgba(56,189,248,0.3)',
            }}>
              Verificar agora — R$ 49,90 →
            </Link>
          </div>

          {/* Related */}
          <div>
            <h2 style={{ fontFamily: 'serif', fontSize: '1.4rem', color: 'white', marginBottom: '20px', fontWeight: 400 }}>
              Outros artigos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {related.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div style={{
                    background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px', padding: '18px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, color: post.tagColor,
                        fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>{post.tag}</span>
                      <p style={{ fontSize: '14px', color: 'white', marginTop: '4px', lineHeight: 1.3 }}>{post.title}</p>
                    </div>
                    <span style={{ fontSize: '16px', color: 'rgba(56,189,248,0.5)', flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
