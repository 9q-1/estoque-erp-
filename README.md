# Estoque ERP · Gestão de Inventário Industrial

Plataforma corporativa para controle de estoque, contagem, movimentações e
indicadores de produção — construída para uso diário no chão de fábrica,
como website e como aplicativo PWA (inclusive no iPhone).

- **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma ·
  PostgreSQL · JWT (sessão em cookie httpOnly)
- **Tema:** claro, corporativo, verde industrial — ver `tailwind.config.ts`
- **Changelog completo:** [`CHANGELOG_ERP.md`](./CHANGELOG_ERP.md)
- **Deploy gratuito (Neon + Vercel):** [`DEPLOY.md`](./DEPLOY.md)

## Funcionalidades

| Módulo | Rota | Descrição |
|---|---|---|
| Tela inicial | `/` | Splash + boas-vindas institucional com atalhos para todas as telas |
| Dashboard executivo | `/dashboard` | KPIs, gráficos de movimentação (diário e mensal), estoque crítico e divergências |
| Contagem | `/contagem` | Conferência de saldo com busca, teclado numérico e scanner por câmera |
| Entrada / Saída | `/movimentacao` | Lançamento de movimentações que alteram o saldo real |
| Histórico | `/historico` | Linha do tempo completa e filtrável de todas as movimentações |
| Produtos | `/produtos` | Cadastro, importação/exportação (Excel/CSV), pedidos e conversão de unidade |
| Relatórios | `/relatorios` | Valorização de estoque, movimentações por período, top produtos |
| Auditoria | `/auditoria` | Trilha de alterações de cadastro |
| Usuários | `/usuarios` | Gestão de contas e perfis de acesso |
| Perfil | `/perfil` | Dados da conta logada e troca de senha |
| Modo Inventário | — | Sessão cronometrada de conferência, com relatório de fechamento |

Perfis de acesso: `ADMINISTRADOR`, `GERENTE`, `ENCARREGADO`, `OPERADOR`
(permissões centralizadas em `types/index.ts`).

## Como rodar localmente

O projeto usa PostgreSQL. Para desenvolvimento, crie um banco gratuito em
[neon.tech](https://neon.tech) (não pede cartão) e cole a connection string
no `.env`.

```bash
npm install                  # também roda `prisma generate` (postinstall)
cp .env.example .env         # edite DATABASE_URL e SESSION_SECRET
npx prisma db push           # cria as tabelas no banco
npx prisma db seed           # cria o usuário admin/admin e dados de demonstração
npm run dev
```

Acesse `http://localhost:3000`. A tela inicial mostra o sistema e leva ao
login; primeiro acesso com usuário `admin` / senha `admin`.

## Scripts

```bash
npm run dev              # ambiente de desenvolvimento
npm run build             # build de produção (roda `prisma db push` + `next build`)
npm run start              # servidor de produção
npm run lint                # ESLint
npm run user:create        # cria um usuário pelo terminal, sem abrir o sistema
npm run db:seed             # popula o banco com dados de demonstração
npm run prisma:studio       # explorador visual do banco de dados
```

## Estrutura de pastas

```
app/                # rotas (App Router) — páginas e endpoints de API
components/         # componentes de UI, organizados por domínio + ui/ (primitivos)
features/           # hooks de dados por módulo (useProdutos, useContagem, ...)
services/           # regras de negócio e acesso ao banco (camada de serviço)
lib/                # auth, formatação, validação, navegação, config do app
hooks/               # hooks compartilhados (sessão, modo inventário)
prisma/              # schema do banco e seed
public/              # ícones, splash screens, manifest e service worker (PWA)
types/               # tipos e matriz de permissões compartilhados
```

## PWA (Website + App para iPhone)

O projeto já está pronto para ser instalado como aplicativo:

- `public/manifest.json` — nome, ícones, cor de tema e atalhos
- `public/sw.js` — service worker (cache de estáticos, fallback offline)
- `public/offline.html` — página exibida sem conexão
- `public/icons/` e `public/apple-touch-icon.png` — ícone em todos os tamanhos
- `public/splash/` — splash screens nativas para os principais tamanhos de iPhone
- Meta tags de iOS em `app/layout.tsx` (`apple-mobile-web-app-*`, `theme-color`)

Para instalar no iPhone: abrir o site no Safari → **Compartilhar** →
**Adicionar à Tela de Início**.

## Segurança

- Sessão via JWT assinado em cookie `httpOnly` (12h de duração)
- Middleware protege todas as rotas exceto `/login` e a tela inicial (`/`)
- Senhas com hash `bcrypt`
- Permissões por perfil validadas tanto na API quanto na interface
