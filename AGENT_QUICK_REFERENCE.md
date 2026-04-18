# AGENT_QUICK_REFERENCE.md — Cheat Sheet para Agentes

**TL;DR:** Guia ultra-conciso do projeto.

---

## 🎯 Stack
- Astro 6 + Cloudflare Workers (SSR)
- D1 (banco), R2 (assets), KV (sessão)
- Tailwind 4 CSS
- TypeScript + JavaScript

---

## 📂 Arquivos Críticos
- `src/middleware.ts` — Auth admin
- `src/utils/github.ts` — Sync GitHub
- `src/pages/admin/projects/` — CRUD projetos
- `db/schema.sql` — Schema D1
- `scripts/deploy-cloudflare.cjs` — Deploy

---

## 🚀 Comandos Rápidos
```bash
npm run dev              # Dev local
npm run build            # Build (sempre antes de deploy)
npm run deploy           # Deploy preview
npm run deploy:production # Deploy prod (exige frase)
```

---

## 🔒 Autorização Produção
**Frase:** `AUTORIZO_DEPLOY_PRODUCAO_GABRIELFSDEV`

---

## 🎨 Classes Visuais
- `.badge` — Status/label
- `.card` — Container com sombra
- `.surface-soft` — Background suave

---

## 📊 GitHub Sync
- **Manual:** `/admin/projects` → botão "Sincronizar"
- **Automático:** Segunda 00:00 UTC
- **Não deleta:** Projetos deletados no GitHub ficam `is_active=0`

---

## 🔐 Secrets (Cloudflare)
- `ADMIN_PASSWORD` — Hash SHA-256
- `GITHUB_TOKEN` — PAT GitHub
- `GITHUB_USERNAME` — Username GitHub

---

## ✅ Antes de Finalizar
1. `npm run build` (sem erros)
2. Preview funcionando
3. Visual OK (badges, cards, dark mode)
4. Docs atualizadas

---

## 🔗 Referências Completas
- `.agent.json` — Contexto estruturado
- `AGENT_CONTEXT.md` — Guia detalhado
- `COPILOT_AGENT_INSTRUCTIONS.md` — Procedimentos
- `README.md` — Documentação completa
