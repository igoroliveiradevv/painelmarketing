# Painel Marketing

**Painel de Marketing & Vendas** — Dashboard mensal para acompanhamento de investimento em tráfego, leads, funil de vendas, ROAS e metas.

---

## Sumário

- [Tech Stack](#tech-stack)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente (.env)](#configuração-do-ambiente-env)
- [Instalação](#instalação)
- [Banco de Dados (Supabase)](#banco-de-dados-supabase)
- [Integrações Externas](#integrações-externas)
  - [Supabase](#supabase)
  - [Stripe](#stripe)
  - [Meta Ads (Facebook)](#meta-ads-facebook)
  - [Google reCAPTCHA](#google-recaptcha)
- [Webhooks](#webhooks)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts](#scripts)
- [Arquitetura](#arquitetura)
- [Deploy](#deploy)

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

## Funcionalidades

### Landing Page (`/`)
- Hero com preview do dashboard (CPL, CAC, ROAS, gráfico, funil)
- Seção de estatísticas
- Grid de funcionalidades (dashboard, metas, funil, personalização)
- CTA para cadastro

### Autenticação
- Cadastro (`/cadastro`) com nome, e-mail e senha
- Login (`/auth`) via Supabase Auth (e-mail/senha)
- Proteção com reCAPTCHA
- Sessão persistente via localStorage + cookies

### Dashboard (`/dashboard`)
- Seletor de mês
- 6 cards de KPIs: Investimento, Receita, ROAS, CAC, CPL, Ticket Médio
- Barras de progresso das metas (receita, fechamentos, leads, ROAS)
- Gráfico de funil (Recharts BarChart)
- Taxas do funil: qualificação, agendamento, comparecimento, no-show, fechamento
- Gráfico de tendência (Recharts LineChart)
- Exportação para CSV

### Lançamentos (`/lancamentos`)
- **Modo manual:** Formulário completo com 11 campos (data, nome, investimento, leads, etapas do funil, receita)
- **Modo Meta Ads:** Selecionar data + campanha → puxar dados automaticamente → revisar e confirmar
- Histórico com tabela ordenada por data
- Edição e exclusão de registros

### Metas (`/metas`)
- Configuração de metas mensais: receita, ROAS, fechamentos, leads, CAC máximo, CPL máximo, no-show máximo
- Seletor de mês
- Upsert (um registro por usuário por mês)

### Personalização (`/aparencia`)
- **Tema:** Nome da marca + 5 cores personalizáveis (primary, accent, background, card, foreground)
- **Logo:** Upload de imagem (bucket privado, URL assinada), preview, remoção
- **Integrações:** Conectar/desconectar Meta Ads, selecionar conta de anúncios, sincronizar
- **Funil:** 6 rótulos personalizáveis das etapas

### Admin (`/admin`)
- Criar novos usuários subordinados
- Listar todos os usuários
- Alterar papel (user/admin)
- Remover usuários

### Páginas Legais
- **Termos de Uso** (`/termos`)
- **Política de Privacidade** (`/politicadeprivacidade`) — LGPD
- **Exclusão de Dados** (`/exclusaodedados`) — Instruções LGPD

### Assinatura e Renovação
- Stripe Checkout para assinatura mensal
- Webhook gerencia status: `active`, `pending`, `past_due`, `inactive`, `canceled`
- Banner no topo para assinaturas inativas/expiradas
- Botão "Renovar" que redireciona ao Stripe

---

## Pré-requisitos

- **Node.js** >= 18 ou **Bun** >= 1.0
- **Conta no Supabase** (plano gratuita serve)
- **Conta no Stripe** (para processar pagamentos)
- **Conta no Facebook Developers** (para integração Meta Ads — opcional)
- **Chave do Google reCAPTCHA** (v2)

---

## Configuração do Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### Supabase (obrigatório)

```env
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

| Variável | Onde obter | Descrição |
|---|---|---|
| `SUPABASE_URL` | Supabase Dashboard > Settings > API | URL do projeto |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API > `service_role` key | Chave de admin (lado servidor) — **NUNCA expor no frontend** |
| `VITE_SUPABASE_URL` | Mesmo valor de `SUPABASE_URL` | URL exposta ao cliente |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard > Settings > API > `anon` public key | Chave pública anônima (cliente) |

### Stripe (obrigatório)

```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

| Variável | Onde obter | Descrição |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API Keys | Chave secreta (live ou test) |
| `STRIPE_PRICE_ID` | Stripe Dashboard > Products > [seu produto] | ID do preço da assinatura mensal |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Developers > Webhooks | Secret do webhook para validação de eventos |

### Google reCAPTCHA (obrigatório)

```env
VITE_RECAPTCHA_SITE_KEY="6Ld..."
RECAPTCHA_SECRET_KEY="6Ld..."
```

| Variável | Onde obter | Descrição |
|---|---|---|
| `VITE_RECAPTCHA_SITE_KEY` | [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) | Site key (v2) |
| `RECAPTCHA_SECRET_KEY` | [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) | Secret key |

### Meta Ads / Facebook (opcional — necessário apenas para integração)

```env
META_APP_ID="seu_app_id"
META_APP_SECRET="seu_app_secret"
META_OAUTH_STATE_SECRET="seu_secret_para_signing"
```

| Variável | Onde obter | Descrição |
|---|---|---|
| `META_APP_ID` | [Facebook Developers](https://developers.facebook.com) > Seu App > Dashboard | App ID |
| `META_APP_SECRET` | Facebook Developers > Seu App > Dashboard | App Secret |
| `META_OAUTH_STATE_SECRET` | Gere um string aleatória (ex: `openssl rand -hex 32`) | Usado para assinar o state do OAuth |

### URL do Site (obrigatório)

```env
SITE_URL="https://seudominio.com.br"
```

Usado nos links de retorno do Stripe e nos redirects OAuth.

### Exemplo completo

```env
# Supabase
SUPABASE_URL="https://aumxddelgdtrfyrrzmtq.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://aumxddelgdtrfyrrzmtq.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Google reCAPTCHA
VITE_RECAPTCHA_SITE_KEY="6Ld..."
RECAPTCHA_SECRET_KEY="6Ld..."

# Meta Ads (opcional)
META_APP_ID="123456789"
META_APP_SECRET="a1b2c3d4..."
META_OAUTH_STATE_SECRET="um-segredo-aleatorio-aqui"

# Site
SITE_URL="https://meudominio.com.br"
```

---

## Instalação

```bash
# Usando npm
npm install

# Usando bun
bun install
```

### Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3000`.

### Build de produção

```bash
npm run build
npm run preview
```

---

## Banco de Dados (Supabase)

### Criar o projeto Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote as credenciais (URL, anon key, service_role key)
3. Execute as migrations disponíveis em `supabase/migrations/` no SQL Editor do Supabase

### Tabelas

| Tabela | Descrição | RLS |
|---|---|---|
| `profiles` | Perfis de usuários (criado automaticamente por trigger) | Sim |
| `user_roles` | RBAC: `admin` ou `user` | Sim |
| `daily_entries` | Lançamentos diários (investimento, leads, funil, receita) | Sim |
| `monthly_goals` | Metas mensais por indicador | Sim |
| `funnel_config` | Rótulos personalizáveis das etapas do funil | Sim |
| `theme_settings` | Tema visual (cores, logo, nome da marca) | Sim |
| `meta_ads_connections` | Tokens de acesso e estado da integração Meta Ads | Sim |
| `subscriptions` | Status da assinatura Stripe | Sim (SELECT apenas) |

### Storage

- **Bucket:** `logos` (privado)
- **Finalidade:** Armazenar logotipos enviados pelos usuários
- **Acesso:** URLs assinadas com 10 anos de validade, scoped por usuário

### Migrations

As migrations estão em `supabase/migrations/` e devem ser executadas em ordem cronológica:

1. `20260706204947_*` — Schema inicial (tabelas, RLS, triggers, funções)
2. `20260706205000_*` — Segurança: search_path, revoke permissões
3. `20260706205012_*` — GRANT has_role para authenticated
4. `20260707134505_*` — ALTER theme_settings (logo_url, meta_ads)
5. `20260707134536_*` — Storage bucket policies (logos)
6. `20260714190821_*` — Hardening de segurança
7. `20260714191444_*` — Converte has_role para SECURITY INVOKER
8. `20260714195320_*` — Cria meta_ads_connections
9. `20260715015451_*` — Cria subscriptions
10. `20260715015640_*` — ALTER daily_entries: ADD name
11. `20260715022107_*` — Revoga INSERT/UPDATE/DELETE em subscriptions

### Autenticação

- Método: **E-mail + Senha** (Supabase Auth)
- Confirmação de e-mail: desligada (criação direta via funções de servidor)
- Função `handle_new_user()` cria perfil automaticamente após signup
- RLS habilitado em todas as tabelas (isolamento por `auth.uid()`)
- Função `has_role(user_id, role)` para verificação de papéis

### Row Level Security (RLS)

Todas as tabelas têm RLS ativado. As políticas seguem o padrão:
- **SELECT/INSERT/UPDATE/DELETE:** apenas registros onde `user_id = auth.uid()`
- **Admin:** pode ver todos os usuários (via `has_role(auth.uid(), 'admin')`)
- **Subscriptions:** apenas SELECT permitido para o próprio usuário (INSERT/UPDATE via webhook)

---

## Integrações Externas

### Supabase

**Finalidade:** Banco de dados, autenticação, storage de arquivos

**Configuração:**
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute as migrations (`supabase/migrations/`)
3. Preencha as variáveis `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env`

**Como é usado no código:**
- `src/integrations/supabase/client.ts` — Cliente do lado do browser (Proxy lazy)
- `src/integrations/supabase/client.server.ts` — Cliente admin (service role, server-side)
- `src/integrations/supabase/auth-middleware.ts` — Middleware para server functions (valida JWT)
- `src/integrations/supabase/auth-attacher.ts` — Anexa token JWT às chamadas RPC

---

### Stripe

**Finalidade:** Processamento de pagamentos (assinatura mensal)

**Configuração:**
1. Crie uma conta em [stripe.com](https://stripe.com)
2. Crie um produto com preço recorrente mensal no Stripe Dashboard
3. Anote o `price_xxx` do preço criado
4. Configure um webhook no Stripe Dashboard apontando para `https://seudominio.com.br/api/stripe/webhook`
5. Adicione os eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
6. Preencha `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` no `.env`

**Fluxo:**
```
Usuário → /cadastro → createCheckoutSession → Stripe Checkout
  → Pagamento confirmado
    → Webhook Stripe → subscriptions.status = "active"
      → Usuário redirecionado para /auth?registered=true
```

**Server Functions:**
- `createCheckoutSession` — Cria usuário no Supabase + sessão de checkout
- `createRenewalSession` — Cria sessão de renovação para assinantes existentes
- `getSubscriptionStatus` — Verifica status da assinatura do usuário
- `verifyRecaptcha` — Valida token do reCAPTCHA

**Webhook handlers** (`src/routes/api/stripe/webhook.ts`):
- `checkout.session.completed` — Ativa assinatura
- `customer.subscription.updated` — Atualiza status
- `customer.subscription.deleted` — Marca como cancelada
- `invoice.payment_failed` — Marca como past_due

---

### Meta Ads (Facebook) — Opcional

**Finalidade:** Importar métricas de campanhas automaticamente

**Configuração:**
1. Crie um app em [Facebook Developers](https://developers.facebook.com)
2. Adicione o produto "Facebook Login" e configure o redirect OAuth
3. Adicione o produto "Marketing API"
4. No app, adicione os domínios autorizados (ex: `https://seudominio.com.br`)
5. Preencha `META_APP_ID`, `META_APP_SECRET`, `META_OAUTH_STATE_SECRET` no `.env`

**URIs de Redirect:**
- OAuth Callback: `https://seudominio.com.br/api/public/meta/callback`

**Escopos solicitados:**
- `ads_read` — Ler métricas de anúncios
- `business_management` — Acessar contas de anúncios

**Fluxo OAuth:**
```
/Editar Painel → Conectar Meta Ads → Redireciona para Facebook
  → Usuário autoriza
    → Callback (/api/public/meta/callback)
      → Troca code por short-lived token
        → Troca por long-lived token (~60 dias)
          → Salva em meta_ads_connections
```

**Server Functions:**
- `getMetaAuthUrl` — Gera URL de autorização OAuth
- `getMetaConnection` — Obtém dados da conexão atual
- `disconnectMeta` — Remove conexão e token
- `listMetaAdAccounts` — Lista contas de anúncio disponíveis
- `selectMetaAdAccount` — Seleciona conta ativa
- `listMetaCampaigns` — Lista campanhas de uma conta
- `syncMetaInsights` — Sincroniza métricas de campanhas
- `fetchMetaDayData` — Busca dados de um dia específico

---

### Google reCAPTCHA

**Finalidade:** Proteger formulários de cadastro e login contra bots

**Configuração:**
1. Acesse [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Crie uma chave do tipo **reCAPTCHA v2** ("Não sou um robô")
3. Adicione os domínios autorizados
4. Preencha `VITE_RECAPTCHA_SITE_KEY` e `RECAPTCHA_SECRET_KEY` no `.env`

---

## Webhooks

### Stripe Webhook

| Método | Rota | Eventos |
|---|---|---|
| `POST` | `/api/stripe/webhook` | `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` |

**Configuração no Stripe Dashboard:**
1. Acesse [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Adicione endpoint: `https://seudominio.com.br/api/stripe/webhook`
3. Selecione os eventos listados acima
4. Copie o "Signing secret" para `STRIPE_WEBHOOK_SECRET` no `.env`

### Meta Ads OAuth Callback

| Método | Rota |
|---|---|
| `GET` | `/api/public/meta/callback` |

Redireciona após autorização do Facebook OAuth.

---

## Estrutura do Projeto

```
├── public/                          # Assets estáticos (favicon, logo, imagens)
├── src/
│   ├── components/ui/               # Componentes shadcn/ui (49 componentes)
│   ├── hooks/
│   │   ├── use-app-data.tsx         # Contexto global (session, entries, theme, goals)
│   │   └── use-mobile.tsx           # Detector de breakpoint mobile
│   ├── integrations/supabase/
│   │   ├── client.ts                # Cliente Supabase (browser-side)
│   │   ├── client.server.ts         # Cliente Supabase admin (server-side)
│   │   ├── auth-middleware.ts       # Middleware de autenticação (server functions)
│   │   ├── auth-attacher.ts         # Anexa token JWT às chamadas RPC
│   │   └── types.ts                 # Tipos TypeScript do banco de dados
│   ├── lib/
│   │   ├── admin.functions.ts       # Server functions de admin (CRUD usuários)
│   │   ├── marketing.ts             # Tipos, schemas Zod, helpers (BRL, %, CSV)
│   │   ├── meta.functions.ts        # Server functions do Meta Ads (OAuth, sync)
│   │   ├── stripe.functions.ts      # Server functions do Stripe (checkout)
│   │   ├── utils.ts                 # cn() utility
│   │   ├── error-capture.ts         # Captura de erros globais
│   │   └── error-page.ts            # Página de erro SSR
│   ├── routes/                      # Rotas (file-based)
│   │   ├── __root.tsx               # Layout raiz, meta tags, error boundary
│   │   ├── index.tsx                # Landing page
│   │   ├── auth.tsx                 # Login
│   │   ├── cadastro.tsx             # Cadastro + Stripe Checkout
│   │   ├── termos.tsx               # Termos de Uso
│   │   ├── politicadeprivacidade.tsx # Política de Privacidade (LGPD)
│   │   ├── exclusaodedados.tsx      # Instruções de exclusão de dados
│   │   ├── _authenticated/          # Rotas protegidas
│   │   │   ├── route.tsx            # Auth guard + layout + sidebar
│   │   │   ├── dashboard.tsx        # Dashboard mensal
│   │   │   ├── lancamentos.tsx      # Lançamentos diários
│   │   │   ├── metas.tsx            # Metas mensais
│   │   │   ├── aparencia.tsx        # Tema + integrações
│   │   │   └── admin.tsx            # Admin (gestão de usuários)
│   │   └── api/
│   │       ├── stripe/webhook.ts    # Webhook Stripe
│   │       └── public/meta/callback.ts # Callback OAuth Meta
│   ├── router.tsx                   # Configuração do router
│   ├── routeTree.gen.ts             # Árvore de rotas (gerado automaticamente)
│   ├── start.ts                     # Bootstrap da aplicação
│   ├── server.ts                    # Entry point SSR
│   └── styles.css                   # Tailwind CSS v4 + design tokens
├── supabase/
│   ├── config.toml                  # Configuração do projeto Supabase
│   └── migrations/                  # Migrations SQL (11 arquivos)
├── .env                             # Variáveis de ambiente (não versionado)
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run build:dev` | Build em modo desenvolvimento |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa ESLint |
| `npm run format` | Formata código com Prettier |

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
Client (useServerFn) → auth-attacher (anexa JWT)
  → Rede
    → auth-middleware (valida JWT, extrai userId)
      → Handler (cliente autenticado)
```

### Fluxo de Pagamento

```
Cadastro → createCheckoutSession (cria usuário + sessão Stripe)
  → Stripe Checkout
    → Webhook checkout.session.completed → subscriptions.active
      → Redirect para /auth?registered=true
```

### Fluxo Meta Ads

```
/Editar Painel → Conectar → OAuth Facebook
  → /api/public/meta/callback → troca code por token long-lived
    → Salva em meta_ads_connections

/Lançamentos → Puxar Meta Ads
  → fetchMetaDayData → Graph API /insights
    → Preenche investimento + leads
```

---

## Deploy

O projeto usa Vite para build e pode ser deployado em qualquer plataforma que suporte Node.js/SSR:

- **Recomendado:** Cloudflare (via Nitro — compatível com a config atual)
- **Alternativas:** Vercel, Netlify, Railway, Render

Para build:
```bash
npm run build
```

Os arquivos de saída estarão em `.output/`.

Ajustes necessários para deploy:
1. Configure as variáveis de ambiente na plataforma escolhida
2. Configure o domínio personalizado
3. Atualize os webhooks do Stripe com a URL de produção
4. Atualize o redirect OAuth do Meta Ads com a URL de produção
5. Atualize o `SITE_URL` no `.env`

---

## Licença

MIT — veja [LICENSE](../LICENSE).
