# GabrielFS.dev — Astro 6 + Cloudflare Workers

Portfólio com painel admin para gerenciar hero, experiências, certificações e projetos. Sincronização com GitHub (repositórios públicos e privados), customização visual e deploy seguro em Cloudflare Workers.

---

## 📋 Stack & Arquitetura

### Core Stack
- **Astro 6** (`output: server`, SSR + dynamic rendering)
- **@astrojs/cloudflare** (Cloudflare Workers integration)
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **TypeScript + JavaScript**
- **Zod** (schema validation)

### Backend & Storage
- **D1 Database** (SQLite) — conteúdo dinâmico, projetos, certificações, experiências
- **R2** — assets (imagem hero, uploads admin)
- **KV Namespace** — sessão admin (`SESSION`)
- **Cloudflare Workers** — serverless runtime

### Environment
- **Dev:** Astro dev server (com dados legados como fallback)
- **Preview:** Cloudflare Workers preview
- **Production:** Cloudflare Workers (deploy seguro com frase de autorização)

---

## 🗺️ Estrutura de Diretórios

```
src/
├── pages/                          # Rotas (Astro page routing)
│   ├── index.astro                 # Home (hero editável)
│   ├── experiencia.astro           # Timeline de experiências
│   ├── certificacoes.astro         # Listagem de certificações
│   ├── projetos.astro              # Projetos públicos (GitHub sync)
│   └── admin/                      # Painel admin (protegido)
│       ├── login.astro             # Autenticação
│       ├── dashboard.astro         # Dashboard principal
│       ├── password.astro          # Troca de senha
│       ├── hero-image.ts           # Upload imagem hero
│       └── projects/               # Gerenciamento de projetos
│           ├── index.astro         # Listagem + sync GitHub
│           ├── [id].astro          # Editar projeto
│           └── delete.ts           # Deletar projeto
├── layouts/
│   ├── Layout.astro                # Layout base (público)
│   └── AdminLayout.astro           # Layout admin (autenticado)
├── utils/
│   ├── db.ts                       # Funções D1, schema validation
│   ├── auth.ts                     # Autenticação, hash SHA-256
│   ├── github.ts                   # Sincronização GitHub (repos, tecnologias)
│   └── cleanup-sessions.ts         # Limpeza de sessões expiradas
├── styles/
│   └── global.css                  # Tailwind, design system (dark mode)
└── middleware.ts                   # Middleware de autenticação admin

db/
├── schema.sql                      # Schema D1 (tables, indexes)
└── seed-legacy.sql                 # Seed dados legados

scripts/
└── deploy-cloudflare.cjs           # Pipeline de deploy seguro (preview/prod)

public/
└── _headers                        # Headers customizados Cloudflare
```

---

## 🎯 Features Principais

### 1. Hero Editável
- Upload de imagem `.webp` via R2
- Edição de título/subtítulo no D1
- Rota protegida: `/admin/hero-image`

### 2. Experiências
- Timeline dinâmica (D1 ou dados legados)
- CRUD completo no admin

### 3. Certificações
- Listagem com filtro/busca
- Upload de imagem da certificação
- Track/ID do curso (Alura, etc.)

### 4. Projetos (GitHub Sync)
- **Sincronização manual/automática** com GitHub (repositórios públicos e privados)
- **Badge visual de privacidade:**
  - 🔒 Privado (vermelho) — sem link público
  - 🔓 Público (verde) — com link GitHub
- **Customização no admin:**
  - Nome customizado (override)
  - Descrição customizada (override)
  - Ativo/Inativo (exibição)
  - Ordenação manual
- **Sync automático:** Segunda-feira à meia-noite (UTC)
- **Tecnologias:** Sincronizadas via GitHub API (linguagem principal + todas as linguagens)

### 5. Painel Admin
- **Autenticação:** Modal de senha, cookie httpOnly
- **Proteção:** Middleware verifica `/admin/*`
- **Ações sensíveis:** Requerem confirmação de senha (modal)
- **Logout:** Limpa sessão KV

### 6. Deploy Seguro
- **Preview:** Liberado (`npm run deploy:preview`)
- **Produção:** Requer frase explícita de autorização
- **Validação:** Build obrigatório antes de deploy

---

## 🔧 Padrões & Convenções

### Visual
- **Classes utilitárias:** `badge`, `card`, `surface`, `surface-soft`, `text-muted`
- **Container:** Centralizado com `max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14`
- **Dark Mode:** Padrão, sem toggle de tema
- **Transições:** 150-300ms, smooth

