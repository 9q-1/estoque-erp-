import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'estoque_sessao';
const ROTAS_PUBLICAS = ['/login'];
const ROTAS_PUBLICAS_EXATAS = ['/'];

function getSecretKey() {
  return new TextEncoder().encode(process.env.SESSION_SECRET ?? '');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const ehRotaPublica =
    ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota)) || ROTAS_PUBLICAS_EXATAS.includes(pathname);
  const ehAsset =
    pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.');
  const ehApiAuth = pathname.startsWith('/api/auth');

  if (ehRotaPublica || ehAsset || ehApiAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return redirecionarParaLogin(request, pathname);
  }

  try {
    await jwtVerify(token, getSecretKey());
    return NextResponse.next();
  } catch {
    return redirecionarParaLogin(request, pathname);
  }
}

function redirecionarParaLogin(request: NextRequest, origem: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  if (origem !== '/') url.searchParams.set('redirect', origem);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
