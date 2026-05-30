import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';
import { query, queryOne } from '../database/connection';

export const billingRouter = Router();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3';

const PLAN_PRICES: Record<string, { plan: string; credits: number; value: number; description: string }> = {
  explorer: { plan: 'free', credits: 1, value: 49.90, description: 'Vetra Explorer — 1 Relatório Premium' },
  pro: { plan: 'premium', credits: 10, value: 97.90, description: 'Vetra Pro Insight — 10 Relatórios/mês' },
  power: { plan: 'enterprise', credits: 999, value: 197.90, description: 'Vetra Power — Relatórios Ilimitados' },
};

async function asaasRequest(path: string, method = 'GET', body?: object): Promise<any> {
  if (!ASAAS_API_KEY) throw new Error('ASAAS_API_KEY nao configurada');
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', access_token: ASAAS_API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Asaas API error ${res.status}: ${err}`); }
  return res.json();
}

async function getOrCreateCustomer(email: string, name: string, userId: string, cpf?: string): Promise<string> {
  try {
    const existing = await asaasRequest(`/customers?externalReference=${userId}`);
    if (existing?.data?.length > 0) {
      const existingId = existing.data[0].id;
      if (cpf) await asaasRequest(`/customers/${existingId}`, 'PUT', { cpfCnpj: cpf.replace(/\D/g, '') });
      return existingId;
    }
  } catch {}
  const customer = await asaasRequest('/customers', 'POST', { name, email, externalReference: userId, ...(cpf ? { cpfCnpj: cpf.replace(/\D/g, '') } : {}) });
  return customer.id;
}

billingRouter.post('/create-checkout', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!ASAAS_API_KEY) return res.status(503).json({ error: 'Pagamentos nao configurados.' });
    const { plan_key, billing_type, cpf, card } = req.body as { plan_key: string; billing_type?: string; cpf?: string; card?: any };
    const planConfig = PLAN_PRICES[plan_key];
    if (!planConfig) return res.status(400).json({ error: 'Plano invalido.' });
    const user = await queryOne<{ email: string; full_name: string; asaas_customer_id?: string }>(
      `SELECT u.email, u.full_name, s.asaas_customer_id FROM users u LEFT JOIN subscriptions s ON s.user_id = u.id WHERE u.id = $1 ORDER BY s.created_at DESC LIMIT 1`,
      [req.user!.id]
    );
    const customerId = user?.asaas_customer_id || await getOrCreateCustomer(user?.email || '', user?.full_name || 'Cliente Vetra', req.user!.id, cpf);
    const isRecurring = plan_key !== 'explorer';
    const paymentType = billing_type || 'PIX';
    const dueDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    let paymentId: string;
    let checkoutUrl = '';
    let pixQrCode = '';
    let pixKey = '';
    if (isRecurring) {
      const subscription = await asaasRequest('/subscriptions', 'POST', {
        customer: customerId, billingType: paymentType, value: planConfig.value,
        nextDueDate: dueDate, cycle: 'MONTHLY', description: planConfig.description,
        externalReference: JSON.stringify({ vetra_user_id: req.user!.id, plan_key }),
        redirectLink: `${process.env.FRONTEND_URL}/dashboard?payment=success&plan=${plan_key}`,
        ...(paymentType === 'CREDIT_CARD' && card ? {
          creditCard: { holderName: card.holderName, number: card.number.replace(/\s/g,''), expiryMonth: card.expiryMonth, expiryYear: card.expiryYear, ccv: card.ccv },
          creditCardHolderInfo: { name: card.holderName, email: req.user!.email || '', cpfCnpj: cpf || '', postalCode: card.postalCode.replace(/\D/g,''), addressNumber: card.addressNumber, phone: '' }
        } : {}),
      });
      paymentId = subscription.id;
      const payments = await asaasRequest(`/payments?subscription=${subscription.id}`);
      const firstPayment = payments?.data?.[0];
      if (paymentType === 'PIX' && firstPayment?.id) {
        try {
          const pixData = await asaasRequest(`/payments/${firstPayment.id}/pixQrCode`);
          pixQrCode = pixData?.encodedImage || '';
          pixKey = pixData?.payload || '';
        } catch {}
      }
      checkoutUrl = firstPayment?.invoiceUrl || '';
    } else {
      const payment = await asaasRequest('/payments', 'POST', {
        customer: customerId, billingType: paymentType, value: planConfig.value,
        dueDate, description: planConfig.description,
        externalReference: JSON.stringify({ vetra_user_id: req.user!.id, plan_key }),
        ...(paymentType === 'CREDIT_CARD' && card ? {
          creditCard: { holderName: card.holderName, number: card.number.replace(/\s/g,''), expiryMonth: card.expiryMonth, expiryYear: card.expiryYear, ccv: card.ccv },
          creditCardHolderInfo: { name: card.holderName, email: req.user!.email || '', cpfCnpj: cpf || '', postalCode: card.postalCode.replace(/\D/g,''), addressNumber: card.addressNumber, phone: '' }
        } : {}),
      });
      paymentId = payment.id;
      if (paymentType === 'PIX') {
        try {
          const pixData = await asaasRequest(`/payments/${payment.id}/pixQrCode`);
          pixQrCode = pixData?.encodedImage || '';
          pixKey = pixData?.payload || '';
        } catch {}
      }
      checkoutUrl = payment.invoiceUrl || payment.bankSlipUrl || '';
    }
    res.json({ checkout_url: checkoutUrl, payment_id: paymentId, pix_qr_code: pixQrCode, pix_key: pixKey });
  } catch (err: any) {
    console.error('[billing/create-checkout]', err.message);
    res.status(500).json({ error: err.message });
  }
});

