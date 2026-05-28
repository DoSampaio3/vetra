# Vetra — Configuração Stripe

## 1. ONDE PEGAR AS CHAVES

### Dashboard Stripe (modo teste)
1. Acesse https://dashboard.stripe.com/test/apikeys
2. Copie `STRIPE_SECRET_KEY` (começa com `sk_test_`)
3. `STRIPE_PUBLISHABLE_KEY` não é necessário no backend

### Criar os Products/Prices
1. https://dashboard.stripe.com/test/products
2. Clique "+ Add product" para cada plano:

**Explorar (pagamento único)**
- Name: Vetra Explorar
- Pricing: One time · R$ 49,90
- Copie o Price ID → `STRIPE_PRICE_EXPLORER`

**Pro Insight (recorrente)**
- Name: Vetra Pro Insight
- Pricing: Recurring · Monthly · R$ 99,90
- Copie o Price ID → `STRIPE_PRICE_PRO`

**Vetra Power (recorrente)**
- Name: Vetra Power
- Pricing: Recurring · Monthly · R$ 197,00
- Copie o Price ID → `STRIPE_PRICE_POWER`

---

## 2. WEBHOOK — LOCAL (desenvolvimento)

### Instalar Stripe CLI
```bash
# Windows (PowerShell admin)
winget install Stripe.StripeCLI

# macOS
brew install stripe/stripe-cli/stripe

# Linux
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | apt-key add -
```

### Iniciar listener local
```bash
stripe login
stripe listen --forward-to localhost:3001/api/billing/webhook
```

O CLI vai mostrar:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copie esse valor → `STRIPE_WEBHOOK_SECRET` no .env

---

## 3. WEBHOOK — PRODUÇÃO

1. https://dashboard.stripe.com/test/webhooks
2. "+ Add endpoint"
3. URL: `https://seu-dominio.com/api/billing/webhook`
4. Eventos a escutar:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `invoice.payment_failed`
5. Copie o "Signing secret" → `STRIPE_WEBHOOK_SECRET`

---

## 4. TESTAR

### Cartões de teste
| Situação | Número |
|---|---|
| Aprovado | 4242 4242 4242 4242 |
| Recusado | 4000 0000 0000 0002 |
| Autenticação 3DS | 4000 0025 0000 3155 |
| Fundos insuficientes | 4000 0000 0000 9995 |

Data: qualquer futura · CVV: qualquer 3 dígitos

### Simular cancelamento
```bash
stripe trigger customer.subscription.deleted
```

### Simular pagamento falho
```bash
stripe trigger invoice.payment_failed
```

---

## 5. .env COMPLETO

```env
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SEU_SECRET_AQUI
STRIPE_PRICE_EXPLORER=price_EXPLORER_ID
STRIPE_PRICE_PRO=price_PRO_ID
STRIPE_PRICE_POWER=price_POWER_ID
```

---

## 6. SUBIR EM PRODUÇÃO

1. Troque `sk_test_` por `sk_live_` no STRIPE_SECRET_KEY
2. Crie novo webhook em modo live (não teste)
3. Use os Price IDs de produção (não os de teste)
4. Ative Pix no Dashboard Stripe (Brasil)
