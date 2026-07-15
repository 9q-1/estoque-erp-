'use client';

import { useState, useRef, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Factory, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { APP_NOME, APP_DESCRICAO } from '@/lib/appInfo';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const senhaRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? 'Não foi possível entrar');
        setCarregando(false);
        return;
      }

      const destino = searchParams.get('redirect') || '/dashboard';
      router.push(destino);
      router.refresh();
    } catch {
      setErro('Falha de conexão. Tente novamente.');
      setCarregando(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Painel institucional — visível em telas médias e maiores */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sidebar to-sidebar-active p-10 text-white md:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Factory size={20} />
          </span>
          <span className="text-sm font-bold tracking-wide">ESTOQUE ERP</span>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">
            Gestão de inventário
            <br /> pensada para a fábrica.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{APP_DESCRICAO}</p>
        </div>

        <p className="relative text-xs text-white/40">Acesso restrito a usuários autorizados.</p>
      </div>

      {/* Formulário de login */}
      <div className="flex items-center justify-center bg-base-50 px-4 py-12">
        <div className="w-full max-w-sm animate-in">
          <div className="mb-8 flex flex-col items-center text-center md:hidden">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sidebar-active to-sidebar text-white shadow-elevated">
              <Factory size={26} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-base-950">{APP_NOME}</h1>
          </div>

          <div className="mb-6 hidden md:block">
            <h1 className="text-2xl font-bold tracking-tight text-base-950">Entrar</h1>
            <p className="mt-1 text-sm text-base-800/60">Informe suas credenciais para continuar</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-base-200 bg-surface p-6 shadow-elevated"
          >
            <div className="mb-4">
              <label htmlFor="login" className="mb-1.5 block text-sm font-medium text-base-800">
                Usuário
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-base-200 bg-surface-raised px-4 focus-within:border-action">
                <UserIcon size={17} className="shrink-0 text-base-800/40" />
                <input
                  id="login"
                  type="text"
                  autoFocus
                  autoComplete="username"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') senhaRef.current?.focus();
                  }}
                  className="h-14 w-full bg-transparent text-lg outline-none"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-base-800">
                Senha
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-base-200 bg-surface-raised px-4 focus-within:border-action">
                <Lock size={17} className="shrink-0 text-base-800/40" />
                <input
                  id="senha"
                  ref={senhaRef}
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-14 w-full bg-transparent text-lg outline-none"
                  placeholder="••••••"
                />
              </div>
            </div>

            {erro && (
              <div className="mb-4 rounded-lg bg-critical-bg px-4 py-3 text-sm font-medium text-critical">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-action text-lg font-semibold text-action-contrast transition-all hover:bg-action-hover hover:shadow-glow active:scale-[0.99] disabled:opacity-60"
            >
              {carregando ? 'Entrando...' : (
                <>
                  Entrar <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-base-800/40">
            Primeiro acesso: usuário <span className="font-mono font-semibold text-base-800/70">admin</span> / senha{' '}
            <span className="font-mono font-semibold text-base-800/70">admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
