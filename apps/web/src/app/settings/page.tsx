'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { Card, Button, Badge } from '@/components/ui/index';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.billing.getSubscription()
      .then(res => setSubscription(res))
      .catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  const planMap: Record<string, { label: string; badge: any; price: string }> = {
    free:       { label: 'Explorar',    badge: 'gray',  price: 'R$ 49,90 único' },
    premium:    { label: 'Pro Insight', badge: 'blue',  price: 'R$ 97,90/mês' },
    enterprise: { label: 'Vetra Power', badge: 'green', price: 'R$ 197,90/mês' },
  };
  const planInfo = planMap[user.plan] || planMap.free;

  const handleUpgrade = (planKey: string) => {
    window.location.href = '/checkout?plan=' + planKey;
  };

  const handleCancel = async () => {
    if (!confirm('Cancelar sua assinatura? Você perderá acesso ao fim do período.')) return;
    setCanceling(true);
    try {
      await api.billing.cancel();
      setMsg('Assinatura cancelada. Acesso até o fim do período.');
      await refreshUser();
    } catch (err: any) {
      setMsg(err.message);
    }
    setCanceling(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>

        {msg && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
            {msg}
          </div>
        )}

        {/* Conta */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Informações da conta</h2>
          <div className="space-y-3">
            {[
              { label: 'Nome', value: user.full_name },
              { label: 'Email', value: user.email },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-sm text-gray-800 font-medium">{item.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-500">Plano atual</span>
              <div className="flex items-center gap-2">
                <Badge variant={planInfo.badge}>{planInfo.label}</Badge>
                <span className="text-xs text-gray-400 font-mono">{planInfo.price}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-500">Créditos disponíveis</span>
              <span className="text-sm font-bold text-blue-600">
                {user.credits === 999 ? '∞ Ilimitado' : user.credits}
              </span>
            </div>
          </div>
        </Card>

        {/* Subscription status */}
        {subscription?.subscription && (
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Assinatura</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={subscription.subscription.status === 'active' ? 'green' : 'red'}>
                  {subscription.subscription.status}
                </Badge>
              </div>
              {subscription.subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Renova em</span>
                  <span className="text-gray-700 font-mono text-xs">
                    {new Date(subscription.subscription.current_period_end).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {subscription.subscription.cancel_at_period_end && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                  ⚠ Cancelamento agendado para o fim do período.
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Upgrade */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Planos disponíveis</h2>
          <div className="space-y-3">
            {[
              { key: 'explorer', label: 'Explorar', price: 'R$ 49,90 único', desc: '1 relatório completo', badge: 'gray' as const },
              { key: 'pro',      label: 'Pro Insight', price: 'R$ 97,90/mês', desc: '10 relatórios/mês', badge: 'blue' as const },
              { key: 'power',    label: 'Vetra Power', price: 'R$ 197,90/mês', desc: 'Ilimitado + API', badge: 'green' as const },
            ].map(plan => (
              <div key={plan.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <Badge variant={plan.badge}>{plan.label}</Badge>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{plan.desc}</p>
                    <p className="text-xs text-gray-400 font-mono">{plan.price}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={user.plan === 'free' || (user.plan === 'premium' && plan.key === 'power') ? 'primary' : 'ghost'}
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loadingCheckout !== null}
                >
                  {loadingCheckout === plan.key ? 'Aguarde...' : 'Assinar'}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            * Pagamentos processados via Stripe. Cancele quando quiser.
          </p>
        </Card>

        {/* Cancelar */}
        {user.plan !== 'free' && subscription?.subscription?.status === 'active' && !subscription?.subscription?.cancel_at_period_end && (
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Cancelar assinatura</h2>
            <p className="text-xs text-gray-500 mb-3">
              Você perderá acesso aos recursos premium ao fim do período atual.
            </p>
            <Button variant="danger" size="sm" onClick={handleCancel} disabled={canceling}>
              {canceling ? 'Cancelando...' : 'Cancelar assinatura'}
            </Button>
          </Card>
        )}

        {/* Logout */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Sessão</h2>
          <Button variant="ghost" size="md" onClick={() => { logout(); router.push('/login'); }}>
            ⇥ Sair da conta
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
