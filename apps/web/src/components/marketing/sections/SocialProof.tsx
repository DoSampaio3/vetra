"use client";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    quote: "Antes do primeiro encontro com alguém do Tinder, rodei o Vetra. O score veio baixo com inconsistências no perfil. Cancelei. Minha amiga passou pela mesma situação e foi assediada. Me protegi a tempo.",
    name: "Juliana M.",
    role: "São Paulo",
    avatar: "JM",
    tag: "🛡️ Proteção real",
    tagColor: "#f87171",
    stars: 5,
  },
  {
    quote: "Meu ex usava perfis falsos para me contatar. Com o Vetra consegui identificar os padrões, comprovar que era ele e usar isso juridicamente. Mudou minha situação completamente.",
    name: "Camila R.",
    role: "Rio de Janeiro",
    avatar: "CR",
    tag: "⚖️ Prova jurídica",
    tagColor: "#f87171",
    stars: 5,
  },
  {
    quote: "Como advogada, uso antes de qualquer reunião com cliente novo. Já evitei dois contratos problemáticos em três meses. O relatório com Consulta Jurídica é o diferencial — encontrei processos que jamais descobriria no Google.",
    name: "Dra. Patricia Lima",
    role: "Advogada · Curitiba",
    avatar: "PL",
    tag: "💼 Uso profissional",
    tagColor: "#38bdf8",
    stars: 5,
  },
  {
    quote: "Perdi R$ 8.000 com um fornecedor que não verifiquei. Desde então uso o Vetra em todo contrato. Em 6 meses identifiquei 3 perfis com histórico judicial público que teriam me custado muito caro.",
    name: "Marcos T.",
    role: "Empresário · BH",
    avatar: "MT",
    tag: "💰 Prevenção financeira",
    tagColor: "#34d399",
    stars: 5,
  },
  {
    quote: "Trabalho com freelancers remotos. O Vetra virou etapa obrigatória do meu onboarding. Já identifiquei 2 perfis suspeitos antes de fechar contrato. Economizei tempo e dinheiro.",
    name: "Ana Luísa C.",
    role: "CEO · Florianópolis",
    avatar: "AC",
    tag: "🚀 Processo de contratação",
    tagColor: "#38bdf8",
    stars: 5,
  },
  {
    quote: "Antes de emprestar dinheiro para um conhecido, rodei o Vetra. Score baixo, alertas no Consulta Jurídica. Não emprestei. Depois soube que ele havia aplicado golpes em outras pessoas da cidade.",
    name: "Roberto S.",
    role: "Empresário · Salvador",
    avatar: "RS",
    tag: "🎯 Decisão inteligente",
    tagColor: "#fbbf24",
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-sm" style={{ color: "#fbbf24" }}>★</span>
      ))}
    </div>
  );
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let c = 0;
        const step = target / 50;
        const t = setInterval(() => {
          c += step;
          if (c >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(c));
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

export default function SocialProof() {
  return (
    <section id="depoimentos" className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020817 0%, #050d1f 100%)" }}>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(ellipse, #f87171, transparent 70%)" }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Protection banner */}
        <div className="rounded-2xl p-8 sm:p-12 mb-20 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(248,113,113,0.06) 0%, rgba(251,146,60,0.04) 100%)",
            border: "1px solid rgba(248,113,113,0.15)",
            boxShadow: "0 0 80px rgba(248,113,113,0.04)",
          }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.4), transparent)" }} />

          <div className="text-5xl mb-5">🛡️</div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white max-w-2xl mx-auto mb-4 leading-tight">
            Você merece saber com quem está{" "}
            <span style={{ color: "#f87171" }}>antes de se encontrar</span>
          </h2>
          <p className="text-base max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: "rgba(148,163,184,0.6)" }}>
            Tinder, Instagram, WhatsApp. Você nunca sabe realmente quem está do outro lado.
            O Vetra verifica perfis, histórico digital e registros judiciais públicos — e te dá
            um score de confiança antes do primeiro encontro.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["✓ Perfil real verificado", "✓ Detecta contas fake", "✓ Registros judiciais (Consulta Jurídica)", "✓ Resultado em 60s"].map((item, i) => (
              <span key={i} className="text-sm px-4 py-2 rounded-full"
                style={{ border: "1px solid rgba(248,113,113,0.2)", color: "rgba(248,113,113,0.8)", background: "rgba(248,113,113,0.05)" }}>
                {item}
              </span>
            ))}
          </div>
          <a href="/register?plan=explorer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)", boxShadow: "0 0 20px rgba(220,38,38,0.2)" }}>
            Verificar antes do encontro →
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 pb-16"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { value: 4200, suffix: "+", label: "Relatórios gerados" },
            { value: 98, suffix: "%", label: "Taxa de satisfação" },
            { value: 60, suffix: "s", label: "Tempo médio" },
            { value: 15, suffix: "+", label: "Fontes verificadas" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-white mb-1">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(100,116,139,0.6)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Label */}
        <div className="flex items-center gap-3 mb-12">
          <div className="h-px w-8" style={{ background: "rgba(56,189,248,0.4)" }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(56,189,248,0.6)" }}>
            Histórias reais de quem usou
          </span>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {testimonials.map((t, i) => (
            <div key={i} className="flex flex-col rounded-2xl p-6 transition-all duration-300 group"
              style={{
                background: "rgba(10,22,40,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(10px)",
              }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ color: t.tagColor, background: `${t.tagColor}12`, border: `1px solid ${t.tagColor}25` }}>
                  {t.tag}
                </span>
                <Stars count={t.stars} />
              </div>
              <blockquote className="text-sm leading-relaxed flex-1 mb-5"
                style={{ color: "rgba(148,163,184,0.7)" }}>
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3 pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.2)" }}>
                  <span className="text-xs font-bold" style={{ color: "#38bdf8" }}>{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: "rgba(100,116,139,0.6)" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "rgba(100,116,139,0.5)" }}>Usado por</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Mulheres em apps de relacionamento", "Recrutadores de RH", "Advogados", "Empreendedores", "Freelancers", "Investidores", "Detetives particulares"].map((u, i) => (
              <span key={i} className="text-sm px-4 py-2 rounded-full"
                style={{ border: "1px solid rgba(255,255,255,0.07)", color: "rgba(148,163,184,0.5)", background: "rgba(255,255,255,0.02)" }}>
                {u}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
