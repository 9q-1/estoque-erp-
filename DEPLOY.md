# Guia de Deploy Gratuito (Neon + Vercel)

Sem precisar instalar Node.js no PC da empresa. Tudo pelo navegador.

## 1. Criar o banco de dados (Neon)

1. Acesse https://neon.tech e crie uma conta gratuita (não pede cartão).
2. Crie um novo projeto (qualquer nome, ex: `estoque`).
3. Na tela do projeto, copie a **Connection String** (algo como
   `postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require`).
   Guarde essa string, vai usar no passo 3.

## 2. Subir o código para o GitHub

1. Acesse https://github.com e crie uma conta (se ainda não tiver).
2. Crie um repositório novo (ex: `estoque-system`), pode ser privado.
3. Na página do repositório vazio, use a opção **"uploading an existing file"**
   (ou arraste a pasta do projeto) para subir todos os arquivos direto pelo navegador —
   não precisa de Git instalado.

## 3. Deploy na Vercel

1. Acesse https://vercel.com e crie uma conta (pode entrar direto com o GitHub).
2. **Add New → Project** → selecione o repositório que você acabou de subir.
3. Antes de clicar em "Deploy", abra **Environment Variables** e adicione:
   - `DATABASE_URL` → cole a connection string do Neon (passo 1)
   - `SESSION_SECRET` → qualquer texto aleatório longo (ex: gere em
     https://generate-secret.vercel.app/32)
4. Clique em **Deploy**. A Vercel instala tudo, roda as migrations do banco
   automaticamente (configurado no `package.json`) e gera uma URL pública
   (algo como `estoque-system.vercel.app`).

## 4. Criar o usuário admin no banco em produção

O `npm run build` na Vercel já roda `prisma db push` automaticamente e cria as tabelas no
banco. O **seed** (usuário admin/admin e produtos de demonstração) não roda sozinho em
produção — rode uma vez pelo terminal do seu próprio PC (não precisa ser o da empresa),
apontando pro banco do Neon:

```bash
# na pasta do projeto, com o .env local apontando para a DATABASE_URL do Neon:
npm install
npx prisma db seed
```

Ou, mais simples: acesse o **SQL Editor** do próprio Neon e rode manualmente um INSERT
para o usuário admin — me avise se preferir esse caminho que te passo o SQL pronto.

## Resolvendo os erros que apareceram antes

Dois problemas foram corrigidos nesta versão:
1. O projeto estava configurado para SQLite (arquivo local), que não funciona na Vercel —
   trocado para PostgreSQL.
2. O build usava `prisma migrate deploy`, que depende de arquivos de migration que nunca
   existiram no repositório (gerá-los exige uma conexão de banco ativa) — trocado para
   `prisma db push`, que sincroniza o schema direto no banco sem precisar desses arquivos.
   É por isso que o comando SQL de criar o usuário admin pode ter falhado antes: as tabelas
   nunca chegaram a ser criadas no Neon.

Refaça o deploy com o `DATABASE_URL` do Neon configurado e deve funcionar. Depois do
deploy, rode `npx prisma db seed` (ou o SQL manual) para criar o usuário admin.
