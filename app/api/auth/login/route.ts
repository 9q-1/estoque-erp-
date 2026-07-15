import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verificarSenha, criarSessao, definirCookieSessao } from '@/lib/auth';

const loginSchema = z.object({
  login: z.string().min(1, 'Informe o usuário'),
  senha: z.string().min(1, 'Informe a senha'),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.errors[0]?.message ?? 'Dados inválidos' },
      { status: 400 }
    );
  }

  const { login, senha } = parsed.data;

  const usuario = await prisma.usuario.findUnique({ where: { login } });

  if (!usuario || !usuario.ativo) {
    return NextResponse.json({ erro: 'Usuário ou senha inválidos' }, { status: 401 });
  }

  const senhaValida = await verificarSenha(senha, usuario.senhaHash);
  if (!senhaValida) {
    return NextResponse.json({ erro: 'Usuário ou senha inválidos' }, { status: 401 });
  }

  const token = await criarSessao({
    id: usuario.id,
    nome: usuario.nome,
    login: usuario.login,
    perfil: usuario.perfil,
  });
  await definirCookieSessao(token);

  return NextResponse.json({
    usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
  });
}
