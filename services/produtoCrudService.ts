import { prisma } from '@/lib/prisma';

export interface FiltrosProdutos {
  termo?: string;
  categoria?: string;
  pedidoId?: string;
  apenasCriticos?: boolean;
  apenasDivergentes?: boolean;
  pagina: number;
  porPagina: number;
}

export async function listarProdutos(filtros: FiltrosProdutos) {
  const condicoes: any[] = [];

  if (filtros.termo) {
    condicoes.push({
      OR: [
        { codigo: { contains: filtros.termo, mode: 'insensitive' } },
        { descricao: { contains: filtros.termo, mode: 'insensitive' } },
        { codigoBarras: { contains: filtros.termo, mode: 'insensitive' } },
      ],
    });
  }

  if (filtros.categoria) {
    condicoes.push({ categoria: filtros.categoria });
  }

  if (filtros.pedidoId) {
    condicoes.push({ pedidoId: filtros.pedidoId });
  }

  const where = condicoes.length > 0 ? { AND: condicoes } : {};

  const [todos, total] = await Promise.all([
    prisma.produto.findMany({
      where,
      include: { pedido: { select: { nome: true } } },
      orderBy: { descricao: 'asc' },
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
    }),
    prisma.produto.count({ where }),
  ]);

  // Estoque crítico e divergência dependem de comparação entre 2 campos do mesmo registro,
  // o que o SQLite via Prisma não filtra nativamente — aplicado em memória após a paginação.
  const itens = todos.filter((p) => {
    if (filtros.apenasCriticos && !(p.estoqueMinimo != null && p.saldo <= p.estoqueMinimo)) {
      return false;
    }
    if (filtros.apenasDivergentes && !(p.contagem != null && p.contagem !== p.saldo)) {
      return false;
    }
    return true;
  });

  return { itens, total, totalPaginas: Math.ceil(total / filtros.porPagina) };
}

export async function criarProduto(dados: {
  codigo: string;
  descricao: string;
  unidade: string;
  saldo: number;
  localizacao?: string;
  categoria?: string;
  observacoes?: string;
  codigoBarras?: string;
  estoqueMinimo?: number;
  custoUnitario?: number;
  pedidoId?: string;
  fatorConversao?: number;
  unidadeConversao?: string;
}, usuarioId: string) {
  const produto = await prisma.produto.create({ data: dados });

  await prisma.logAuditoria.create({
    data: {
      usuarioId,
      produtoId: produto.id,
      acao: 'PRODUTO_CRIADO',
    },
  });

  return produto;
}

export async function atualizarProduto(
  id: string,
  dados: Partial<{
    descricao: string;
    unidade: string;
    saldo: number;
    localizacao: string | null;
    categoria: string | null;
    observacoes: string | null;
    codigoBarras: string | null;
    estoqueMinimo: number | null;
    custoUnitario: number | null;
    pedidoId: string | null;
    fatorConversao: number | null;
    unidadeConversao: string | null;
  }>,
  usuarioId: string
) {
  const anterior = await prisma.produto.findUnique({ where: { id } });
  if (!anterior) throw new Error('Produto não encontrado');

  const produto = await prisma.produto.update({ where: { id }, data: dados });

  // Auditoria campo a campo: só registra o que realmente mudou.
  const registros = Object.entries(dados)
    .filter(([campo, valor]) => (anterior as any)[campo] !== valor)
    .map(([campo, valor]) => ({
      usuarioId,
      produtoId: id,
      acao: 'PRODUTO_EDITADO',
      campoAlterado: campo,
      valorAntigo: String((anterior as any)[campo] ?? ''),
      valorNovo: String(valor ?? ''),
    }));

  if (registros.length > 0) {
    await prisma.logAuditoria.createMany({ data: registros });
  }

  return produto;
}

export async function excluirProduto(id: string, usuarioId: string) {
  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) throw new Error('Produto não encontrado');

  const temMovimentacoes = await prisma.movimentacao.count({ where: { produtoId: id } });
  if (temMovimentacoes > 0) {
    throw new Error(
      'Este produto já possui movimentações registradas e não pode ser excluído (integridade do histórico). Desative-o ou zere o saldo em vez disso.'
    );
  }

  await prisma.logAuditoria.create({
    data: { usuarioId, produtoId: id, acao: 'PRODUTO_EXCLUIDO' },
  });

  await prisma.produto.delete({ where: { id } });
}

export async function listarCategorias() {
  const resultado = await prisma.produto.findMany({
    where: { categoria: { not: null } },
    select: { categoria: true },
    distinct: ['categoria'],
  });
  return resultado.map((r) => r.categoria).filter(Boolean) as string[];
}
