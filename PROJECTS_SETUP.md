# Setup: Sincronização de Projetos GitHub

## 📋 Resumo

Adicionado um novo sistema para sincronizar repositórios do GitHub automaticamente e exibi-los em uma página pública (`/projetos`) com painel de administração completo.

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `wrangler.toml` ou via Cloudflare Dashboard:

```toml
# Em wrangler.toml, adicione na seção [env.production]:
[env.production]
vars = { GITHUB_USERNAME = "seu-usuario-github", GITHUB_TOKEN = "seu-token-github" }
```

Ou via Cloudflare Dashboard:
- Vá para **Workers & Pages** > **Seu projeto** > **Settings** > **Environment variables**
- Adicione:
  - `GITHUB_USERNAME`: seu username do GitHub
  - `GITHUB_TOKEN`: token de acesso pessoal do GitHub (com permissão `public_repo`)

### 2. Gerar Token do GitHub

1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Escopo necessário: `public_repo` (para ler repos públicos)
4. Copie o token e adicione como `GITHUB_TOKEN`

## 📁 Estrutura de Dados

### Tabela: `projects`

```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    github_repo_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,                    -- Nome do repositório
    description TEXT,                      -- Descrição original do GitHub
    technologies TEXT DEFAULT '[]',        -- JSON array de tecnologias
    is_private INTEGER DEFAULT 0,          -- 1 se privado
    github_url TEXT NOT NULL,              -- URL do repositório
    live_url TEXT,                         -- URL de deploy (homepage)
    homepage TEXT,                         -- Alternativa para live_url
    stars INTEGER DEFAULT 0,               -- Número de stars
    topics TEXT DEFAULT '[]',              -- JSON array de topics
    last_updated TEXT,                     -- Data de último push
    synced_at TEXT,                        -- Quando foi sincronizado
    is_active INTEGER DEFAULT 0,           -- 1 para exibir no site
    custom_name TEXT,                      -- Nome customizado (opcional)
    custom_description TEXT,               -- Descrição customizada (opcional)
    order_position INTEGER DEFAULT 0,      -- Ordem manual na exibição
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Como Usar

### Painel Admin (`/admin/projects`)

#### Sincronizar Repositórios

1. Acesse `/admin/projects`
2. Clique em "🔄 Sincronizar GitHub"
3. Digite a senha do admin
4. Os repositórios serão listados (pode levar alguns segundos)

**O que acontece na sincronização:**
- ✅ Busca todos os repositórios (públicos + privados) do seu GitHub
- ✅ Insere novos repositórios na tabela
- ✅ Atualiza informações de repositórios existentes
- ✅ Extrai tecnologias primárias e topics
- ❌ NÃO deleta repositórios antigos

#### Editar Projeto

1. Na lista de projetos, clique em "✏️ Editar"
2. Customize:
   - **Nome** (deixe em branco para usar original do GitHub)
   - **Descrição** (deixe em branco para usar original)
   - **Ativo** (checkbox para exibir em `/projetos`)
   - **Posição** (número: maior = mais acima na lista)
3. Digite a senha e clique em "💾 Salvar"

#### Remover Projeto

1. Na lista, clique em "🗑️ Remover"
2. Digite a senha
3. O projeto será marcado como inativo (pode reativar depois)

**Nota:** Dados customizados são preservados! Se sincronizar novamente, não perde as customizações.

### Página Pública (`/projetos`)

- ✨ Lista todos os projetos ativos
- 🔍 Filtro por tecnologia (lado do cliente)
- 📊 Mostra: nome, descrição, tecnologias, stars, data de atualização, topics
- 🔒 Indica repositórios privados (sem link)
- 🚀 Links para GitHub (públicos) e Live/Homepage (se configurado)
- 📱 Design responsivo com cards

### Sincronização Automática (Cron)

**Configuração:** Segunda-feira à meia-noite (UTC)

```toml
# Em wrangler.toml
[[triggers.crons]]
cron = "0 0 * * 1"  # Every Monday at 00:00 UTC
```

**Endpoint:** `POST /admin/projects/sync-cron`

A sincronização cron:
- Roda automaticamente uma vez por semana
- Atualiza informações dos repositórios
- Não requer autenticação (usa Cloudflare Headers)
- Logs disponíveis em Cloudflare Workers Analytics

## 📊 Campos Automáticos

### Tecnologias

Extraídas automaticamente do GitHub:
1. **Linguagem primária** do repositório
2. **Topics** relevantes (exclui: "awesome", "template", "example", "tutorial")
3. Máximo: 10 tecnologias

### Topics

Copiados diretamente dos topics do repositório GitHub. Exibidos na página pública.

## 🔐 Segurança

✅ **Acesso protegido:**
- Painel admin: requer senha
- Sincronização manual: requer senha
- Cron: requer header `cf-cron` do Cloudflare
- Privados: URL do repo não é exposta para repositórios privados

✅ **Dados sensíveis:**
- Tokens são salvos em variáveis de ambiente (Cloudflare)
- Não são expostos no código

## 🐛 Troubleshooting

### "GitHub credentials not configured"
- Verifique se `GITHUB_USERNAME` e `GITHUB_TOKEN` estão definidos
- Em ambiente local: adicione a `.env.local` ou `wrangler.toml`
- Em produção: configure via Cloudflare Dashboard

### "Rate limit exceeded"
- GitHub permite 60 requisições/hora (sem autenticação)
- Com token: 5.000 requisições/hora
- A função trata retry automático

### "Syncronização não funciona"
- Verifique os logs: `wrangler tail gabrielfsdev`
- Confirme se há internet
- Tente sincronizar manualmente via botão do painel

## 📚 Arquivos Criados/Modificados

### Novos
- `src/utils/github.ts` - Integração GitHub API
- `src/pages/admin/projects/index.astro` - Painel listagem
- `src/pages/admin/projects/[id].astro` - Edição individual
- `src/pages/admin/projects/sync.ts` - Endpoint sync manual
- `src/pages/admin/projects/delete.ts` - Endpoint remover
- `src/pages/admin/projects/sync-cron.ts` - Handler do cron
- `src/pages/projetos.astro` - Página pública

### Modificados
- `db/schema.sql` - Adicionada tabela `projects`
- `src/utils/db.ts` - Inicialização de `projects` + migrações
- `src/layouts/AdminLayout.astro` - Link "Projetos" na sidebar
- `src/env.d.ts` - Tipos de `GITHUB_USERNAME` e `GITHUB_TOKEN`
- `wrangler.toml` - Configuração de cron

## 🚀 Próximos Passos

1. **Configurar variáveis de ambiente**
2. **Deploy:** `npm run deploy` (preview) ou `npm run deploy:production` (somente com autorização explícita)
3. **Sincronizar:** Acesse `/admin/projects` e clique em "🔄 Sincronizar GitHub"
4. **Personalizar:** Edite projetos conforme necessário
5. **Ativar:** Checkbox "Ativar para exibição no site"
6. **Visitar:** `/projetos` para ver a página pública

## 📝 Exemplos de Uso

### Filtrar projetos por linguagem
- Página pública mostra botões de filtro por tecnologia
- Clique para filtrar (lado do cliente, sem reload)

### Customizar descrição
- Edite um projeto no admin
- Digite descrição customizada
- Salve - aparece em `/projetos` com seu texto

### Ordenar projetos
- Campo "Posição na Listagem" (maior = mais acima)
- Depois ordena por data de atualização

### Repositório privado
- Aparece na lista do admin com "🔒 Privado"
- Aparece em `/projetos` mas sem link para o repo
- Mostra descrição e tecnologias normalmente
