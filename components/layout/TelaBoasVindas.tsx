'use client';

import Link from 'next/link';
import { Factory, ArrowRight, LogIn } from 'lucide-react';
import { useSessao } from '@/hooks/useSessao';
import { SECOES_NAVEGACAO } from '@/lib/navegacao';
import { APP_NOME, APP_VERSAO, APP_DESCRICAO, EMPRESA } from '@/lib/appInfo';

// Tela institucional exibida após o Splash, antes do usuário entrar no
// sistema propriamente dito. Mostra a identidade do produto (nome, versão,
// descrição, empresa) e, em destaque, todas as abas existentes para acesso
// rápido — clicar em qualquer uma delas leva diretamente à rota (o
// middleware cuida de pedir login quando necessário).
export function TelaBoasVindas() {
  const { sessao, carregando, pode } = useSessao();

  return (
    <div className="min-h-screen bg-base-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-10 md:px-8 md:py-14">
        {/* Cabeçalho institucional */}
        <header className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sidebar-active to-sidebar text-white shadow-elevated">
            <Factory size={28} />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-action">Bem-vindo</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-base-950 md:text-3xl">{APP_NOME}</h1>
          <p className="mt-1 text-xs font-medium text-base-800/50">Versão {APP_VERSAO}</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-base-800/70 md:text-base">
            {APP_DESCRICAO}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {carregando ? (
              <div className="skeleton h-12 w-40" />
            ) : sessao ? (
              <Link
                href="/dashboard"
                className="flex h-12 items-center gap-2 rounded-lg bg-action px-6 text-sm font-semibold text-action-contrast transition-all hover:bg-action-hover hover:shadow-glow active:scale-[0.98]"
              >
                Continuar como {sessao.nome.split(' ')[0]} <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex h-12 items-center gap-2 rounded-lg bg-action px-6 text-sm font-semibold text-action-contrast transition-all hover:bg-action-hover hover:shadow-glow active:scale-[0.98]"
              >
                <LogIn size={16} /> Entrar no sistema
              </Link>
            )}
          </div>
        </header>

        {/* Informações da empresa */}
        <div className="mx-auto mt-8 flex items-center gap-2 rounded-full border border-base-200 bg-surface px-4 py-2 text-xs text-base-800/60 shadow-panel">
          <span className="h-1.5 w-1.5 rounded-full bg-action" />
          {EMPRESA.nome} · {EMPRESA.descricao} · © {EMPRESA.ano}
        </div>

        {/* Acesso rápido às abas existentes */}
        <section className="mt-12">
          <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-base-800/50">
            Acesso rápido
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {SECOES_NAVEGACAO.flatMap((secao) => secao.links)
              .filter((link) => !link.permissao || carregando || pode(link.permissao))
              .map((link) => {
                const Icone = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex flex-col gap-2.5 rounded-xl border border-base-200 bg-surface p-4 shadow-panel transition-all hover:-translate-y-0.5 hover:border-action/30 hover:shadow-elevated"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-action-soft text-action">
                      <Icone size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-base-950">{link.label}</p>
                      <p className="mt-0.5 text-xs leading-snug text-base-800/55">{link.descricao}</p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>

        <footer className="mt-auto pt-12 text-center text-[11px] text-base-800/40">
          {APP_NOME} · {EMPRESA.nome} — todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}
