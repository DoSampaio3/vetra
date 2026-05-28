"use client";
import Link from "next/link";

const plans = [
  {
    key: "explorer",
    name: "Explorar",
    price: "R$ 49,90",
    period: "pagamento único",
    description: "Para quem quer verificar antes de uma decisão pontual.",
    cta: "Verificar agora",
    ctaHref: "/register?plan=explorer",
    featured: false,
    color: "#64748b",
    features: [
      "1 relatório completo premium",
      "Score de confiança 0–100",
      "Análise por Gemini AI",
      "Verificação Instagram (real)",
      "Consulta Consulta Jurídica",
      "Exportação em PDF",
    ],
    notIncluded: ["Histórico de consultas", "API access"],
    badge: null,
  },
  {
    key: "pro",
    name: "Pro Insight",
    price: "R$ 99,90",
    period: "/mês",
    description: "Para quem toma decisões frequentes e precisa de histórico.",
    cta: "Começar Pro",
    ctaHref: "/register?plan=pro",
    featured: true,
    color: "#38bdf8",
    features: [
      "10 relatórios/mês",
      "Score de confiança 0–100",
      "Análise aprofundada por IA",
      "Verificação Instagram (real)",
      "Consulta Consulta Jurídica",
      "Histórico completo",
      "Exportação PDF premium",
      "Suporte prioritário",
    ],
    notIncluded: ["API access"],
    badge: "Mais escolhido",
  },
  {
    key: "power",
    name: "Vetra Power",
    price: "R$ 197",
    period: "/mês",
    description: "Para profissionais e empresas que não podem errar.",
    cta: "Quero o Power",
    ctaHref: "/register?plan=power",
    featured: false,
    color: "#a78bfa",
    features: [
      "Pesquisas ilimitadas",
      "Score de confiança 0–100",
      "IA avançada (Gemini Pro)",
      "Verificação Instagram (real)",
      "Consulta Consulta Jurídica",
      "Histórico ilimitado",
      "PDF + API access",
      "Dashboard premium",
      "Processamento prioritário",
      "Suporte dedicado",
    ],
    notIncluded: [],
    badge: "Ilimitado",
  },
];

export default function Pricing() {
  return (
    <section id="planos" className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050d1f 0%, #020817 100%)" }}>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-5"
          style={{ background: "radial-gradient(ellipse, #38bdf8, transparent 70%)" }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8" style={{ background: "rgba(56,189,248,0.5)" }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(56,189,248,0.7)" }}>
            Planos e preços
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white max-w-3xl mx-auto mb-5 leading-tight">
            Comece por{" "}
            <span style={{
              background: "linear-gradient(135deg, #38bdf8, #0891b2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              R$ 49,90
            </span>
          </h2>
          <p className="text-lg" style={{ color: "rgba(148,163,184,0.6)" }}>
            Sem fidelidade. Cancele quando quiser. Acesso imediato.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div key={plan.key} className="relative flex flex-col rounded-2xl p-7 transition-all duration-300"
              style={{
                background: plan.featured
                  ? "linear-gradient(135deg, rgba(14,30,60,0.9), rgba(10,22,50,0.9))"
                  : "rgba(10,22,40,0.6)",
                border: plan.featured
                  ? `1px solid rgba(56,189,248,0.35)`
                  : "1px solid rgba(255,255,255,0.06)",
                boxShadow: plan.featured
                  ? "0 0 0 1px rgba(56,189,248,0.1), 0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(56,189,248,0.08)"
                  : "0 20px 60px rgba(0,0,0,0.3)",
                backdropFilter: "blur(10px)",
              }}>
              {/* Top glow for featured */}
              {plan.featured && (
                <div className="absolute -top-px left-8 right-8 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.7), transparent)" }} />
              )}

              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{
                      background: plan.featured
                        ? "linear-gradient(135deg, #1d4ed8, #0891b2)"
                        : `linear-gradient(135deg, ${plan.color}80, ${plan.color}40)`,
                      boxShadow: plan.featured ? "0 0 20px rgba(56,189,248,0.4)" : "none",
                    }}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: plan.color }} />
                  <span className="text-sm font-semibold" style={{ color: plan.color }}>{plan.name}</span>
                </div>
                <div className="mb-2">
                  <span className="font-serif text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm ml-1" style={{ color: "rgba(100,116,139,0.7)" }}>{plan.period}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(100,116,139,0.7)" }}>{plan.description}</p>
              </div>

              {/* CTA */}
              <Link href={plan.ctaHref}
                className="block w-full text-center py-3.5 rounded-xl text-sm font-bold mb-6 transition-all duration-200"
                style={plan.featured ? {
                  background: "linear-gradient(135deg, #1d4ed8, #0891b2)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(56,189,248,0.3)",
                } : {
                  background: `${plan.color}12`,
                  color: plan.color,
                  border: `1px solid ${plan.color}30`,
                }}>
                {plan.cta} →
              </Link>

              {/* Features */}
              <div className="flex-1 space-y-2.5">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#34d399" }}>✓</span>
                    <span className="text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 opacity-30">
                    <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "rgba(100,116,139,0.5)" }}>✗</span>
                    <span className="text-xs" style={{ color: "rgba(100,116,139,0.5)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs"
          style={{ color: "rgba(100,116,139,0.5)" }}>
          {["🔒 Pagamento seguro SSL", "↩ Cancele quando quiser", "⚡ Acesso imediato", "📋 LGPD compliant", "🤖 Powered by Gemini AI"].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
