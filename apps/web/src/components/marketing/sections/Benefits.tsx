"use client";

const benefits = [
  { icon: "⚡", title: "Resultado em 60 segundos", desc: "O que levaria horas de pesquisa manual, o Vetra entrega em menos de um minuto com fontes verificadas.", color: "#fbbf24" },
  { icon: "🤖", title: "IA que explica tudo", desc: "Gemini AI interpreta cada sinal e gera uma análise em linguagem humana. Você entende exatamente por que o score é aquele.", color: "#a78bfa" },
  { icon: "⚖️", title: "Registros judiciais reais", desc: "Integração real com Consulta Jurídica. Processos públicos consultados automaticamente, sem que você precise acessar nenhum tribunal.", color: "#38bdf8" },
  { icon: "🔒", title: "100% legal e ético", desc: "Apenas dados públicos. LGPD compliant. Nunca acessamos bases privadas, dados bancários ou informações sigilosas.", color: "#34d399" },
  { icon: "📊", title: "Score explicável", desc: "Cada ponto do score tem uma razão. Sem caixa preta. Você vê todos os sinais, pesos e contribuições de cada fonte.", color: "#38bdf8" },
  { icon: "📄", title: "Relatório em PDF", desc: "Exporte o relatório completo com branding premium, score visual, análise IA e dados para guardar ou compartilhar.", color: "#a78bfa" },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020817 0%, #050d1f 100%)" }}>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8" style={{ background: "rgba(56,189,248,0.5)" }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(56,189,248,0.7)" }}>Benefícios</span>
        </div>

        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white max-w-3xl mx-auto mb-5 leading-tight">
            Tecnologia real.<br />
            <span style={{ color: "rgba(56,189,248,0.8)" }}>Resultados reais.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <div key={i} className="group p-7 rounded-2xl transition-all duration-300"
              style={{
                background: "rgba(10,22,40,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(10px)",
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
                style={{ background: `${b.color}12`, border: `1px solid ${b.color}25` }}>
                {b.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-base">{b.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(148,163,184,0.6)" }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
