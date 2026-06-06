'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { ScoreRing } from '@/components/ScoreRing';
import { Card, Button, Badge, ScoreBar } from '@/components/ui/index';
import { api, VerifyInput } from '@/lib/api';

const STEPS = [
  { id:1, label:'Validando dados informados' },
  { id:2, label:'Verificando presença digital' },
  { id:3, label:'Consultando Instagram via API' },
  { id:4, label:'Realizando consulta jurídica' },
  { id:5, label:'Calculando trust score' },
  { id:6, label:'Analisando com Inteligência Artificial' },
  { id:7, label:'Salvando histórico e relatório' },
];

const SIGNAL_LABELS: Record<string,string> = {
  identity:'Identidade', social:'Social', behavioral:'Comportamental', consistency:'Consistência',
};
const LEVEL_LABELS: Record<string,string> = {
  very_high:'Excelente', high:'Alto', medium:'Médio', low:'Baixo', very_low:'Muito Baixo',
};
const LEVEL_BADGE: Record<string,any> = {
  very_high:'green', high:'blue', medium:'yellow', low:'red', very_low:'red',
};

export default function VerifyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name:'', city:'', email:'', phone:'', username:'', cpf:'', birth_date:'' });
  const [preview, setPreview] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading, router]);

  const advanceStep = async (stepId: number, delayMs = 900) => {
    setCurrentStep(stepId);
    await new Promise(r => setTimeout(r, delayMs));
    setCompletedSteps(prev => [...prev, stepId]);
  };

  const handlePreview = async () => {
    const hasData = Object.entries(form).some(([k,v]) => k !== 'name' && k !== 'city' && v?.trim());
    if (!hasData) { setError('Preencha ao menos um campo além de nome e cidade.'); return; }
    setPreviewing(true); setError('');
    try {
      const clean: VerifyInput = {};
      if (form.email)      clean.email      = form.email;
      if (form.phone)      clean.phone      = form.phone;
      if (form.username)   clean.username   = form.username;
      if (form.cpf)        clean.cpf        = form.cpf;
      if (form.birth_date) clean.birth_date = form.birth_date;
      const result = await api.verify.analyze(clean);
      setPreview(result);
    } catch (err:any) { setError(err.message || 'Erro ao gerar prévia.'); }
    finally { setPreviewing(false); }
  };

  const handleSubmit = async () => {
    if (!consent) { setError('Confirme o consentimento para prosseguir.'); return; }
    const hasData = Object.entries(form).some(([k,v]) => k !== 'name' && k !== 'city' && v?.trim());
    if (!hasData) { setError('Preencha ao menos um campo de contato.'); return; }
    setSubmitting(true); setError(''); setCurrentStep(0); setCompletedSteps([]);
    try {
      const progressPromise = (async () => {
        await advanceStep(1, 600); await advanceStep(2, 700); await advanceStep(3, 1000);
        await advanceStep(4, 1200); await advanceStep(5, 800); await advanceStep(6, 1400); await advanceStep(7, 600);
      })();
      const clean: VerifyInput = {};
      if (form.email)      clean.email      = form.email;
      if (form.phone)      clean.phone      = form.phone;
      if (form.username)   clean.username   = form.username;
      if (form.cpf)        clean.cpf        = form.cpf;
      if (form.birth_date) clean.birth_date = form.birth_date;
      const [result] = await Promise.all([api.verify.submit(clean), progressPromise]);
      router.push(`/report/${result.report_id}`);
    } catch (err:any) {
      setError(err.message || 'Erro ao gerar relatório. Tente novamente.');
      setCurrentStep(0); setCompletedSteps([]);
    } finally { setSubmitting(false); }
  };

  if (loading || !user) return null;

  const fields = [
    { key:'name',       label:'Nome completo',        placeholder:'João Silva',          type:'text',  icon:'👤', required: false },
    { key:'city',       label:'Cidade',               placeholder:'São Paulo, SP',       type:'text',  icon:'📍', required: false },
    { key:'email',      label:'Email',                placeholder:'joao@exemplo.com',    type:'email', icon:'✉',  required: false },
    { key:'phone',      label:'Telefone',             placeholder:'(11) 99999-9999',     type:'tel',   icon:'☎',  required: false },
    { key:'username',   label:'Username (Instagram)', placeholder:'@usuario',            type:'text',  icon:'@',  required: false },
    { key:'cpf',        label:'CPF',                  placeholder:'000.000.000-00',      type:'text',  icon:'#',  required: false },
    { key:'birth_date', label:'Data de Nascimento',   placeholder:'',                    type:'date',  icon:'◷',  required: false },
  ] as const;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Nova Verificação</h1>
          <p className="text-xs text-gray-500 mt-0.5">Informe os dados para análise. Apenas fontes públicas são consultadas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Formulário */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                Dados da pessoa a analisar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map(field => (
                  <div key={field.key} className={field.key === 'birth_date' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      <span className="text-gray-400 mr-1">{field.icon}</span>{field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={'placeholder' in field ? field.placeholder : ''}
                      value={form[field.key as keyof typeof form]}
                      disabled={submitting}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
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
                <span className="flex-shrink-0">⚠</span><span>{error}</span>
              </div>
            )}

            {/* Progress */}
            {submitting && (
              <Card>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Processando verificação...</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${(completedSteps.length/STEPS.length)*100}%` }} />
                </div>
                <div className="space-y-2">
                  {STEPS.map(step => {
                    const done = completedSteps.includes(step.id);
                    const active = currentStep === step.id && !done;
                    return (
                      <div key={step.id} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-all ${
                          done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {done ? '✓' : active ? <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin block" /> : step.id}
                        </div>
                        <span className={`text-xs ${done?'text-emerald-600 font-medium':active?'text-blue-600 font-semibold':'text-gray-400'}`}>
                          {step.label}
                        </span>
                        {active && <span className="ml-auto text-[10px] text-blue-400 animate-pulse">em andamento...</span>}
                        {done && <span className="ml-auto text-[10px] text-emerald-500">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Botões */}
            {!submitting && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="ghost" onClick={handlePreview} disabled={previewing} size="md" className="w-full sm:w-auto">
                  {previewing ? <><span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>Analisando...</> : '◎ Pré-visualizar'}
                </Button>
                <Button onClick={handleSubmit} disabled={!consent} size="md" className="flex-1 justify-center">
                  Gerar Análise →
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div className="lg:col-span-2 space-y-4">
            {preview ? (
              <Card>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Prévia</h3>
                <div className="flex flex-col items-center py-2">
                  <ScoreRing score={preview.total_score} level={preview.level} size={90} />
                  <Badge variant={LEVEL_BADGE[preview.level]} className="mt-2">{LEVEL_LABELS[preview.level]}</Badge>
                </div>
                <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                  {Object.entries(preview.breakdown || {}).map(([key,val]:[string,any]) => (
                    <ScoreBar key={key} score={val.score||0} label={SIGNAL_LABELS[key]||key} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-2 font-mono">{preview.signals_found} sinais</p>
              </Card>
            ) : (
              <Card>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">O que é verificado</h3>
                <div className="space-y-2">
                  {[
                    { label:'Perfil Instagram',   status:'real' },
                    { label:'Consulta jurídica',  status:'real' },
                    { label:'Validade do email',  status:'real' },
                    { label:'Telefone',           status:'real' },
                    { label:'CPF',                status:'real' },
                    { label:'Análise por IA',     status:'real' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-600">{item.label}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">✓ Ativo</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
