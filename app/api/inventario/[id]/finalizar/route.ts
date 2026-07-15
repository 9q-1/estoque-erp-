import { NextResponse } from 'next/server';
import { obterSessaoAtual } from '@/lib/auth';
import { finalizarSessaoInventario, obterRelatorioInventario } from '@/services/inventarioService';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const sessao = await obterSessaoAtual();
  if (!sessao) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });

  try {
    await finalizarSessaoInventario(params.id);
    const relatorio = await obterRelatorioInventario(params.id);
    return NextResponse.json(relatorio);
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : 'Erro ao finalizar sessão' },
      { status: 400 }
    );
  }
}
