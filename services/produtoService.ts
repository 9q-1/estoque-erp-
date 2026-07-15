import { prisma } from '@/lib/prisma';

/**
 * Busca instantânea usada na Tela de Contagem.
 * Prioriza correspondência exata de código (leitor de código de barras / QR),
 * depois prefixo de código, depois descrição — nessa ordem, para que o operador
 * usando o leitor sempre caia direto no item certo.
 */
export async function buscarProdutos(termo: string, limite = 30) {
  const termoLimpo = termo.trim();

  if (!termoLimpo) {
    return prisma.produto.findMany({
      orderBy: { atualizadoEm: 'desc' },
      take: limite,
    });
  }

  // Código de barras ou código exato: retorno imediato de um único item
  const exato = await prisma.produto.findFirst({
    where: {
      OR: [{ codigo: termoLimpo }, { codigoBarras: termoLimpo }],
    },
  });
  if (exato) return [exato];

  return prisma.produto.findMany({
    where: {
      OR: [
        { codigo: { contains: termoLimpo, mode: 'insensitive' } },
        { descricao: { contains: termoLimpo, mode: 'insensitive' } },
        { codigoBarras: { contains: termoLimpo, mode: 'insensitive' } },
      ],
    },
    orderBy: { descricao: 'asc' },
    take: limite,
  });
}

export async function obterProdutoPorId(id: string) {
  return prisma.produto.findUnique({ where: { id } });
}

export async function contarProdutosPendentes() {
  return prisma.produto.count({ where: { contagem: null } });
}

export async function contarProdutosConferidos() {
  return prisma.produto.count({ where: { NOT: { contagem: null } } });
}
