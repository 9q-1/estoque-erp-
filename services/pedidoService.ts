import { prisma } from '@/lib/prisma';

export async function listarPedidos(apenasAtivos = false) {
  return prisma.pedido.findMany({
    where: apenasAtivos ? { ativo: true } : {},
    orderBy: { nome: 'asc' },
  });
}

export async function criarPedido(nome: string, descricao?: string) {
  return prisma.pedido.create({ data: { nome, descricao } });
}

export async function alternarAtivoPedido(id: string, ativo: boolean) {
  return prisma.pedido.update({ where: { id }, data: { ativo } });
}
