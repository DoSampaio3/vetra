# VETRA — Sinais de Confiança Digital

MVP completo de plataforma SaaS de Trust Score Digital.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Banco | PostgreSQL |
| Cache | Redis (mock em memória, opcional) |
| Auth | JWT |

---

## Setup Local (3 passos)

### 1. Instalar dependências

```bash
npm install
```

### 2. Subir banco e Redis via Docker

```bash
docker compose up -d postgres redis
```

Aguarde ~10 segundos para o banco inicializar e criar as tabelas automaticamente.

### 3. Iniciar desenvolvimento

```bash
# Terminal 1 — API (http://localhost:3001)
cd apps/api && cp ../../.env.example .env && npm install && npm run dev

# Terminal 2 — Web (http://localhost:3000)
cd apps/web && npm install && npm run dev
```

Ou tudo de uma vez (com concurrently):

```bash
npm run dev
```

---

## Acesso

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| Health | http://localhost:3001/health |

**Demo login:** `demo@vetra.io` / `demo1234`

---

## Endpoints da API

```
POST /api/auth/register     → Cadastro de usuário
POST /api/auth/login        → Login (retorna JWT)
GET  /api/auth/me           → Dados do usuário autenticado

POST /api/verify            → Submete dados e gera relatório completo
POST /api/verify/signals/analyze → Preview do score sem persistir

POST /api/score/calculate   → Recalcula score de uma verificação
GET  /api/score/user/:id    → Histórico de scores do usuário

GET  /api/reports           → Lista relatórios do usuário
GET  /api/reports/:id       → Detalhes de um relatório + sinais
GET  /api/reports/shared/:token → Relatório público (sem auth)
```

---

## Sistema de Trust Score

A função `calculateTrustScore()` em `apps/api/src/services/trust-score.service.ts` implementa:

### Categorias e pesos

| Categoria | Peso Final | Descrição |
|-----------|-----------|-----------|
| Identidade | 35% | Email, telefone, CPF (mock), nascimento |
| Social | 25% | Username, presença em redes |
| Comportamental | 20% | Padrões, completude, consistência |
| Consistência | 20% | Cross-validation entre sinais |

### Níveis de score

| Score | Nível |
|-------|-------|
| 0–19 | Muito Baixo |
| 20–39 | Baixo |
| 40–59 | Médio |
| 60–79 | Alto |
| 80–100 | Excelente |

---

## Estrutura do Projeto

```
/vetra
  /apps
    /api                  → Backend Node.js/Express
      /src
        /controllers      → Rotas: auth, verify, score, reports
        /services         → trust-score.service.ts, cache.service.ts
        /middleware       → auth.middleware.ts (JWT)
        /database         → connection.ts, schema.sql
      index.ts
    /web                  → Frontend Next.js
      /src
        /app              → Páginas: login, dashboard, verify, report/[id]
        /components       → Navbar, ScoreRing
        /hooks            → useAuth
        /lib              → api.ts (cliente HTTP)
  /packages
    /shared               → Tipos compartilhados
  docker-compose.yml
  .env.example
```

---

## Modelo de Negócio

- **Freemium** — 3 verificações/mês gratuitas
- **Premium** — Relatórios detalhados, histórico ilimitado, exportação PDF
- **API B2B** — Acesso via API key para integrações empresariais

---

## Aviso Legal

VETRA analisa exclusivamente:
- Dados fornecidos pelo próprio usuário com consentimento explícito
- Sinais públicos e padrões de formato
- Heurísticas mock para demonstração

**Não** acessa bases governamentais, dados privados ou realiza scraping invasivo.
