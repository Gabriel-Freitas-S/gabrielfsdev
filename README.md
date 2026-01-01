# GabrielFS.dev — Astro + Cloudflare

Portfólio com área admin para editar hero, experiências e certificações. Roda como Worker/Pages Functions usando D1 e R2.

## Stack
- Astro 5 (`output: server`) + `@astrojs/cloudflare`
- Tailwind CSS v4 (`@tailwindcss/vite`)
- D1 para conteúdo dinâmico; R2 para imagem do hero (KV configurado, não usado)

## Rotas principais
- `/` hero editável, imagem do R2
- `/experiencia` linha do tempo (D1 ou dados legados)
- `/certificacoes` listagem + busca (D1 ou dados legados)
- `/admin` login/dashboard; `/admin/password` troca de senha; `/admin/hero-image` upload `.webp`; `/admin/logout`

## Setup rápido
1) `npm install`
2) Dev sem bindings (usa dados legados e placeholder): `npm run dev`
3) Com D1 local: `wrangler d1 execute gabrielfs-db --local --file ./db/schema.sql` (+ opcional `db/seed-legacy.sql`)
4) Com bindings: `wrangler dev` (usa `wrangler.toml`)

## Variáveis/bindings
- `ADMIN_PASSWORD` primeira senha; depois o hash fica no D1 (`admin_settings`)
- D1 `DB`, R2 `R2` (necessário para imagem do hero)
- KV `MY_KV` (opcional, não usado)

## Comandos
- `npm run dev` — dev server
- `npm run build` — build em `dist/`
- `npm run preview` — preview do build

## Deploy (Cloudflare)
- Preencha IDs reais de D1/R2/KV em `wrangler.toml`
- `npm run build` e `wrangler deploy`

## Segurança
- Senha admin hash SHA-256 em D1; cookie `admin_session` httpOnly + SameSite=Lax; `/admin/logout` limpa sessão