billingRouter.get('/payment-status/:paymentId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const sub = await queryOne<{ status: string; plan: string }>(
      `SELECT status, plan FROM subscriptions WHERE (asaas_payment_id=$1 OR asaas_subscription_id=$1) AND user_id=$2`,
      [paymentId, req.user!.id]
    );
    if (sub?.status === 'active') return res.json({ confirmed: true, plan: sub.plan });
    res.json({ confirmed: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    const webhookToken = req.headers['asaas-access-token'];
    if (process.env.ASAAS_WEBHOOK_TOKEN && webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const payment = event?.payment;
    if (!payment?.externalReference) return res.json({ received: true });
    let meta: { vetra_user_id: string; plan_key: string };
    try { meta = JSON.parse(payment.externalReference); } catch { return res.json({ received: true }); }
    const { vetra_user_id: userId, plan_key: planKey } = meta;
    const planConfig = PLAN_PRICES[planKey];
    if (!userId || !planConfig) return res.json({ received: true });
    switch (event.event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED': {
        const isOneTime = planKey === 'explorer';
        const subId = payment.subscription || payment.id;
        const periodInterval = isOneTime ? '1 year' : '30 days';
        await query(
          `INSERT INTO subscriptions (user_id, asaas_customer_id, asaas_subscription_id, asaas_payment_id, status, plan, current_period_start, current_period_end) VALUES ($1,$2,$3,$4,'active',$5,NOW(),NOW() + INTERVAL '${periodInterval}') ON CONFLICT (asaas_subscription_id) DO UPDATE SET status='active', plan=EXCLUDED.plan, updated_at=NOW()`,
          [userId, payment.customer, subId, payment.id, planConfig.plan]
        );
        if (isOneTime) {
          await query('UPDATE users SET plan=$1, credits=credits+$2 WHERE id=$3', [planConfig.plan, planConfig.credits, userId]);
        } else {
          await query('UPDATE users SET plan=$1, credits=$2 WHERE id=$3', [planConfig.plan, planConfig.credits, userId]);
        }
        break;
      }
      case 'PAYMENT_OVERDUE':
        await query("UPDATE subscriptions SET status='past_due' WHERE asaas_payment_id=$1", [payment.id]);
        break;
      case 'SUBSCRIPTION_DELETED':
      case 'SUBSCRIPTION_CANCELED': {
        const sub = await queryOne<{ user_id: string }>('SELECT user_id FROM subscriptions WHERE asaas_subscription_id=$1', [payment.subscription]);
        if (sub) {
          await query("UPDATE subscriptions SET status='canceled', cancel_at_period_end=true WHERE asaas_subscription_id=$1", [payment.subscription]);
          await query("UPDATE users SET plan='free', credits=1 WHERE id=$1", [sub.user_id]);
        }
        break;
      }
    }
    res.json({ received: true });
  } catch (err: any) {
    console.error('[webhook] Erro:', err.message);
    res.status(500).json({ error: err.message });
  }
});

billingRouter.get('/subscription', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sub = await queryOne(`SELECT asaas_subscription_id, status, plan, current_period_start, current_period_end, cancel_at_period_end FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1`, [req.user!.id]);
    const user = await queryOne<{ plan: string; credits: number }>('SELECT plan, credits FROM users WHERE id=$1', [req.user!.id]);
    res.json({ subscription: sub, user_plan: user?.plan, credits: user?.credits });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

billingRouter.post('/cancel', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!ASAAS_API_KEY) return res.status(503).json({ error: 'Asaas nao configurado.' });
    const sub = await queryOne<{ asaas_subscription_id: string }>("SELECT asaas_subscription_id FROM subscriptions WHERE user_id=$1 AND status='active'", [req.user!.id]);
    if (!sub) return res.status(404).json({ error: 'Nenhuma assinatura ativa.' });
    await asaasRequest(`/subscriptions/${sub.asaas_subscription_id}`, 'DELETE');
    await query('UPDATE subscriptions SET cancel_at_period_end=true WHERE asaas_subscription_id=$1', [sub.asaas_subscription_id]);
    res.json({ ok: true, message: 'Assinatura sera cancelada ao fim do periodo.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
