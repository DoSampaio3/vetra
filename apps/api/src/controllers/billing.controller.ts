import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';
import { query, queryOne } from '../database/connection';

export const billingRouter = Router();

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Planos Vetra → Stripe Price IDs
const PLAN_PRICES: Record<string, { priceId: string; plan: string; credits: number }> = {
  explorer: {
    priceId: process.env.STRIPE_PRICE_EXPLORER || 'price_explorer',
    plan: 'free',
    credits: 1,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
    plan: 'premium',
    credits: 10,
  },
  power: {
    priceId: process.env.STRIPE_PRICE_POWER || 'price_power',
    plan: 'enterprise',
    credits: 999,
  },
};

function getStripe() {
  if (!STRIPE_SECRET) throw new Error('STRIPE_SECRET_KEY não configurada');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require('stripe');
  return new Stripe(STRIPE_SECRET, { apiVersion: '2023-10-16' });
}

// POST /api/billing/create-checkout
billingRouter.post('/create-checkout', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!STRIPE_SECRET) {
      return res.status(503).json({ error: 'Pagamentos não configurados. Configure STRIPE_SECRET_KEY.' });
    }

    const { plan_key } = req.body as { plan_key: string };
    const planConfig = PLAN_PRICES[plan_key];
    if (!planConfig) {
      return res.status(400).json({ error: 'Plano inválido.' });
    }

    const stripe = getStripe();
    const user = await queryOne<{ email: string; stripe_customer_id?: string }>(
      `SELECT u.email, s.stripe_customer_id
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id
       WHERE u.id = $1`,
      [req.user!.id]
    );

    let customerId = user?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { vetra_user_id: req.user!.id },
      });
      customerId = customer.id;
    }

    const isRecurring = plan_key !== 'explorer';

    // Métodos de pagamento: cartão sempre disponível
    // Pix e boleto: apenas para pagamentos únicos (Stripe não suporta Pix em subscriptions)
    const paymentMethods: string[] = isRecurring
      ? ['card']
      : ['card', 'boleto', 'pix'];

    const sessionParams: any = {
      customer: customerId,
      payment_method_types: paymentMethods,
      mode: isRecurring ? 'subscription' : 'payment',
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&plan=${plan_key}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?plan=${plan_key}&canceled=true`,
      metadata: { vetra_user_id: req.user!.id, plan_key },
      locale: 'pt-BR',
    };

    // Configurações específicas para Pix (validade de 24h)
    if (!isRecurring) {
      sessionParams.payment_method_options = {
        pix: { expires_after_seconds: 86400 }, // 24 horas
        boleto: { expires_after_days: 3 },      // 3 dias úteis
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (err: any) {
    console.error('[billing/create-checkout]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/webhook — Stripe webhook
billingRouter.post(
  '/webhook',
  // Raw body necessário para verificação de assinatura
  async (req: Request, res: Response) => {
    if (!STRIPE_SECRET || !STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: 'Stripe não configurado.' });
    }

    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    let event: any;

    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody || req.body,
        sig,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('[webhook] Assinatura inválida:', err.message);
      return res.status(400).json({ error: 'Webhook signature inválida.' });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.metadata?.vetra_user_id;
          const planKey = session.metadata?.plan_key;
          const planConfig = PLAN_PRICES[planKey];
          if (!userId || !planConfig) break;

          const isOneTime = planKey === 'explorer';
          // Para pagamento único, subscription é null — usa payment_intent como ID único
          const subId = session.subscription || session.payment_intent || `one_time_${session.id}`;
          // Período de acesso: 1 ano para pagamento único, 30 dias para assinatura
          const periodInterval = isOneTime ? '1 year' : '30 days';

          const sql = 'INSERT INTO subscriptions'
            + ' (user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, status, plan, current_period_start, current_period_end)'
            + " VALUES ($1, $2, $3, $4, 'active', $5, NOW(), NOW() + INTERVAL '" + periodInterval + "')"
            + ' ON CONFLICT (stripe_subscription_id) DO UPDATE SET'
            + "  status = 'active', plan = EXCLUDED.plan, updated_at = NOW()";

          await query(sql, [userId, session.customer, subId, planConfig.priceId, planConfig.plan]);

          // Créditos: para explorer soma 1, para planos recorrentes redefine
          if (isOneTime) {
            await query(
              'UPDATE users SET plan = $1, credits = credits + $2 WHERE id = $3',
              [planConfig.plan, planConfig.credits, userId]
            );
          } else {
            await query(
              'UPDATE users SET plan = $1, credits = $2 WHERE id = $3',
              [planConfig.plan, planConfig.credits, userId]
            );
          }

          console.log('✅ Pagamento: user ' + userId + ' → plano ' + planConfig.plan + ' (' + (isOneTime ? 'único' : 'recorrente') + ')');
          break;
        }

        case 'customer.subscription.deleted':
        case 'customer.subscription.paused': {
          const subscription = event.data.object;
          await query(
            `UPDATE subscriptions SET status = 'canceled', cancel_at_period_end = true
             WHERE stripe_subscription_id = $1`,
            [subscription.id]
          );
          // Downgrade para free
          const sub = await queryOne<{ user_id: string }>(
            'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
            [subscription.id]
          );
          if (sub) {
            await query(
              "UPDATE users SET plan = 'free', credits = 1 WHERE id = $1",
              [sub.user_id]
            );
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          await query(
            "UPDATE subscriptions SET status = 'past_due' WHERE stripe_subscription_id = $1",
            [invoice.subscription]
          );
          break;
        }
      }
    } catch (err: any) {
      console.error('[webhook] Erro ao processar:', err.message);
    }

    res.json({ received: true });
  }
);

// GET /api/billing/subscription
billingRouter.get('/subscription', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sub = await queryOne(
      `SELECT stripe_subscription_id, status, plan, current_period_start,
              current_period_end, cancel_at_period_end
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [req.user!.id]
    );
    const user = await queryOne<{ plan: string; credits: number }>(
      'SELECT plan, credits FROM users WHERE id = $1',
      [req.user!.id]
    );
    res.json({ subscription: sub, user_plan: user?.plan, credits: user?.credits });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/cancel
billingRouter.post('/cancel', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!STRIPE_SECRET) return res.status(503).json({ error: 'Stripe não configurado.' });

    const sub = await queryOne<{ stripe_subscription_id: string }>(
      "SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = 'active'",
      [req.user!.id]
    );
    if (!sub) return res.status(404).json({ error: 'Nenhuma assinatura ativa.' });

    const stripe = getStripe();
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await query(
      'UPDATE subscriptions SET cancel_at_period_end = true WHERE stripe_subscription_id = $1',
      [sub.stripe_subscription_id]
    );

    res.json({ ok: true, message: 'Assinatura será cancelada ao fim do período.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
