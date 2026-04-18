# AGENT_CONTEXT.md — Contexto Detalhado para Agentes Copilot

> **Leia este arquivo para entender o projeto antes de trabalhar nele.** Este é o guia definitivo para agentes automatizados, CI/CD e Copilot.

---

## 🎯 Visão Geral do Projeto

**gabrielfsdev** é um portfólio full-stack com painel admin, sincronização GitHub e deploy seguro em Cloudflare Workers.

- **Usuário:** Gabriel Freitas Souza
- **Host:** https://gabrielfsdev.freitassouza26.workers.dev
- **Stack:** Astro 6, Cloudflare Workers, D1, R2, KV
- **Deploy:** Seguro (produção exige confirmação explícita)

---

## 🔄 Fluxo de Sincronização GitHub

### 1. Manual Sync (Admin)
**Rota:** `POST /admin/projects` (botão "Sincronizar GitHub")  
**Fluxo:**
1. Admin clica "Sincronizar GitHub"
2. Frontend exibe modal de confirmação de senha
3. Backend chama `syncProjectsFromGitHub()` em `src/utils/github.ts`
4. GitHub API retorna repos (públicos + privados)
5. Para cada repo:
   - Extrai tecnologias via `languages_url` (todas as linguagens)
   - Valida campos (URL, nome, descrição, stars)
   - Insere (novo) ou atualiza (existente) no D1 com `is_active = 0` (inativo por default)
6. Admin ativa cada projeto manualmente

### 2. Automático Sync (Cron)
**Trigger:** Segunda-feira 00:00 UTC  
**Rota:** `POST /admin/projects/sync-cron` (Cloudflare headers)  
**Diferenças:**
- Sem autenticação de usuário (Cloudflare headers validam)
- Roda em background
- Atualiza repos existentes, não cria novos

### 3. Extração de Tecnologias
**Arquivo:** `src/utils/github.ts` → `extractTechnologies()`
```typescript
// Coleta:
// 1. repo.language (linguagem principal)
// 2. Fetch repo.languages_url (todas as linguagens com contagem)
// 3. Topics (filtra, remove duplicatas)
// Resultado: Array de strings normalizadas (ex: ["TypeScript", "React", "CSS"])
```

### 4. Sincronização NO Deleta Projetos
**Regra:** Se um repo for deletado no GitHub, permanece no D1 como `is_active = 0` (inativo).  
**Motivo:** Preservar histórico e customizações locais.

---

## 🔐 Autenticação & Autorização

### Admin Middleware
**Arquivo:** `src/middleware.ts`  
**Comportamento:**
1. Todas rotas `/admin/*` verificam cookie `admin_session`
2. Se inválido/expirado → redireciona para `/admin/login`
3. Cookie tem `httpOnly`, `SameSite=Lax`

### Hash de Senha
**Algoritmo:** SHA-256  
**Armazenamento:** D1 `admin_settings` table  
**Fluxo:**
1. Usuário toca senha em `/admin/password`
2. Frontend calcula SHA-256 da nova senha
3. Backend valida senha atual
4. Atualiza hash no D1

### Sessão
**Tipo:** KV Namespace (`SESSION`)  
**Limpeza:** Job cron `src/utils/cleanup-sessions.ts` (inativo por enquanto, pode ativar)

---

## 🎨 Padrões Visuais & CSS

### Classes Utilitárias
```css
.badge          /* Cor condicional + borda + padding */
.card           /* Container com sombra, borda */
.surface        /* Background accent, usado em hero */
.surface-soft   /* Background mais suave, alternativa */
.text-muted     /* Cor secundária */
```

### Container Padrão
```html
<main class="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
  <!-- Conteúdo centralizado -->
</main>
```

### Dark Mode
- **Padrão:** Dark mode sempre ativo (Tailwind dark prefix)
- **Cores:** Esquema de dark gray/blue (OLED-friendly)
- **Sem toggle:** Usuário não muda tema

### Badge de Privacidade
```astro
{project.is_private ? (
  <span class="badge-private">🔒 Privado</span>
) : (
  <span class="badge-public">🔓 Publico</span>
)}
```

---

## 📊 Estrutura de Dados (D1)

### Tabelas Principais

#### `projects`
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_repo_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  technologies TEXT DEFAULT '[]', -- JSON array
  is_private INTEGER DEFAULT 0,   -- 1=privado, 0=público
  github_url TEXT NOT NULL,
  live_url TEXT,
  homepage TEXT,
  stars INTEGER DEFAULT 0,
  topics TEXT DEFAULT '[]',       -- JSON array
  last_updated TEXT,              -- GitHub push date
  synced_at TEXT,                 -- Quando foi sincronizado
  is_active INTEGER DEFAULT 0,    -- 1=visível, 0=oculto
  custom_name TEXT,               -- Override do name
  custom_description TEXT,        -- Override do description
  order_position INTEGER DEFAULT 0, -- Ordenação manual
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### `admin_settings`
```sql
CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT
);
```
Exemplo: `key='password_hash'`, `value='<sha256>'`

