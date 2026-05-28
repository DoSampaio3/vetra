"use client";
import { useState } from "react";

const faqs = [
  { q: "O Vetra acessa dados privados ou governamentais?", a: "Não. O Vetra utiliza exclusivamente dados públicos: perfis de redes sociais acessíveis publicamente, registros judiciais disponíveis no portal Consulta Jurídica do  e padrões digitais públicos. Nenhuma base privada, bancária ou sigilosa é acessada. Tudo dentro da LGPD." },
  { q: "O que é o Consulta Jurídica e como é usado?", a: "O Consulta Jurídica é o sistema público de consulta de processos judiciais do  (Conselho Nacional de Justiça). O Vetra consulta automaticamente processos públicos associados ao CPF ou nome informado, enriquecendo o score com informações judiciais legalmente acessíveis." },
  { q: "Em quanto tempo o relatório fica pronto?", a: "Em menos de 60 segundos na maioria dos casos. A análise inclui verificação de redes sociais, consulta ao Consulta Jurídica e processamento por Gemini AI — tudo em paralelo para máxima velocidade." },
  { q: "Posso exportar o relatório em PDF?", a: "Sim. Todos os planos incluem exportação em PDF com layout premium, score visual, análise completa por IA e branding Vetra. O PDF pode ser baixado imediatamente após a geração do relatório." },
  { q: "É legal verificar outra pessoa?", a: "Sim, desde que os dados verificados sejam públicos e o uso seja legítimo (encontros, contratações, parcerias, proteção pessoal). O Vetra foi construído para ser LGPD compliant: apenas dados públicos, finalidade legítima, sem invasão de privacidade." },
  { q: "Como funciona a verificação do Instagram?", a: "O Vetra usa a API oficial do RocketAPI (parceiro autorizado) para verificar dados públicos do perfil: número de seguidores, autenticidade, postagens, bio e padrões de comportamento. Nenhum dado privado ou mensagem é acessado." },
  { q: "Posso cancelar a assinatura a qualquer momento?", a: "Sim. Assinaturas Pro e Power podem ser canceladas a qualquer momento, sem multa ou fidelidade. O acesso continua até o fim do período já pago." },
  { q: "O plano Explorar é realmente pagamento único?", a: "Sim. R$ 49,90 uma única vez, sem assinatura, sem renovação automática. Você gera 1 relatório completo e mantém acesso a ele permanentemente." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050d1f 0%, #020817 100%)" }}>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8" style={{ background: "rgba(56,189,248,0.5)" }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(56,189,248,0.7)" }}>FAQ</span>
        </div>

        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl text-white mb-5 leading-tight">
            Dúvidas frequentes
          </h2>
          <p className="text-base" style={{ color: "rgba(148,163,184,0.6)" }}>
            Tudo que você precisa saber antes de começar.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: open === i ? "rgba(14,30,60,0.8)" : "rgba(10,22,40,0.5)",
                border: open === i ? "1px solid rgba(56,189,248,0.2)" : "1px solid rgba(255,255,255,0.05)",
              }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-200">
                <span className="text-sm font-semibold pr-4"
                  style={{ color: open === i ? "#38bdf8" : "rgba(226,232,240,0.9)" }}>
                  {faq.q}
                </span>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200"
                  style={{
                    background: open === i ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)",
                    color: open === i ? "#38bdf8" : "rgba(100,116,139,0.6)",
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}>
                  ▾
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(148,163,184,0.65)" }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm mb-4" style={{ color: "rgba(100,116,139,0.6)" }}>Ainda tem dúvidas?</p>
          <a href="/contact" className="text-sm font-medium transition-colors"
            style={{ color: "#38bdf8" }}>
            Fale com nosso suporte →
          </a>
        </div>
      </div>
    </section>
  );
}
