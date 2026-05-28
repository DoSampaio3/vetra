'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const anchor = (hash: string) => isHome ? hash : `/${hash}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(2,8,23,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(56,189,248,0.08)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #0891b2)", boxShadow: "0 0 12px rgba(56,189,248,0.3)" }}>
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="font-semibold text-white tracking-wide">Vetra</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {[
            { label: "Como funciona", href: anchor("#como-funciona") },
            { label: "Planos", href: anchor("#planos") },
            { label: "FAQ", href: anchor("#faq") },
            { label: "Sobre", href: "/about" },
            { label: "Blog", href: "/blog" },
          ].map(link => (
            <a key={link.label} href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{ color: "rgba(148,163,184,0.7)" }}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-3">
          <Link href="/login"
            className="hidden sm:block text-sm font-medium transition-colors"
            style={{ color: "rgba(148,163,184,0.7)" }}>
            Entrar
          </Link>
          <Link href="/register?plan=explorer"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #0891b2)",
              boxShadow: "0 0 20px rgba(56,189,248,0.25)",
            }}>
            Começar — R$ 49,90
          </Link>
        </div>
      </div>
    </nav>
  );
}
