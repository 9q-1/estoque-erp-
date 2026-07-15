import { NextRequest, NextResponse } from 'next/server';
import { obterSessaoAtual } from '@/lib/auth';
import {
  obterMetricasDashboard,
  listarProdutosCriticos,
  listarProdutosDivergentes,
  obterIndicadoresFinanceiros,
  obterResumoMovimentacoes,
  obterResumoMovimentacoesMensal,
  obterDistribuicaoPorCategoria,
  contarPedidosAtivos,
} from '@/services/dashboardService';

export async function GET(request: NextRequest) {
  const sessao = await obterSessaoAtual();
  if (!sessao) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });

  const pedidoId = request.nextUrl.searchParams.get('pedidoId') ?? undefined;

  const [metricas, criticos, divergentes, financeiro, movimentacoes, movimentacoesMensal, categorias, pedidosAtivos] = await Promise.all([
    obterMetricasDashboard(pedidoId),
    listarProdutosCriticos(10, pedidoId),
    listarProdutosDivergentes(10, pedidoId),
    obterIndicadoresFinanceiros(pedidoId),
    obterResumoMovimentacoes(7, pedidoId),
    obterResumoMovimentacoesMensal(6, pedidoId),
    obterDistribuicaoPorCategoria(pedidoId),
    contarPedidosAtivos(),
  ]);

  return NextResponse.json({
    metricas,
    criticos,
    divergentes,
    financeiro,
    movimentacoes,
    movimentacoesMensal,
    categorias,
    pedidosAtivos,
  });
}
