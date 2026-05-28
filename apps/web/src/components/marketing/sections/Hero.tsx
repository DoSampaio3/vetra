"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const headlines = [
  "Perfis podem mentir.\nDados não.",
  "Sua intuição falha.\nDados públicos não.",
  "O primeiro encontro\nnão deveria ser um risco.",
  "Antes de confiar,\nverifique.",
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 1s ease, transform 1s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % headlines.length); setVisible(true); }, 400);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      position: "relative", minHeight: "100vh", display: "flex", alignItems: "center",
      overflow: "hidden",
      background: "linear-gradient(135deg, #020817 0%, #0a1628 40%, #0d1f3c 70%, #060d1a 100%)",
    }}>
      {/* Backgrounds */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "600px", borderRadius: "50%", opacity: 0.18,
          background: "radial-gradient(ellipse, #1e40af 0%, #0891b2 40%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: "30%", left: "-10%", width: "500px", height: "500px",
          borderRadius: "50%", opacity: 0.08,
          background: "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "-10%", width: "400px", height: "400px",
          borderRadius: "50%", opacity: 0.08,
          background: "radial-gradient(ellipse, #0e7490 0%, transparent 70%)",
        }} />
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
        @keyframes heroFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes scan { 0%{transform:translateY(0);opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{transform:translateY(100vh);opacity:0} }
        .hero-float { animation: heroFloat 6s ease-in-out infinite; }
        .hero-scan { animation: scan 10s linear infinite; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(56,189,248,0.4),transparent); pointer-events:none; }
        .hero-h1 { font-family: Georgia,serif; font-weight:400; line-height:1.08; letter-spacing:-0.02em; color:white; text-align:center; white-space:pre-line; font-size:clamp(2.2rem,6vw,5rem); max-width:min(90vw,900px); transition:opacity 0.4s ease,transform 0.4s ease; }
        .hero-sub { font-size:clamp(0.9rem,2vw,1.1rem); max-width:min(90vw,600px); text-align:center; line-height:1.7; color:rgba(148,163,184,0.9); }
        .hero-cta-primary { display:inline-flex; align-items:center; gap:10px; padding:clamp(12px,2vw,16px) clamp(24px,4vw,36px); border-radius:14px; font-weight:700; color:white; text-decoration:none; font-size:clamp(0.8rem,1.5vw,0.9rem); background:linear-gradient(135deg,#1d4ed8,#0891b2); box-shadow:0 0 30px rgba(56,189,248,0.3),0 4px 20px rgba(0,0,0,0.4); transition:all 0.25s ease; white-space:nowrap; }
        .hero-cta-secondary { display:inline-flex; align-items:center; gap:10px; padding:clamp(12px,2vw,16px) clamp(24px,4vw,36px); border-radius:14px; font-size:clamp(0.8rem,1.5vw,0.9rem); font-weight:500; text-decoration:none; border:1px solid rgba(56,189,248,0.2); color:rgba(148,163,184,0.9); background:rgba(255,255,255,0.03); transition:all 0.2s ease; white-space:nowrap; }
        .mockup-window { background:rgba(10,22,40,0.85); border:1px solid rgba(56,189,248,0.18); border-radius:20px; overflow:hidden; box-shadow:0 0 0 1px rgba(56,189,248,0.05),0 30px 90px rgba(0,0,0,0.7),0 0 80px rgba(56,189,248,0.06); backdrop-filter:blur(20px); }
        @media (max-width:640px) { .hero-cta-row{flex-direction:column!important;align-items:stretch!important} .hero-cta-primary,.hero-cta-secondary{justify-content:center} .mockup-stats{grid-template-columns:1fr 1fr!important} }
      ` }} />

      <div style={{ position: "absolute", inset: 0 }} className="hero-scan" />

      <div style={{
        position: "relative", width: "100%",
        maxWidth: "1200px", margin: "0 auto",
        padding: "clamp(80px,12vw,140px) clamp(16px,4vw,32px) clamp(60px,8vw,100px)",
      }}>
        <div ref={heroRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "8px 20px", borderRadius: "100px",
            border: "1px solid rgba(56,189,248,0.3)",
            background: "rgba(56,189,248,0.05)", backdropFilter: "blur(10px)",
          }}>
            <span style={{ position: "relative", display: "inline-flex", width: "8px", height: "8px" }}>
              <span style={{
                position: "absolute", inset: 0, borderRadius: "50%", background: "#22d3ee",
                animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite", opacity: 0.75,
              }} />
              <span style={{ position: "relative", borderRadius: "50%", width: "8px", height: "8px", background: "#22d3ee" }} />
            </span>
            <span style={{ fontSize: "clamp(9px,1.5vw,11px)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#22d3ee", fontFamily: "monospace" }}>
              IA + Registros Públicos + Redes Sociais
            </span>
          </div>

          {/* Badge proteção */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 18px", borderRadius: "100px",
            border: "1px solid rgba(248,113,113,0.25)",
            background: "rgba(248,113,113,0.05)",
          }}>
            <span style={{ fontSize: "14px" }}>🛡️</span>
            <span style={{ fontSize: "clamp(9px,1.5vw,11px)", color: "rgba(248,113,113,0.8)", fontFamily: "monospace", letterSpacing: "0.06em" }}>
              Usado para verificar matches antes do primeiro encontro
            </span>
          </div>

          {/* Rotating headline com clamp */}
          <div style={{ minHeight: "clamp(100px,18vw,200px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <h1 className="hero-h1" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-10px)" }}>
              {headlines[idx]}
            </h1>
          </div>

          {/* Subheadline */}
          <p className="hero-sub">
            O Vetra cruza{" "}
            <strong style={{ color: "#38bdf8" }}>registros públicos</strong>,{" "}
            <strong style={{ color: "#38bdf8" }}>redes sociais</strong> e{" "}
            <strong style={{ color: "#38bdf8" }}>padrões digitais</strong>{" "}
            para gerar um score de confiança antes que você tome qualquer decisão.
          </p>
          <p style={{ fontSize: "clamp(0.78rem,1.5vw,0.875rem)", color: "rgba(100,116,139,0.8)", textAlign: "center" }}>
            Em menos de 60 segundos. Sem cadastro complicado. Sem dados privados.
          </p>

          {/* CTAs */}
          <div className="hero-cta-row" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
            <Link href="/register?plan=explorer" className="hero-cta-primary">
              🛡️ Verificar agora — R$ 49,90
              <span style={{ transition: "transform 0.2s" }}>→</span>
            </Link>
            <a href="#como-funciona" className="hero-cta-secondary">
              <span style={{
                width: "22px", height: "22px", borderRadius: "50%",
                border: "1px solid rgba(56,189,248,0.3)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "10px", color: "#38bdf8",
              }}>▶</span>
              Ver como funciona
            </a>
          </div>

          {/* Social proof */}
          <div className="mockup-stats" style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            gap: "clamp(12px,3vw,32px)", marginTop: "8px",
          }}>
            {[
              { v: "4.200+", l: "verificações" },
              { v: "98%", l: "satisfação" },
              { v: "<60s", l: "por relatório" },
              { v: "LGPD", l: "compliant" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: "clamp(0.9rem,2vw,1.1rem)", color: "#38bdf8", fontFamily: "monospace" }}>{s.v}</div>
                <div style={{ fontSize: "clamp(9px,1.2vw,11px)", color: "rgba(100,116,139,0.6)", marginTop: "2px" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Mockup */}
          <div className="hero-float" style={{ width: "100%", maxWidth: "min(100%, 760px)", marginTop: "16px" }}>
            <div className="mockup-window">
              {/* Titlebar */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 20px", borderBottom: "1px solid rgba(56,189,248,0.07)",
                background: "rgba(5,15,30,0.6)",
              }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  {["#ff5f57","#febc2e","#28c840"].map((c,i) => (
                    <div key={i} style={{ width: "11px", height: "11px", borderRadius: "50%", background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <div style={{
                  flex: 1, margin: "0 12px", padding: "4px 12px", borderRadius: "6px",
                  background: "rgba(255,255,255,0.04)", fontFamily: "monospace",
                  fontSize: "11px", color: "rgba(56,189,248,0.4)", textAlign: "left",
                }}>
                  app.vetra.ai/report/<span style={{ color: "rgba(56,189,248,0.7)" }}>análise-concluída</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(52,211,153,0.7)" }}>VERIFICADO</span>
                </div>
              </div>

              <div style={{ padding: "clamp(16px,4vw,32px)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(16px,4vw,28px)" }}>
                  {/* Score ring */}
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <svg width="110" height="110" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="10"/>
                      <circle cx="70" cy="70" r="54" fill="none" stroke="#38bdf8" strokeWidth="10"
                        strokeDasharray="339.3" strokeDashoffset="67.8"
                        strokeLinecap="round" transform="rotate(-90 70 70)"
                        style={{ filter: "drop-shadow(0 0 8px rgba(56,189,248,0.6))" }}/>
                      <text x="70" y="66" textAnchor="middle" fontSize="30" fontWeight="bold" fill="white" fontFamily="serif">82</text>
                      <text x="70" y="84" textAnchor="middle" fontSize="9" fill="#38bdf8" fontFamily="monospace" letterSpacing="2">SCORE</text>
                    </svg>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>✓ Confiável</span>
                  </div>

                  {/* Results */}
                  <div style={{ flex: 1, minWidth: "180px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { l: "Perfil Instagram", v: "Real · 1.2k seguidores", src: "RocketAPI" },
                      { l: "Registros judiciais", v: "Nenhum (Consulta Jurídica)", src: "" },
                      { l: "Email verificado", v: "gmail.com · ativo", src: "Verificação" },
                      { l: "Padrão de bot", v: "Não detectado", src: "IA" },
                    ].map((item, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px", borderRadius: "8px",
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                          <span style={{ fontSize: "11px", color: "rgba(56,189,248,0.4)", whiteSpace: "nowrap" }}>{item.l}</span>
                          <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", background: "rgba(56,189,248,0.06)", color: "rgba(56,189,248,0.4)", fontFamily: "monospace", whiteSpace: "nowrap" }}>{item.src}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{item.v}</span>
                          <span style={{ color: "#34d399", fontSize: "11px" }}>✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI bar */}
                <div style={{
                  marginTop: "16px", padding: "14px 16px", borderRadius: "12px",
                  background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(56,189,248,0.08))",
                  border: "1px solid rgba(124,58,237,0.15)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ color: "#a78bfa", fontSize: "12px" }}>✦</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#a78bfa" }}>Análise Gemini AI</span>
                    <span style={{ marginLeft: "auto", fontSize: "9px", fontFamily: "monospace", color: "rgba(167,139,250,0.5)" }}>gemini-1.5-flash</span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.6, color: "rgba(148,163,184,0.7)" }}>
                    Perfil com alta consistência digital. Nenhum registro judicial público via Consulta Jurídica. Presença social verificada e autêntica. Score de confiança: <span style={{ color: "#34d399" }}>alto</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: "12px 16px",
        background: "linear-gradient(to top, rgba(2,8,23,0.98), transparent)",
      }} className="md:hidden">
        <Link href="/register?plan=explorer" className="hero-cta-primary" style={{ width: "100%", justifyContent: "center", display: "flex" }}>
          🛡️ Verificar agora — R$ 49,90 →
        </Link>
      </div>
    </section>
  );
}
