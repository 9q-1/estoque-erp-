import { NextRequest, NextResponse } from 'next/server';
import { obterSessaoAtual } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { temPermissao } from '@/types';

export async function GET(request: NextRequest) {
  const sessao = await obterSessaoAtual();
  if (!sessao) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const quereTodos = searchParams.get('todos') === '1';
  const podeGerenciar = temPermissao(sessao.perfil, 'gerenciarUsuarios');

  const usuarios = await prisma.usuario.findMany({
    where: quereTodos && podeGerenciar ? {} : { ativo: true },
    select: {
      id: true,
      nome: true,
      login: true,
      perfil: true,
      ativo: true,
      criadoEm: true,
    },
    orderBy: { nome: 'asc' },
  });

  return NextResponse.json({ usuarios });
}