### Dados
- **Campos customizáveis:** Nome, descrição, posição na listagem
- **Ordenação:** Por `order_position` (desc) + `last_updated` (desc)
- **Soft delete:** Campos `is_active`, não remoção física

### Autenticação
- **Hash:** SHA-256 (senha armazenada no D1)
- **Sessão:** KV Namespace (httpOnly cookie)
- **Middleware:** Rota `/admin/*` exige autenticação válida

### GitHub Sync
- **Env vars:** `GITHUB_USERNAME`, `GITHUB_TOKEN` (secrets Cloudflare)
- **Endpoint:** POST `/admin/projects/sync-cron` (headers autenticação Cloudflare)
- **Atualização:** Sem deletar projetos legados, apenas atualiza campos

---

## ⚙️ Rotas Principais

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | GET | Home com hero editável |
| `/experiencia` | GET | Timeline de experiências |
| `/certificacoes` | GET | Listagem de certificações |
| `/projetos` | GET | Projetos públicos (filtro por tecnologia) |
| `/admin/login` | GET/POST | Autenticação |
| `/admin/dashboard` | GET | Dashboard (protegido) |
| `/admin/hero-image` | POST | Upload imagem hero (protegido) |
| `/admin/password` | POST | Troca de senha (protegido) |
| `/admin/projects` | GET | Listagem + sync GitHub (protegido) |
| `/admin/projects/[id]` | GET/POST | Editar projeto (protegido) |
| `/admin/projects/delete` | POST | Deletar projeto (protegido) |
| `/admin/projects/sync-cron` | POST | Sync automático (Cloudflare headers) |
| `/admin/logout` | POST | Logout (protegido) |

---

## 📦 Setup Rápido

### 1. Instalação
```bash
npm install
```

### 2. Variáveis de Ambiente
```bash
# .env local (dev)
ADMIN_PASSWORD=sua_senha_inicial
GITHUB_USERNAME=seu_usuario_github
GITHUB_TOKEN=ghp_seu_token_github

# Cloudflare wrangler.toml (secrets)
npx wrangler secret put ADMIN_PASSWORD --env preview
npx wrangler secret put GITHUB_TOKEN --env preview
npx wrangler secret put GITHUB_USERNAME --env preview
```

### 3. Dev Sem Bindings (dados legados)
```bash
npm run dev
# Acessa localhost:3000
```

### 4. Dev Com Bindings
```bash
wrangler d1 execute gabrielfs-db --local --file ./db/schema.sql
wrangler dev
```

### 5. Build & Deploy
```bash
# Build
npm run build

# Deploy preview
npm run deploy:preview

# Deploy produção (exige frase de autorização)
npm run deploy:production
```

---

## 🔐 Variáveis & Bindings

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `ADMIN_PASSWORD` | Secret | Senha admin inicial (hash SHA-256 no D1 depois) |
| `GITHUB_USERNAME` | Secret | Usuário GitHub para sync de repositórios |
| `GITHUB_TOKEN` | Secret | Token GitHub (PAT, necessita acesso `repo` privado) |
| `DB` | D1 Binding | Banco de dados principal |
| `R2` | R2 Bucket | Assets (imagem hero, uploads) |
| `SESSION` | KV Namespace | Sessão admin (httpOnly cookie) |

---

## 🚀 Comandos

```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Build para dist/
npm run preview          # Preview do build local
npm run deploy           # Deploy preview (default)
npm run deploy:preview   # Deploy preview (explícito)
npm run deploy:production # Deploy produção (requer autorização)
```

---

## 🎨 Arquitetura de Agentes

Este projeto é otimizado para automação com agentes (Copilot, CI/CD). Consulte `.agent.json` e `AGENT_CONTEXT.md` para:
- Fluxo de sincronização GitHub
- Padrões de customização
- Pipeline de deploy seguro
- Pontos críticos e validações

---

## 📝 Segurança

- **Autenticação:** SHA-256 hash + cookie httpOnly + SameSite=Lax
- **Admin:** Middleware valida todas rotas `/admin/*`
- **Sessão:** Limpeza automática de sessões expiradas (cron KV)
- **Deploy:** Produção exige confirmação explícita (`AUTORIZO_DEPLOY_PRODUCAO_GABRIELFSDEV`)
- **GitHub Token:** Armazenado em secret Cloudflare, nunca em `.env` público

---

## 📚 Referências

- [Astro 6 Docs](https://docs.astro.build/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Tailwind CSS 4](https://tailwindcss.com/)
