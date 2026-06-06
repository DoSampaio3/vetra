'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { ScoreRing } from '@/components/ScoreRing';
import { Card, Button, Badge, ScoreBar } from '@/components/ui/index';
import { api, VerifyInput } from '@/lib/api';

const STEPS = [
  { id: 1, label: 'Validando dados informados',         icon: '✓' },
  { id: 2, label: 'Verificando presença digital',       icon: '🔍' },
  { id: 3, label: 'Consultando Instagram via API',      icon: '📸' },
  { id: 4, label: 'Consultando Datajud CNJ',          icon: '⚖️' },
  { id: 5, label: 'Calculando trust score',             icon: '📊' },
  { id: 6, label: 'Analisando com Inteligência Artificial', icon: '✦' },
  { id: 7, label: 'Salvando histórico e relatório',     icon: '💾' },
];

const SIGNAL_LABELS: Record<string, string> = {
  identity: 'Identidade', social: 'Social',
  behavioral: 'Comportamental', consistency: 'Consistência',
};

const LEVEL_LABELS: Record<string, string> = {
  very_high: 'Excelente', high: 'Alto',
  medium: 'Médio', low: 'Baixo', very_low: 'Muito Baixo',
};

const LEVEL_BADGE: Record<string, any> = {
  very_high: 'green', high: 'blue', medium: 'yellow',
  low: 'red', very_low: 'red',
};

function validateCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

