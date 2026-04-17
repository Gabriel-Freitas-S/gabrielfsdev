# Knowledge Base & Rules (Astro 6 + Cloudflare)

## 📌 Contexto do Projeto
- **Stack:** Astro v6, Cloudflare Pages/Workers, Tailwind CSS v4, SQLite (D1 via Better SQLite3 localmente / Binding remotamente), Cloudflare R2 (Storage).
- **SPA Transitions:** O projeto utiliza `<ClientRouter />` para transições de página sem reloads (`view-transitions`).

## 🛑 Erros Críticos e Aprendizados

### 1. `require_dist is not a function` (Conflito de Versões do Vite)
- **Problema:** Um pacote como `@tailwindcss/vite` tenta instalar uma versão diferente de `vite` (ex: v8) além da versão exigida pelo Astro (ex: v7.3.2). Como são executados pelo mesmo proxy de SSR, a dupla injeção do runner do vite quebra a renderização gerando erro interno no Node.
- **Solução:** O arquivo `package.json` **deve manter** o `"overrides": { "vite": "^7.3.2" }` travando a versão para todas as dependências. Sempre rode `npm install` novamente e exclua `node_modules/.vite` ao fazer upgrade.

### 2. Acesso à Variáveis de Ambiente no Astro v6
- **Problema:** A forma antiga `Astro.locals.runtime.env` e `locals.runtime?.env` foi **REMOVIDA** no Astro 6 e na v13 do `@astrojs/cloudflare`.
- **Solução:** Deletar qualquer código que tente extrair `runtime.env`.
- **Uso Correto:**
```typescript
import { env } from "cloudflare:workers";

// Acessar normalmente as bindings e variáveis globais 
if (env?.DB) {
    const data = await env.DB.prepare('SELECT * FROM users').run();
}
```

### 3. Scripts, Eventos e View Transitions (`<ClientRouter />`)
- **Problema:** Ao usar `<ClientRouter />`, scripts normais não rodam ao trocar de aba/rota porque não há recarregamento completo da janela, e scripts globais com loops injetados podem conflitar na destruição/montagem da árvore do DOM.
- **Solução:** 
  1. Scripts vitais de inicialização ou componentes visuais que precisam re-renderizar sozinhos devem usar `is:inline data-astro-rerun`.
  2. Elementos isolados (como barra de buscar, menus e modais dinâmicos) devem ter seus listeners atrelados aos eventos de navegação do Astro (`astro:page-load` ou `astro:after-swap`), caso não usem `data-astro-rerun`.
  3. Preste atenção extra em scripts construídos dentro de laços (`.map()`), eles irão instanciar dezenas de referências, o que pode esgotar a pilha da transição. Mova as lógicas de lista e evento para arquivos separados ou para a base da página, e trabalhe com `querySelectorAll`.

## 🛡️ Segurança e Middlewares
- Verifique e adicione sempre proteções como HTTP Headers customizados (`Strict-Transport-Security`, `Content-Security-Policy`) e controle das rotas base (`/admin`) nos Middlewares, mas evite invocar `locals.runtime` ao testar sessões no `middleware.ts`. Use a global import definition listada acima.

## 🚦 Regra Obrigatória de Deploy (Agente)
- **NUNCA** executar `wrangler deploy` diretamente quando estiver atuando como agente neste repositório.
- Deploy padrão deve ser **sempre** via `npm run deploy` (alvo preview).
- Para preview explícito: `npm run deploy:preview`.
- Produção só pode ser usada quando o usuário pedir explicitamente e com autorização interativa: `npm run deploy:production`.
- Se não houver pedido explícito do usuário para produção, tratar qualquer operação de deploy como preview.
