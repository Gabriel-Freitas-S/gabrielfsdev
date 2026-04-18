# Instruções para Copilot Agent — gabrielfsdev

> Este arquivo contém instruções estruturadas para Copilot Coding Agent ao trabalhar no projeto gabrielfsdev.

---

## 📌 Identidade do Projeto

- **Nome:** gabrielfsdev
- **Tipo:** Portfólio + Admin Panel + GitHub Sync
- **Stack:** Astro 6, Cloudflare Workers, D1, R2, KV
- **Deploy:** Cloudflare Workers (preview + produção segura)

---

## 🎯 Tarefas Típicas e Procedimentos

### Tarefa: Adicionar Nova Feature em Admin

1. **Arquivo de rota:** Criar em `src/pages/admin/[feature].astro`
2. **Proteção:** Verificar que middleware está ativo (`/admin/*`)
3. **Autenticação:** Se ação sensível, adicionar `data-require-auth` + modal
4. **Padrão visual:** Usar classes `badge`, `card`, `surface-soft` (veja `src/styles/global.css`)
5. **Build:** `npm run build`
6. **Deploy preview:** `npm run deploy:preview`
7. **Testar:** https://gabrielfsdev-preview.freitassouza26.workers.dev

### Tarefa: Corrigir GitHub Sync

1. **Arquivo:** `src/utils/github.ts`
2. **Funcionalidades principais:**
   - `fetchGitHubRepos()` — busca repos do GitHub
   - `extractTechnologies()` — extrai tecnologias (linguagem principal + todas as linguagens)
   - `syncProjectsFromGitHub()` — sincroniza com D1
3. **Teste:**
   ```bash
   npm run dev
   # Acessar /admin/projects
   # Clicar "Sincronizar GitHub"
   ```
4. **Validar:** D1 local com `wrangler d1 execute gabrielfs-db --local -- SELECT * FROM projects;`

### Tarefa: Deploy em Produção

1. **Pré-requisitos:**
   - Build sem erros: `npm run build`
   - Testado em preview
   - Commits feitos e confirmados
2. **Execute:** `npm run deploy:production`
3. **Prompts:**
   - Digite frase de autorização quando solicitado
   - **Frase:** `AUTORIZO_DEPLOY_PRODUCAO_GABRIELFSDEV`
4. **Validar:** https://gabrielfsdev.freitassouza26.workers.dev

### Tarefa: Atualizar Padrões Visuais

1. **Classes:** `src/styles/global.css`
2. **Layouts:** `src/layouts/Layout.astro` (público), `AdminLayout.astro` (admin)
3. **Padrão de container:** 
   ```html
   max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14
   ```
4. **Dark mode:** Padrão, sem toggle
5. **Build e test:** `npm run dev` + visual check

---

## 🔐 Segurança & Credenciais

### Secrets (Nunca Commitá-los)
- `ADMIN_PASSWORD` — Senha admin (hash SHA-256 em D1)
- `GITHUB_TOKEN` — Token GitHub (PAT)
- `GITHUB_USERNAME` — Usuário GitHub

### Armazenamento Seguro
```bash
# Adicionar secrets Cloudflare
npx wrangler secret put ADMIN_PASSWORD --env preview
npx wrangler secret put GITHUB_TOKEN --env preview
npx wrangler secret put GITHUB_USERNAME --env preview

# Não adicionar a .env commitado
```

### Autenticação Admin
- **Cookie:** `admin_session` (httpOnly, SameSite=Lax)
- **Middleware:** `src/middleware.ts` valida `/admin/*`
- **Hash:** SHA-256 (veja `src/utils/auth.ts`)

---

## ⚙️ Comandos Essenciais

```bash
# Dev
npm run dev
npm run build
npm run preview

# Deploy
npm run deploy             # Padrão: preview
npm run deploy:preview     # Preview explícito
npm run deploy:production  # Produção (exige autorização)

# Wrangler
wrangler d1 execute gabrielfs-db --local --file ./db/schema.sql
wrangler secret list --env preview
npx wrangler deployments list --env production
```

---

## 📂 Arquivos Críticos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/middleware.ts` | Autenticação admin |
| `src/utils/github.ts` | Sincronização GitHub |
| `src/utils/auth.ts` | Hash, validação de senha |
| `src/utils/db.ts` | Queries D1, schema |
| `src/pages/admin/projects/` | CRUD de projetos |
| `src/styles/global.css` | Design system, classes utilitárias |
| `scripts/deploy-cloudflare.cjs` | Pipeline de deploy |
| `db/schema.sql` | Schema D1 |
| `.agent.json` | Contexto estruturado para agentes |
| `AGENT_CONTEXT.md` | Guia detalhado para agentes |

---

## 🔍 Validação Antes de Finalizar

- [ ] **Build:** `npm run build` (sem erros)
- [ ] **Tipo:** `npx astro check` (sem erros TypeScript)
- [ ] **Visual:** Badges, cards, containers coerentes
- [ ] **Auth:** Middleware validado em rotas `/admin/*`
- [ ] **Deploy:** Preview funcionando antes de produção
- [ ] **Documentação:** README.md atualizado (se mudança de features)

---

## 🚀 Checklist de Deploy

### Preview
1. `npm run build` ✓
2. `npm run deploy:preview` ✓
3. Testar em https://gabrielfsdev-preview.freitassouza26.workers.dev ✓

### Produção
1. Validado em preview ✓
2. `npm run deploy:production` ✓
3. Digite: `AUTORIZO_DEPLOY_PRODUCAO_GABRIELFSDEV` ✓
4. Validar em https://gabrielfsdev.freitassouza26.workers.dev ✓

---

## 📝 Padrões de Código

### Astro Component Template
```astro
---
import Layout from '../layouts/Layout.astro';
import { ensureCoreTables } from '../utils/db';
import { env } from 'cloudflare:workers';

await ensureCoreTables(env);

// Lógica aqui
---

<Layout title="Página">
  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
    <!-- Conteúdo -->
  </main>
</Layout>
```

### TypeScript Utility
```typescript
import type { Context } from 'cloudflare:workers';

export async function functionName(env: any, param: string): Promise<Type> {
  // Lógica aqui
  return result;
}
```

### CSS Tailwind
```css
@layer components {
  .badge {
    @apply inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold;
  }
}
```

---

## ⚠️ Armadilhas Comuns

1. **Esquecer build antes de deploy** → Sempre `npm run build` primeiro
2. **Deploy produção sem preview** → Sempre testar em preview antes
3. **Commitá secrets** → Usar `wrangler secret put` apenas
4. **Deletar projetos GitHub** → Sync não deleta, apenas desativa (`is_active = 0`)
5. **Middleware não validando auth** → Verificar `src/middleware.ts` se houver novo `/admin/*` routes

---

## 📞 Referências Rápidas

- **Stack Overflow:** Astro 6, Cloudflare Workers
- **Docs:** `.agent.json` e `AGENT_CONTEXT.md`
- **Bugs conhecidos:** Nenhum registrado
- **Última atualização:** 18 de abril de 2026

---

## ✅ Finalizando a Tarefa

1. Confirmar que build passou
2. Validar mudanças em preview
3. Atualizar README.md se necessário
4. Colocar um comentário descritivo no commit
5. Pronto para produção (com confirmação manual se necessário)

---

**Versão:** Astro 6.1.7 + Cloudflare Workers  
**Próxima revisão:** Quando Astro 7 for disponível ou mudanças significativas ocorrerem
