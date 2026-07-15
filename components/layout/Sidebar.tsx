'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Factory, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useSessao } from '@/hooks/useSessao';
import { ROTULO_PERFIL } from '@/types';
import { SECOES_NAVEGACAO } from '@/lib/navegacao';

export function Sidebar({
  colapsada,
  onToggle,
}: {
  colapsada: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { sessao, pode } = useSessao();

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 md:flex',
        colapsada ? 'w-sidebar-collapsed' : 'w-sidebar'
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/15">
          <Factory size={18} />
        </span>
        {!colapsada && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold tracking-tight text-white">ESTOQUE ERP</p>
            <p className="truncate text-[10px] uppercase tracking-wider text-white/50">Gestão de Inventário</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {SECOES_NAVEGACAO.map((secao) => {
          const linksVisiveis = secao.links.filter((l) => !l.permissao || pode(l.permissao));
          if (linksVisiveis.length === 0) return null;
          return (
            <div key={secao.titulo} className="mb-5">
              {!colapsada && (
                <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  {secao.titulo}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {linksVisiveis.map((link) => {
                  const ativo = pathname?.startsWith(link.href);
                  const Icone = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={colapsada ? link.label : undefined}
                      className={clsx(
                        'group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors',
                        ativo
                          ? 'bg-sidebar-active text-white'
                          : 'text-white/65 hover:bg-sidebar-hover hover:text-white'
                      )}
                    >
                      <span
                        className={clsx(
                          'flex h-5 w-5 shrink-0 items-center justify-center',
                          ativo ? 'text-white' : 'text-white/60'
                        )}
                      >
                        <Icone size={17} strokeWidth={ativo ? 2.4 : 2} />
                      </span>
                      {!colapsada && <span className="truncate">{link.label}</span>}
                      {ativo && !colapsada && (
                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        {!colapsada && sessao && (
          <div className="mb-2 rounded-lg bg-sidebar-hover px-3 py-2">
            <p className="truncate text-xs font-semibold text-white">{sessao.nome}</p>
            <p className="truncate text-[10px] text-white/50">{ROTULO_PERFIL[sessao.perfil]}</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-white/60 transition-colors hover:bg-sidebar-hover hover:text-white"
        >
          {colapsada ? <ChevronsRight size={16} /> : (
            <>
              <ChevronsLeft size={16} /> Recolher
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