#### `experiences`, `certifications` (similarmente estruturadas)

---

## 🚀 Pipeline de Deploy

### 1. Build
```bash
npm run build
# Saída: dist/server/entry.mjs, dist/client/*
# Validação: Sem erros TypeScript/Astro
```

### 2. Deploy Preview
```bash
npm run deploy:preview
# Publica em gabrielfsdev-preview.freitassouza26.workers.dev
# Sem confirmação adicional
```

### 3. Deploy Produção
```bash
npm run deploy:production
# 1. Build
# 2. Script pede confirmação: "Digite AUTORIZO_DEPLOY_PRODUCAO_GABRIELFSDEV"
# 3. Se correto → publica em gabrielfsdev.freitassouza26.workers.dev
# 4. Se errado → cancela
```

### Arquivo: `scripts/deploy-cloudflare.cjs`
```javascript
// Lê env GITHUB_TOKEN, GITHUB_USERNAME via wrangler secret
// Deploy preview: sem confirmação
// Deploy prod: pede frase de autorização (readline)
```

---

## 🔧 Pontos Críticos para Agentes

### ⚠️ Build Obrigatório
Sempre rodar `npm run build` antes de deploy. Sem exceções.

### ⚠️ Produção Exige Confirmação
Deploy de produção exige frase explícita. Nenhum script CI pode fazer sem input.

### ⚠️ GitHub Sync Não Deleta
Se deletar um repo no GitHub, ele permanece no D1 como `is_active = 0`.

### ⚠️ Badge de Privacidade
Renderização condicional de `is_private`:
- `1` → badge vermelho com 🔒
- `0` → badge verde com 🔓

### ⚠️ Campos Customizáveis
Admin pode sobrescrever `name` e `description`. Sync não apaga customizações.

### ⚠️ Env Secrets
`GITHUB_TOKEN`, `GITHUB_USERNAME`, `ADMIN_PASSWORD` são **secrets Cloudflare**, não devem ser commitados.

---

## 📝 Sequência Recomendada para Agentes

### Ao Fazer Mudanças no Frontend
1. Localizar arquivo em `src/pages/` ou `src/layouts/`
2. Consultar padrões visuais em `src/styles/global.css`
3. Conferir classes utilitárias usadas (badge, card, surface, etc.)
4. Testar localmente: `npm run dev`
5. Build: `npm run build`
6. Deploy preview: `npm run deploy:preview`

### Ao Fazer Mudanças no Backend/Sync
1. Localizar lógica em `src/utils/github.ts` ou `src/utils/db.ts`
2. Verificar schema D1 em `db/schema.sql`
3. Testar localmente com dados legados ou D1 local
4. Build e preview antes de produção

### Ao Fazer Deploy
1. Validar build: `npm run build` (sem erros)
2. Preview: `npm run deploy:preview`
3. Testar em preview
4. Produção: `npm run deploy:production` (+ frase)
5. Validar em https://gabrielfsdev.freitassouza26.workers.dev

---

## 🔍 Debugging

### Build Fails
```bash
npm run build 2>&1 | tail -50
# Procure por erros de TypeScript, CSS, Astro
```

### Deploy Fails
```bash
wrangler deployments list --env production
# Verifica últimas publicações
```

### Sessão Expirada
```
KV key format: session_<token>
TTL: Configurável via setex em KV
```

### GitHub Sync Falha
```
Verifique:
1. GITHUB_TOKEN válido (expirou?)
2. GITHUB_USERNAME correto
3. Rate limit GitHub (60 req/hora unauthenticated, 5000 authenticated)
```

---

## 📚 Referências Rápidas

- **Astro 6:** https://docs.astro.build/
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **D1:** https://developers.cloudflare.com/d1/
- **Tailwind 4:** https://tailwindcss.com/
- **GitHub API:** https://docs.github.com/en/rest

---

## ✅ Checklist para Agentes (Antes de Terminar)

- [ ] Build passou sem erros
- [ ] Deploy preview funcionando
- [ ] Visual coerente com design system (badges, cards, containers)
- [ ] Middleware de auth testado (se mudança em admin)
- [ ] GitHub sync testado (se mudança em sync)
- [ ] README.md atualizado (se mudança de features)
- [ ] Env secrets configurados corretamente
- [ ] Produção não publicada sem confirmação

---

**Última atualização:** 18 de abril de 2026  
**Versão:** Astro 6.1.7 + Cloudflare Workers
