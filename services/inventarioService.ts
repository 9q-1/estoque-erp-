import { prisma } from '@/lib/prisma';

export async function iniciarSessaoInventario(usuarioId: string) {
  return prisma.sessaoInventario.create({ data: { usuarioId } });
}

export async function finalizarSessaoInventario(id: string) {
  const sessao = await prisma.sessaoInventario.findUnique({ where: { id } });
  if (!sessao) throw new Error('Sessão de inventário não encontrada');
  if (sessao.finalizadaEm) throw new Error('Sessão já foi finalizada');

  return prisma.sessaoInventario.update({
    where: { id },
    data: { finalizadaEm: new Date() },
  });
}

export async function obterRelatorioInventario(id: string) {
  const sessao = await prisma.sessaoInventario.findUnique({
    where: { id },
    include: {
      usuario: { select: { nome: true, login: true } },
      movimentacoes: {
        include: { produto: { select: { codigo: true, descricao: true, unidade: true, saldo: true } } },
        orderBy: { criadoEm: 'asc' },
      },
    },
  });
  if (!sessao) throw new Error('Sessão de inventário não encontrada');

  const produtosUnicos = new Map<string, (typeof sessao.movimentacoes)[number]>();
  for (const mov of sessao.movimentacoes) {
    produtosUnicos.set(mov.produtoId, mov); // fica com a última movimentação de cada produto
  }

  const itensConferidos = produtosUnicos.size;
  const divergencias = [...produtosUnicos.values()].filter(
    (mov) => mov.saldoNovo !== mov.produto.saldo
  );

  const inicio = sessao.iniciadaEm;
  const fim = sessao.finalizadaEm ?? new Date();
  const tempoGastoMs = fim.getTime() - inicio.getTime();

  return {
    sessao: {
      id: sessao.id,
      usuario: sessao.usuario,
      iniciadaEm: sessao.iniciadaEm,
      finalizadaEm: sessao.finalizadaEm,
      ativa: !sessao.finalizadaEm,
    },
    resumo: {
      itensConferidos,
      totalMovimentacoes: sessao.movimentacoes.length,
      divergenciasEncontradas: divergencias.length,
      tempoGastoMs,
    },
    movimentacoes: sessao.movimentacoes.map((m) => ({
      id: m.id,
      produto: m.produto,
      valor: m.valor,
      saldoAnterior: m.saldoAnterior,
      saldoNovo: m.saldoNovo,
      criadoEm: m.criadoEm,
    })),
    divergencias: divergencias.map((m) => ({
      produto: m.produto,
      contagemFinal: m.saldoNovo,
      saldoLivro: m.produto.saldo,
      diferenca: m.saldoNovo - m.produto.saldo,
    })),
  };
}