export default function VerifyPage() {
  const { user, loading, decrementCredits, refreshUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<VerifyInput>({
    email: '', phone: '', username: '', cpf: '', birth_date: '',
  });
  const [preview, setPreview] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  // Fluxo de progresso
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const advanceStep = async (stepId: number, delayMs = 900) => {
    setCurrentStep(stepId);
    await new Promise(r => setTimeout(r, delayMs));
    setCompletedSteps(prev => [...prev, stepId]);
  };

  const handlePreview = async () => {
    const hasData = Object.values(form).some(v => v?.trim());
    if (!hasData) { setError('Preencha ao menos um campo para análise.'); return; }
    setPreviewing(true); setError('');
    try {
      const clean = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v?.trim())
      ) as VerifyInput;
      const result = await api.verify.analyze(clean);
      setPreview(result);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar prévia.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async () => {
    if (!consent) { setError('Confirme o consentimento para prosseguir.'); return; }
    const hasData = Object.values(form).some(v => v?.trim());
    if (!hasData) { setError('Preencha ao menos um campo.'); return; }

    // Valida CPF no frontend se informado
    if (form.cpf?.trim() && !validateCPF(form.cpf)) {
      setError('CPF inválido. Verifique o número informado.');
      return;
    }

    // Bloqueia se sem créditos (exceto unlimited)
    if (user && user.credits !== 999 && user.credits <= 0) {
      setError('Você não tem créditos. Adquira um plano para continuar.');
      return;
    }

    setSubmitting(true);
    setError('');
    setCurrentStep(0);
    setCompletedSteps([]);

    try {
      // Simula etapas visuais enquanto API processa
      const progressPromise = (async () => {
        await advanceStep(1, 600);
        await advanceStep(2, 700);
        await advanceStep(3, 1000);
        await advanceStep(4, 1200);
        await advanceStep(5, 800);
        await advanceStep(6, 1400);
        await advanceStep(7, 600);
      })();

      const clean = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v?.trim())
      ) as VerifyInput;

      const [result] = await Promise.all([
        api.verify.submit(clean),
        progressPromise,
      ]);

      decrementCredits(); // Atualiza UI imediatamente
      await refreshUser();  // Sincroniza com servidor
      router.push(`/report/${result.report_id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório. Tente novamente.');
      setCurrentStep(0);
      setCompletedSteps([]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  const fields = [
    { key: 'email',      label: 'Email',                             placeholder: 'usuario@exemplo.com', type: 'email', icon: '✉' },
    { key: 'phone',      label: 'Telefone',                          placeholder: '(11) 99999-9999',      type: 'tel',   icon: '☎' },
    { key: 'username',   label: 'Username (Instagram, TikTok, etc)', placeholder: '@usuario',             type: 'text',  icon: '@' },
    { key: 'cpf',        label: 'CPF', placeholder: '000.000.000-00', type: 'text', icon: '#' },
    { key: 'birth_date', label: 'Data de Nascimento',                placeholder: '',                     type: 'date',  icon: '◷' },
  ] as const;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-8 md:pb-4">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nova Verificação</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Informe os dados para análise. Apenas fontes públicas e consentidas são consultadas.
          </p>
        </div>

        {/* Sem créditos */}
        {user && user.credits <= 0 && user.credits !== 999 && (
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <span>⚠</span>
              <span>Você não tem créditos para gerar relatórios.</span>
            </div>
            <a href="/settings" className="text-xs font-semibold text-red-700 underline">Adquirir agora →</a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Formulário */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                Dados para análise
              </h2>
              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      <span className="text-gray-400 mr-1">{field.icon}</span>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={'placeholder' in field ? field.placeholder : ''}
                      value={form[field.key as keyof VerifyInput]}
                      disabled={submitting}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                        outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                        hover:border-gray-300 placeholder:text-gray-400 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Consentimento */}
            <Card>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                Consentimento e conformidade LGPD
              </h2>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consent}
                  onChange={e => setConsent(e.target.checked)} disabled={submitting}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 flex-shrink-0" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  Declaro que possuo consentimento para analisar estes dados e concordo com os{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">Termos de Uso</a>.
                  O Vetra utiliza apenas fontes públicas. Nenhuma base privada ou sigilosa é acessada.
                </span>
              </label>
            </Card>

            {/* Erro */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Fluxo de progresso */}
            {submitting && (
              <Card>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                  Processando verificação...
                </p>

                {/* Barra de progresso */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
                  />
                </div>

                <div className="space-y-2.5">
                  {STEPS.map(step => {
                    const done = completedSteps.includes(step.id);
                    const active = currentStep === step.id && !done;
                    const waiting = currentStep < step.id;
                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-all ${
                          done    ? 'bg-emerald-500 text-white' :
                          active  ? 'bg-blue-600 text-white'    :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {done ? '✓' : active ? (
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                          ) : step.id}
                        </div>
                        <span className={`text-xs transition-colors ${
                          done    ? 'text-emerald-600 font-medium' :
                          active  ? 'text-blue-600 font-semibold'  :
                          waiting ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {step.label}
                        </span>
                        {done && <span className="ml-auto text-xs text-emerald-500">✓</span>}
                        {active && <span className="ml-auto text-xs text-blue-500 animate-pulse">em andamento...</span>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Botões */}
            {!submitting && (
              <div className="space-y-3">
                {!consent && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span>⚠</span> Marque o consentimento acima para habilitar o botão de gerar relatório.
                  </p>
                )}
                {/* No mobile: fixado acima da barra de navegação (64px de altura) */}
                <div className="hidden md:flex gap-3">
                  <Button variant="ghost" onClick={handlePreview} disabled={previewing} size="md">
                    {previewing
                      ? <><span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Analisando...</>
                      : '◎ Pré-visualizar'}
                  </Button>
                  <Button onClick={handleSubmit} disabled={!consent} size="md" className="flex-1 justify-center">
                    {consent ? 'Gerar Relatório Completo →' : '🔒 Aguardando consentimento'}
                  </Button>
                </div>
                {/* Mobile: fixado na tela acima da nav bar */}
                <div
                  className="flex md:hidden gap-3"
                  style={{
                    position: 'fixed',
                    bottom: '64px',       /* altura exata da barra de nav mobile */
                    left: 0,
                    right: 0,
                    padding: '12px 16px',
                    background: 'white',
                    borderTop: '1px solid #E5E7EB',
                    boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
                    zIndex: 40,
                  }}
                >
                  <Button variant="ghost" onClick={handlePreview} disabled={previewing} size="md">
                    {previewing
                      ? <><span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Analisando...</>
                      : '◎ Prévia'}
                  </Button>
                  <Button onClick={handleSubmit} disabled={!consent} size="md" className="flex-1 justify-center">
                    {consent ? 'Gerar Relatório →' : '🔒 Aguardando consentimento'}
                  </Button>
                </div>
                {/* Espaço reservado no mobile para o botão fixo não cobrir conteúdo */}
                <div className="h-16 md:hidden" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {preview ? (
              <Card>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Prévia do Score</h3>
                <div className="flex flex-col items-center py-3">
                  <ScoreRing score={preview.total_score} level={preview.level} size={100} />
                  <Badge variant={LEVEL_BADGE[preview.level]} className="mt-3">
                    {LEVEL_LABELS[preview.level]}
                  </Badge>
                </div>
                <div className="space-y-2.5 mt-4 pt-4 border-t border-gray-100">
                  {Object.entries(preview.breakdown || {}).map(([key, val]: [string, any]) => (
                    <ScoreBar key={key} score={val.score} label={SIGNAL_LABELS[key] || key} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-3 font-mono">
                  {preview.signals_found} sinais identificados
                </p>
              </Card>
            ) : (
              <Card>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">O que é verificado</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Perfil Instagram',   status: 'real',  src: 'RocketAPI' },
                    { label: 'Registros judiciais', status: 'real',  src: 'Consulta Jurídica' },
                    { label: 'Validade do email',   status: 'real',  src: 'Verificação' },
                    { label: 'Formato do telefone', status: 'real',  src: 'Padrão BR' },
                    { label: 'CPF',                  status: 'real',  src: 'Consulta jurídica' },
                    { label: 'Análise por IA',       status: 'real',  src: 'Gemini AI' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div>
                        <span className="text-xs text-gray-600">{item.label}</span>
                        <span className="text-[10px] text-gray-400 ml-1.5 font-mono">({item.src})</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'real'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.status === 'real' ? '✓ Ativo' : '~ Formato'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Como funciona</h3>
              <div className="space-y-3">
                {[
                  { n: '01', t: 'Dados públicos', d: 'Verificamos redes sociais e registros públicos em tempo real' },
                  { n: '02', t: 'IA analisa', d: 'Gemini AI interpreta os sinais e gera análise em português' },
                  { n: '03', t: 'Score gerado', d: 'Relatório completo com explicação de cada fator' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.n}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{s.t}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
