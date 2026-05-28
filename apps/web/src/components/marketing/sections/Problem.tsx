"use client";
import { useEffect, useRef } from "react";
import SectionWrapper from "@/components/marketing/ui/SectionWrapper";

const risks = [
  {
    icon: "💬",
    headline: "Você sabe tudo sobre o perfil.",
    subheadline: "Mas quase nada sobre a pessoa.",
    body: "Fotos editadas, histórias elaboradas, meses de conversa. Tudo pode ser construído. O maior perigo dos encontros online é a falsa sensação de segurança.",
    stat: "1 em 3",
    statDesc: "mulheres já enfrentaram situação de risco após encontro com alguém de app",
    color: "#f87171",
    glow: "rgba(248,113,113,0.15)",
  },
  {
    icon: "🎭",
    headline: "Golpes começam com confiança.",
    subheadline: "E terminam em prejuízo real.",
    body: "Perfis falsos, identidades roubadas, histórias inventadas. O golpe emocional e financeiro começa sempre da mesma forma: com alguém que parece real demais.",
    stat: "R$ 2.1bi",
    statDesc: "perdidos em golpes digitais no Brasil em 2023",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.15)",
  },
  {
    icon: "🔍",
    headline: "Pesquisar manualmente não funciona.",
    subheadline: "Leva horas e ainda deixa dúvida.",
    body: "Google, Instagram, LinkedIn, fóruns. Horas depois você ainda não tem certeza de nada. As informações estão espalhadas, sem estrutura, sem score, sem clareza.",
    stat: "73%",
    statDesc: "das fraudes digitais são evitáveis com verificação prévia simples",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.15)",
  },
];

export default function Problem() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll("[data-card]").forEach((el, i) => {
              setTimeout(() => {
                (el as HTMLElement).style.opacity = "1";
                (el as HTMLElement).style.transform = "translateY(0)";
              }, i * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="problema" className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020817 0%, #050d1f 100%)" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(248,113,113,1) 1px, transparent 1px), linear-gradient(90deg, rgba(248,113,113,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div ref={ref}>
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8" style={{ background: "rgba(248,113,113,0.5)" }} />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(248,113,113,0.7)" }}>
              O risco que você não vê
            </span>
          </div>

          {/* Headline centralizado */}
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white max-w-4xl mx-auto mb-5 leading-tight">
              O maior risco dos encontros online é a{" "}
              <span style={{
                background: "linear-gradient(135deg, #f87171, #fb923c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                falsa sensação de segurança
              </span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(148,163,184,0.7)" }}>
              Pesquisar pessoas hoje é lento, fragmentado e impreciso. E as consequências podem ser sérias.
            </p>
          </div>

          {/* Risk cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {risks.map((r, i) => (
              <div key={i} data-card
                style={{
                  opacity: 0,
                  transform: "translateY(40px)",
                  transition: "opacity 0.6s ease, transform 0.6s ease",
                  background: "rgba(10,22,40,0.6)",
                  border: `1px solid rgba(255,255,255,0.06)`,
                  borderRadius: "20px",
                  padding: "28px",
                  backdropFilter: "blur(10px)",
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 20px 60px rgba(0,0,0,0.4)`,
                  position: "relative" as const,
                  overflow: "hidden",
                }}>
                {/* Glow top */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-30 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse, ${r.color}, transparent 70%)` }} />

                <div className="relative">
                  <div className="text-4xl mb-5">{r.icon}</div>
                  <h3 className="font-serif text-xl text-white mb-1">{r.headline}</h3>
                  <p className="text-sm font-semibold mb-3" style={{ color: r.color }}>{r.subheadline}</p>
                  <p className="text-sm leading-relaxed mb-7" style={{ color: "rgba(148,163,184,0.6)" }}>{r.body}</p>
                  <div className="pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-3xl font-bold font-mono mb-1" style={{ color: r.color }}>{r.stat}</div>
                    <p className="text-xs" style={{ color: "rgba(100,116,139,0.7)" }}>{r.statDesc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert banner */}
          <div className="rounded-2xl p-8 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(248,113,113,0.06), rgba(251,146,60,0.06))",
              border: "1px solid rgba(248,113,113,0.15)",
              boxShadow: "0 0 40px rgba(248,113,113,0.05)",
            }}>
            <p className="text-2xl font-serif text-white mb-3">
              "Você confiaria em alguém sem verificar?"
            </p>
            <p className="text-sm mb-6" style={{ color: "rgba(148,163,184,0.6)" }}>
              A maioria das pessoas só descobre tarde demais. Com o Vetra, você descobre antes.
            </p>
            <a href="/register?plan=explorer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #dc2626, #ea580c)",
                boxShadow: "0 0 20px rgba(220,38,38,0.3)",
              }}>
              🛡️ Descobrir antes do encontro →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
