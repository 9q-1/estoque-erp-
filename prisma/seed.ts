import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existente = await prisma.usuario.findUnique({ where: { login: 'admin' } });

  if (existente) {
    console.log('Usuário "admin" já existe. Nada a fazer.');
    return;
  }

  const senhaHash = await bcrypt.hash('admin', 10);

  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      login: 'admin',
      senhaHash,
      perfil: 'ADMINISTRADOR',
    },
  });

  console.log('✅ Usuário admin criado com sucesso.');
  console.log('   Login: admin');
  console.log('   Senha: admin');
  console.log('   ⚠️  Troque essa senha assim que possível (crie um novo admin e desative este, ou implemente troca de senha no perfil).');

  await criarProdutosDemo();
}

// Produtos de exemplo, só para você já testar o sistema sem precisar importar Excel.
// Pode apagar todos depois pela tela de Cadastro ou direto no banco.
async function criarProdutosDemo() {
  const jaTemProdutos = await prisma.produto.count();
  if (jaTemProdutos > 0) {
    console.log('Já existem produtos cadastrados. Pulando criação de demonstração.');
    return;
  }

  const pedido = await prisma.pedido.create({
    data: { nome: 'TETTO 5900', descricao: 'Pedido de demonstração' },
  });

  await prisma.produto.createMany({
    data: [
      { codigo: '1001', descricao: 'Parafuso sextavado M8x30', unidade: 'UN', saldo: 320, localizacao: 'A1-03', categoria: 'Fixação', custoUnitario: 0.35 },
      {
        codigo: '1002',
        descricao: 'Painel de parede Cumaru 15x140mm',
        unidade: 'CX',
        saldo: 32,
        localizacao: 'B2-11',
        categoria: 'Madeira',
        pedidoId: pedido.id,
        fatorConversao: 0.0951,
        unidadeConversao: 'm³',
        custoUnitario: 420,
      },
      { codigo: '1003', descricao: 'Correia dentada 12mm', unidade: 'UN', saldo: 18, localizacao: 'C3-02', categoria: 'Peças', estoqueMinimo: 20, custoUnitario: 58 },
      { codigo: '1004', descricao: 'Luva de proteção nitrílica (par)', unidade: 'PAR', saldo: 150, localizacao: 'D1-07', categoria: 'EPI', custoUnitario: 6.9 },
      { codigo: '1005', descricao: 'Chapa de aço inox 1000x2000mm', unidade: 'UN', saldo: 8, localizacao: 'E4-01', categoria: 'Matéria-prima', estoqueMinimo: 10, custoUnitario: 1250 },
    ],
  });

  console.log('✅ 5 produtos de demonstração criados (1 vinculado ao pedido "TETTO 5900").');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
