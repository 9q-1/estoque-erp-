import { prisma } from '@/lib/prisma';

export interface FiltrosAuditoria {
  produtoTermo?: string;
  usuarioId?: string;
  pagina: number;
  porPagina: number;
}

export async function buscarAuditoria(filtros: FiltrosAuditoria) {
  const where = {
    ...(filtros.usuarioId ? { usuarioId: filtros.usuarioId } : {}),
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
    prisma.logAuditoria.findMany({
      where,
      include: {
        usuario: { select: { nome: true } },
        produto: { select: { codigo: true, descricao: true } },
      },
      orderBy: { criadoEm: 'desc' },
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
    }),
    prisma.logAuditoria.count({ where }),
  ]);

  return { itens, total, totalPaginas: Math.ceil(total / filtros.porPagina) };
}
