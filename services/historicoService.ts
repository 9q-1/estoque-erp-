import { prisma } from '@/lib/prisma';

export interface FiltrosHistorico {
  produtoTermo?: string;
  usuarioId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  pagina: number;
  porPagina: number;
}

export async function buscarHistorico(filtros: FiltrosHistorico) {
  const where = {
    ...(filtros.usuarioId ? { usuarioId: filtros.usuarioId } : {}),
    ...(filtros.dataInicio || filtros.dataFim
      ? {
          criadoEm: {
            ...(filtros.dataInicio ? { gte: filtros.dataInicio } : {}),
            ...(filtros.dataFim ? { lte: filtros.dataFim } : {}),
          },
        }
      : {}),
    ...(filtros.produtoTermo
      ? {
          produto: {
            OR: [
              { codigo: { contains: filtros.produtoTermo, mode: 'insensitive' as const } },
              { descricao: { contains: filtros.produtoTermo, mode: 'insensitive' as const } },
            ],
          },
        }
      : {}),
  };

  const [itens, total] = await Promise.all([
    prisma.movimentacao.findMany({
      where,
      include: {
        produto: { select: { codigo: true, descricao: true, unidade: true } },
        usuario: { select: { nome: true, login: true } },
      },
      orderBy: { criadoEm: 'desc' },
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
    }),
    prisma.movimentacao.count({ where }),
  ]);

  return { itens, total, totalPaginas: Math.ceil(total / filtros.porPagina) };
}
