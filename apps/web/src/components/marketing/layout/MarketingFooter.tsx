'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MarketingFooter() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const anchor = (hash: string) => isHome ? hash : `/${hash}`;

  return (
    <footer className="relative" style={{ background: "#020817", borderTop: "1px solid rgba(56,189,248,0.06)" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">

        {/* CTA */}
        <div className="rounded-2xl p-8 sm:p-10 mb-16 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, rgba(14,30,60,0.8), rgba(10,22,40,0.8))",
            border: "1px solid rgba(56,189,248,0.15)",
            boxShadow: "0 0 40px rgba(56,189,248,0.04)",
          }}>
          <div>
            <p className="text-white font-semibold text-lg mb-1">Pronto para verificar?</p>
            <p className="text-sm" style={{ color: "rgba(100,116,139,0.7)" }}>Seu primeiro relatório por R$ 49,90. Sem assinatura.</p>
          </div>
          <Link href="/register?plan=explorer"
            className="flex-shrink-0 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #0891b2)", boxShadow: "0 0 20px rgba(56,189,248,0.2)" }}>
            Começar agora →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #0891b2)" }}>
                <span className="text-white text-xs font-bold">V</span>
              </div>
              <span className="text-white font-semibold">Vetra</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-[200px]" style={{ color: "rgba(100,116,139,0.6)" }}>
              Score de confiança digital gerado por IA com fontes públicas reais.
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono" style={{ color: "rgba(52,211,153,0.6)" }}>Powered by Gemini AI</span>
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Produto",
              links: [
                { label: "Como funciona", href: anchor("#como-funciona") },
                { label: "Planos", href: anchor("#planos") },
                { label: "FAQ", href: anchor("#faq") },
              ],
            },
            {
              title: "Empresa",
              links: [
                { label: "Sobre o Vetra", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Contato", href: "/contact" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Termos de Uso", href: "/terms" },
                { label: "Privacidade", href: "/privacy" },
                { label: "Cookies", href: "/cookies" },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "rgba(100,116,139,0.5)" }}>{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href}
                      className="text-sm transition-colors"
                      style={{ color: "rgba(148,163,184,0.5)" }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-xs" style={{ color: "rgba(100,116,139,0.4)" }}>
            © {new Date().getFullYear()} Vetra. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono" style={{ color: "rgba(100,116,139,0.3)" }}>
            <span>Apenas dados públicos</span>
            <span>·</span>
            <span>LGPD compliant</span>
            <span>·</span>
            <span>SSL criptografado</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
