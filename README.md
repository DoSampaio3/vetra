# VETRA — Score de Confiança Digital por IA

MVP completo: Landing Page + App autenticado + API + PostgreSQL + Gemini AI + Instagram API.

---

## Setup em 3 passos

### 1. Instalar dependências
```bash
# Na raiz do projeto
cd apps/api && npm install
cd ../web  && npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example apps/api/.env
# Edite apps/api/.env e preencha:
# GEMINI_API_KEY  → https://aistudio.google.com/app/apikey
# RAPIDAPI_KEY    → https://rapidapi.com/rocketapi/api/rocketapi-for-instagram
```

### 3. Subir banco e rodar
```bash
# Terminal 1 — Banco
docker compose up -d postgres redis

# Terminal 2 — API (http://localhost:3001)
cd apps/api && npm run dev

# Terminal 3 — Frontend (http://localhost:3000)
cd apps/web  && npm run dev
```

---

## URLs

| Serviço | URL |
|---|---|
| Landing Page | http://localhost:3000 |
| Login/Dashboard | http://localhost:3000/login |
| API Health | http://localhost:3001/health |

**Demo:** `demo@vetra.io` / `demo1234`

---

## Endpoints da API

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

POST /api/verify                  ← Gera relatório completo
POST /api/verify/signals/analyze  ← Prévia sem persistir

GET  /api/reports                 ← Lista relatórios
GET  /api/reports/:id             ← Detalhes + sinais
GET  /api/reports/shared/:token   ← Relatório público

GET  /api/score/user/:id
POST /api/score/calculate
```

---

## Estrutura

```
/vetra
  /apps
    /api          → Node.js + Express + TypeScript
      /src
        /controllers  → auth, verify, score, reports
        /services     → trust-score, gemini, instagram, cache
        /middleware   → JWT auth
        /database     → connection, schema.sql
    /web          → Next.js 14 App Router + Tailwind
      /src
        /app
          /page.tsx              ← Landing page (rota /)
          /login/                ← Login/Registro
          /dashboard/            ← Painel autenticado
          /verify/               ← Nova verificação
          /report/[id]/          ← Relatório detalhado
        /components
          /marketing/            ← Landing page sections
          /Navbar, ScoreRing     ← App components
        /hooks → useAuth
        /lib   → api.ts, utils.ts
  /packages/shared
  docker-compose.yml
  .env.example
```

---

## Sistema de Score

| Categoria | Peso | O que analisa |
|---|---|---|
| Identidade | 35% | Email, telefone, CPF (formato) |
| Social | 25% | Instagram via RocketAPI (real) |
| Comportamental | 20% | Padrões, completude dos dados |
| Consistência | 20% | Cross-validation entre sinais |

**Gemini AI** interpreta o resultado e gera análise em português natural.

---

## Modelo de Negócio

| Plano | Preço | Inclui |
|---|---|---|
| Explorar | R$ 25 único | 1 relatório |
| Pro Insight | R$ 49,90/mês | 10 relatórios + histórico |
| Vetra Power | R$ 99,90/mês | Ilimitado + API + PDF |
