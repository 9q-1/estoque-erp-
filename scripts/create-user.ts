/**
 * Atalho (hk) para criar usuários direto pelo terminal, sem precisar abrir o sistema.
 *
 * Uso:
 *   npm run user:create -- --nome "João Silva" --login joao --senha 123456 --perfil OPERADOR
 *
 * Perfis aceitos: ADMINISTRADOR | GERENTE | ENCARREGADO | OPERADOR (padrão: OPERADOR)
 *
 * Também funciona em modo interativo, sem argumentos:
 *   npm run user:create
 */
import { createInterface } from 'node:readline/promises';
import { PrismaClient, PerfilUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const map: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i]?.startsWith('--')) {
      const chave = args[i]!.replace('--', '');
      map[chave] = args[i + 1] ?? '';
      i++;
    }
  }
  return map;
}

async function perguntarFaltantes(dados: Record<string, string>) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  if (!dados.nome) dados.nome = await rl.question('Nome completo: ');
  if (!dados.login) dados.login = await rl.question('Login (usuário): ');
  if (!dados.senha) dados.senha = await rl.question('Senha: ');
  if (!dados.perfil) {
    dados.perfil =
      (await rl.question('Perfil [ADMINISTRADOR/GERENTE/ENCARREGADO/OPERADOR] (padrão OPERADOR): ')) ||
      'OPERADOR';
  }

  rl.close();
  return dados;
}

async function main() {
  let dados = parseArgs();
  dados = await perguntarFaltantes(dados);

  const perfil = dados.perfil.toUpperCase();
  if (!Object.values(PerfilUsuario).includes(perfil as PerfilUsuario)) {
    console.error(`❌ Perfil inválido: "${dados.perfil}". Use ADMINISTRADOR, GERENTE, ENCARREGADO ou OPERADOR.`);
    process.exit(1);
  }

  if (!dados.nome || !dados.login || !dados.senha) {
    console.error('❌ Nome, login e senha são obrigatórios.');
    process.exit(1);
  }

  const jaExiste = await prisma.usuario.findUnique({ where: { login: dados.login } });
  if (jaExiste) {
    console.error(`❌ Já existe um usuário com o login "${dados.login}".`);
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(dados.senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nome: dados.nome,
      login: dados.login,
      senhaHash,
      perfil: perfil as PerfilUsuario,
    },
  });

  console.log('\n✅ Usuário criado com sucesso:');
  console.log(`   Nome:   ${usuario.nome}`);
  console.log(`   Login:  ${usuario.login}`);
  console.log(`   Perfil: ${usuario.perfil}`);
}

main()
  .catch((e) => {
    console.error('Erro ao criar usuário:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
