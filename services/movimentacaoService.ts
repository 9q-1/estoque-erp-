import { prisma } from '@/lib/prisma';
import type { TipoMovimento } from '@prisma/client';

interface RegistrarMovimentoParams {
  produtoId: string;
  valor: number;
  tipo: TipoMovimento;
  usuarioId: string;
  ip: string | null;
  sessaoInventarioId?: string;
}

/**
 * Operação central do sistema — o comportamento muda conforme o tipo:
 *
 * - AJUSTE_CONTAGEM (Tela de Contagem): mexe só na CONTAGEM. O Saldo é o estoque de
 *   referência (o "livro") e não muda aqui — é contra ele que a Contagem é comparada,
 *   gerando a Diferença que aparece na Tela de Contagem e no Dashboard. O Saldo só
 *   é atualizado quando um Supervisor/Administrador fecha a contagem.
 *
 * - ENTRADA / SAIDA / CORRECAO_MANUAL (Tela de Entrada/Saída): mexe direto no SALDO,
 *   porque representa uma movimentação real de estoque (chegou/saiu material), não
 *   uma conferência. A Contagem não é tocada.
 *
 * Tudo roda em uma única transação para garantir que os campos e o histórico nunca
 * fiquem inconsistentes entre si.
 */
export async function registrarMovimento({
  produtoId,
  valor,
  tipo,
  usuarioId,
  ip,
  sessaoInventarioId,
}: RegistrarMovimentoParams) {
  return prisma.$transaction(async (tx) => {
    const produto = await tx.produto.findUnique({ where: { id: produtoId } });
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    const mexeNoSaldo = tipo !== 'AJUSTE_CONTAGEM';

    const valorAnterior = mexeNoSaldo ? produto.saldo : produto.contagem ?? produto.saldo;
    const valorNovo = arredondar(valorAnterior + valor);

    if (mexeNoSaldo && valorNovo < 0) {
      throw new Error('Essa saída deixaria o saldo negativo. Confira a quantidade.');
    }

    const produtoAtualizado = await tx.produto.update({
      where: { id: produtoId },
      data: mexeNoSaldo
        ? { saldo: valorNovo }
        : { contagem: valorNovo, conferidoEm: new Date() },
    });

    const movimentacao = await tx.movimentacao.create({
      data: {
        produtoId,
        usuarioId,
        tipo,
        valor,
        saldoAnterior: valorAnterior,
        saldoNovo: valorNovo,
        ip: ip ?? undefined,
        sessaoInventarioId,
      },
    });

    return { produto: produtoAtualizado, movimentacao };
  });
}

// Evita erros de ponto flutuante (ex: 0.1 + 0.2 !== 0.3) acumulando em várias contagens do dia.
function arredondar(valor: number): number {
  return Math.round(valor * 1000) / 1000;
}

export function extrairIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  return headers.get('x-real-ip');
}
