import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import type { SessaoUsuario } from '@/types';

const COOKIE_NAME = 'estoque_sessao';
const DURACAO_SESSAO = '12h'; // suficiente para um turno de trabalho

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'SESSION_SECRET não definida. Configure a variável de ambiente antes de iniciar o sistema.'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export async function criarSessao(usuario: SessaoUsuario): Promise<string> {
  return new SignJWT({ ...usuario })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(DURACAO_SESSAO)
    .sign(getSecretKey());
}

export async function definirCookieSessao(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12h em segundos
  });
}

export async function removerCookieSessao() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function obterSessaoAtual(): Promise<SessaoUsuario | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      id: payload.id as string,
      nome: payload.nome as string,
      login: payload.login as string,
      perfil: payload.perfil as SessaoUsuario['perfil'],
    };
  } catch {
    // token expirado ou inválido
    return null;
  }
}

export { COOKIE_NAME };
