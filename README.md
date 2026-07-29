# Result Scale

**Painel de Marketing & Vendas que escala resultado.**

Acompanhe investimento, leads, funil de vendas e ROAS em um painel mensal claro, rápido e feito para decisões.

---

## Tech Stack

| Categoria | Tecnologia |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) (React 19 + SSR) |
| **Router** | [@tanstack/react-router](https://tanstack.com/router) (file-based) |
| **Banco de dados** | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| **Pagamentos** | [Stripe](https://stripe.com) (checkout + assinaturas) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Gráficos** | [Recharts](https://recharts.org) |
| **Formulários** | [react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **Ícones** | [Lucide React](https://lucide.dev) |
| **Toasts** | [Sonner](https://sonner.emilkowal.ski) |
| **Build** | [Vite](https://vitejs.dev) |

---

## Estrutura do Projeto

```
src/
├── routes/                         # File-based routing
│   ├── index.tsx                   # Landing page
│   ├── auth.tsx                    # Login
│   ├── cadastro.tsx                # Registro + Stripe checkout
│   ├── termos.tsx                  # Termos de Uso
│   ├── politicadeprivacidade.tsx   # Política de Privacidade (LGPD)
│   ├── exclusaodedados.tsx         # Instruções de exclusão de dados
│   ├── __root.tsx                  # Layout raiz, meta tags, error boundary
│   ├── routeTree.gen.ts            # Árvore de rotas gerada
│   ├── _authenticated/             # Rotas protegidas (auth required)
│   │   ├── route.tsx               # Auth guard + layout + banner de assinatura
│   │   ├── dashboard.tsx           # Dashboard mensal com KPIs e gráficos
│   │   ├── lancamentos.tsx         # Lançamentos diários (manual ou Meta Ads)
│   │   ├── metas.tsx               # Metas mensais
│   │   ├── aparencia.tsx           # Tema, logo, integração Meta Ads
│   │   └── admin.tsx               # Gestão de usuários (admin)
│   └── api/
│       ├── stripe/webhook.ts       # Webhook do Stripe
│       └── public/meta/callback.ts # Callback OAuth do Meta
│
├── lib/
│   ├── marketing.ts                # Tipos, schemas, agregados, helpers (BRL, %)
│   ├── admin.functions.ts          # Server functions de admin (CRUD usuários)
│   ├── meta.functions.ts           # Server functions do Meta Ads (OAuth, sync)
│   ├── stripe.functions.ts         # Server functions do Stripe (checkout, renovação)
│   ├── utils.ts                    # Utilitários (cn)
│   └── error-*.ts                  # Tratamento de erros SSR
│
├── hooks/
│   ├── use-app-data.tsx            # Contexto global: session, entries, funnel, theme
│   └── use-mobile.tsx              # Detector de breakpoint mobile
│
├── components/ui/                  # 49 componentes shadcn/ui
│
├── integrations/supabase/
│   ├── client.ts                   # Cliente Supabase (browser)
│   ├── client.server.ts            # Cliente admin (server, service role)
│   ├── auth-middleware.ts          # Middleware de autenticação (server functions)
│   ├── auth-attacher.ts            # Attacher de token JWT (client → server)
│   └── types.ts                    # Tipos completos do banco de dados
│
├── start.ts                        # Bootstrap da aplicação
├── server.ts                       # Entry point SSR com error handling
└── styles.css                      # Tailwind + design tokens
```

---

## Funcionalidades

### Landing Page (`/`)
- Hero com mock do dashboard (CPL, CAC, ROAS, gráfico, funil)
- Seção de números (+3,2x ROAS, -41% CAC, etc.)
- Grid de features (dashboard, metas, funil, personalização)
- CTA "Comece agora" → `/cadastro`

### Cadastro e Pagamento (`/cadastro`)
- Formulário: nome, e-mail, senha
- Cria conta no Supabase + redireciona para checkout Stripe
- Assinatura mensal com renovação automática
- Webhook do Stripe gerencia status da assinatura

### Login (`/auth`)
- E-mail e senha via Supabase Auth
- Link para cadastro
- Exibe toast de sucesso após registro

### Dashboard (`/dashboard`)
- Seletor de mês (dropdown)
- 6 cards de KPIs: Investimento, Receita, ROAS, CAC, CPL, Ticket Médio
- Progresso das metas com barras (receita, fechamentos, leads, ROAS)
- Gráfico de funil (Recharts BarChart)
- Taxas do funil: qualificação, agendamento, comparecimento, no-show, fechamento
- Gráfico de tendência (Recharts LineChart): investimento, receita, fechamentos
- Export CSV

### Lançamentos (`/lancamentos`)
- **Modo manual:** Formulário completo com 11 campos (data, nome, investimento, leads, funil, receita)
- **Modo Puxar Meta Ads:** Seletor de data + campanha → puxa dados automaticamente → revisa e confirma
- Histórico de lançamentos com tabela (ordenado por data)
- Edição e exclusão de registros

### Metas (`/metas`)
- Seletor de mês
- 7 metas configuráveis: receita, ROAS, fechamentos, leads, CAC máximo, CPL máximo, no-show máximo
- Salva com upsert (um por usuário por mês)

### Editar Painel (`/aparencia`)
- **Tema:** Nome da marca + 5 cores personalizáveis (primary, accent, background, card, foreground)
- **Logo:** Upload de imagem (bucket privado, URL assinada), preview, remoção
- **Integrações:** Conectar/desconectar Meta Ads, selecionar conta de anúncios, sincronizar
- **Funil:** 6 rótulos personalizáveis das etapas do funil

### Admin (`/admin`)
- Criar novos usuários (nome, e-mail, senha)
- Listar todos os usuários
- Alterar papel (user/admin)
- Remover usuários

### Páginas Legais
- **Termos de Uso** (`/termos`) — 13 seções
- **Política de Privacidade** (`/politicadeprivacidade`) — 13 seções, LGPD
- **Exclusão de Dados** (`/exclusaodedados`) — Instruções de exclusão

### Assinatura e Renovação
- Banner no topo da área autenticada quando a assinatura está inativa/expirada
- Botão "Renovar" / "Pagar" que redireciona ao Stripe
- Status: `active`, `pending`, `past_due`, `inactive`, `canceled`

---

## Banco de Dados (Supabase)

### Tabelas

| Tabela | Descrição |
|---|---|
| `daily_entries` | Lançamentos diários (investimento, leads, funil, receita) |
| `funnel_config` | Rótulos personalizáveis das etapas do funil |
| `meta_ads_connections` | Tokens de acesso e estado da integração Meta Ads |
| `monthly_goals` | Metas mensais por indicador |
| `profiles` | Perfis de usuários (auto-criado pelo Supabase) |
| `subscriptions` | Status da assinatura Stripe |
| `theme_settings` | Tema visual por usuário (cores, logo, nome) |
| `user_roles` | RBAC: `admin` ou `user` |

### SQL para criar a tabela de assinaturas

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'pending',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê própria subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```env
# Supabase
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Meta Ads (OAuth)
META_APP_ID="seu_app_id"
META_APP_SECRET="seu_app_secret"
META_OAUTH_STATE_SECRET="seu_secret_para_signing"

# URL do site
SITE_URL="https://resultscale.com.br"
```

---

## Webhooks

### Stripe
Configure no [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
- **URL:** `https://resultscale.com.br/api/stripe/webhook`
- **Eventos:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### Meta Ads (OAuth)
Configurado automaticamente via `getMetaAuthUrl`. Callback:
- **URL:** `https://resultscale.com.br/api/public/meta/callback`

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Arquitetura

### Fluxo de Requisição
```
Browser → server.ts (SSR error wrapper)
  → TanStack Start Router
    → __root.tsx (Head meta, Providers)
      → Route component
        → useAppData() (session, dados, tema)
```

### Server Functions (RPC)
```
Client (useServerFn) → attachSupabaseAuth (JWT)
  → Network request
    → requireSupabaseAuth (valida JWT, extrai userId)
      → Handler (supabase client autenticado + supabaseAdmin para admin ops)
```

### Fluxo de Pagamento
```
/cadastro → createCheckoutSession (cria usuário + Stripe session)
  → Stripe Checkout → pagamento
    → Webhook checkout.session.completed → subscriptions.status = "active"
      → /auth?registered=true → login → /dashboard
```

### Fluxo Meta Ads
```
/aparencia → Conectar → OAuth Facebook
  → /api/public/meta/callback → troca code por token
    → meta_ads_connections (token armazenado)

/lancamentos → Puxar Meta Ads
  → fetchMetaDayData → Graph API /insights
    → Preenche investimento + leads
```

---

## Documentação Completa

Para documentação detalhada (configuração de ambiente, integrações, deploy), consulte:

➡️ **[docs/README.md](docs/README.md)**

---

## Licença

MIT — veja [LICENSE](LICENSE).
