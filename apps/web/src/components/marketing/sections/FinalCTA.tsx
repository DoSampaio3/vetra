"use client";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020817 0%, #050d1f 100%)" }}>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #1d4ed8, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-5xl mb-6">🛡️</div>

        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white max-w-3xl mx-auto mb-6 leading-tight">
          Sua próxima decisão pode ser{" "}
          <span style={{
            background: "linear-gradient(135deg, #38bdf8, #0891b2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            a mais bem informada
          </span>{" "}
          que você já tomou
        </h2>

        <p className="text-lg mb-4 max-w-xl mx-auto leading-relaxed"
          style={{ color: "rgba(148,163,184,0.7)" }}>
          Nunca mais vá para um encontro, assine um contrato ou confie em alguém
          sem antes verificar quem realmente está do outro lado.
        </p>

        <p className="text-sm mb-12" style={{ color: "rgba(100,116,139,0.5)" }}>
          Comece com R$ 49,90 · Sem assinatura · Acesso imediato
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link href="/register?plan=explorer"
            className="group relative overflow-hidden rounded-xl px-10 py-5 text-base font-bold text-white transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #0891b2)",
              boxShadow: "0 0 40px rgba(56,189,248,0.3), 0 8px 30px rgba(0,0,0,0.4)",
            }}>
            <span className="relative flex items-center gap-2">
              🛡️ Proteger minha decisão agora
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
          <Link href="#planos"
            className="flex items-center justify-center gap-2 rounded-xl px-8 py-5 text-sm font-medium transition-all duration-200"
            style={{ border: "1px solid rgba(56,189,248,0.2)", color: "rgba(148,163,184,0.8)", background: "rgba(255,255,255,0.02)" }}>
            Ver todos os planos
          </Link>
        </div>

        {/* Trust */}
        <div className="flex flex-wrap justify-center gap-6 text-xs"
          style={{ color: "rgba(100,116,139,0.5)" }}>
          {["🔒 SSL criptografado", "LGPD compliant", "Dados apenas públicos", "Resultado em 60s"].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
