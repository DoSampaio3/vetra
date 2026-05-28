"use client";
import { useEffect, useRef } from "react";
import SectionWrapper from "@/components/marketing/ui/SectionWrapper";

const steps = [
  {
    number: "01",
    icon: "✍️",
    title: "Informe qualquer dado público",
    desc: "Email, username do Instagram, telefone, nome ou CPF. Qualquer ponto de partida já é suficiente para iniciar a análise completa.",
    detail: "Dados criptografados em trânsito · TLS 1.3",
    color: "#38bdf8",
  },
  {
    number: "02",
    icon: "🤖",
    title: "IA cruza múltiplas fontes",
    desc: "O Vetra consulta automaticamente redes sociais via API real, registros judiciais públicos via Consulta Jurídica e analisa padrões comportamentais com Gemini AI.",
    detail: "Gemini AI · RocketAPI · Consulta Jurídica",
    color: "#a78bfa",
  },
  {
    number: "03",
    icon: "📊",
    title: "Score + relatório completo",
    desc: "Score de confiança de 0 a 100, análise em linguagem humana, alertas de risco, destaques positivos e recomendação clara. Exportável em PDF.",
    detail: "Entregue em menos de 60 segundos",
    color: "#34d399",
  },
];

const sources = [
  { name: "Instagram API", desc: "Perfil, seguidores, autenticidade", icon: "📸", status: "Ativo" },
  { name: "Consulta Jurídica", desc: "Processos judiciais públicos", icon: "⚖️", status: "Ativo" },
  { name: "Gemini AI", desc: "Análise e interpretação inteligente", icon: "✦", status: "Ativo" },
  { name: "Cross-validation", desc: "Consistência entre fontes", icon: "🔗", status: "Ativo" },
];

export default function Solution() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll("[data-step]").forEach((el, i) => {
              setTimeout(() => {
                (el as HTMLElement).style.opacity = "1";
                (el as HTMLElement).style.transform = "translateY(0) scale(1)";
              }, i * 180);
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
    <section id="como-funciona" className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050d1f 0%, #020817 100%)" }}>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(ellipse, #0891b2, transparent 70%)" }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8" style={{ background: "rgba(56,189,248,0.5)" }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(56,189,248,0.7)" }}>
            Como funciona
          </span>
        </div>

        {/* Headline centralizado */}
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white max-w-3xl mx-auto mb-5 leading-tight">
            Da pergunta ao relatório em{" "}
            <span style={{
              background: "linear-gradient(135deg, #38bdf8, #0891b2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              menos de 60 segundos
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(148,163,184,0.6)" }}>
            Três etapas simples. Sem configuração. Sem burocracia.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, i) => (
            <div key={i} data-step
              style={{
                opacity: 0,
                transform: "translateY(30px) scale(0.97)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                background: "rgba(10,22,40,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "28px",
                backdropFilter: "blur(10px)",
                position: "relative" as const,
                overflow: "hidden",
              }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${step.color}40, transparent)` }} />

              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}30`, color: step.color }}>
                  {step.number}
                </div>
                <span className="text-2xl">{step.icon}</span>
              </div>

              <h3 className="font-serif text-xl text-white mb-3">{step.title}</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(148,163,184,0.6)" }}>{step.desc}</p>
              <div className="flex items-center gap-2 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: step.color }} />
                <span className="text-xs font-mono" style={{ color: "rgba(100,116,139,0.6)" }}>{step.detail}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sources */}
        <div className="rounded-2xl p-6"
          style={{ background: "rgba(10,22,40,0.5)", border: "1px solid rgba(56,189,248,0.1)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
            style={{ color: "rgba(56,189,248,0.5)" }}>
            Fontes consultadas em tempo real
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sources.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                  <p className="text-[10px] truncate" style={{ color: "rgba(100,116,139,0.7)" }}>{s.desc}</p>
                </div>
                <span className="ml-auto text-[10px] font-mono flex-shrink-0" style={{ color: "#34d399" }}>●</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <a href="/register"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              border: "1px solid rgba(56,189,248,0.25)",
              color: "#38bdf8",
              background: "rgba(56,189,248,0.05)",
            }}>
            Gerar meu primeiro relatório
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
