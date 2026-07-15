'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { X, Factory } from 'lucide-react';
import { useSessao } from '@/hooks/useSessao';
import { LINKS_NAVEGACAO } from '@/lib/navegacao';

export function MobileSidebar({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const pathname = usePathname();
  const { pode } = useSessao();
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onFechar} />
      <div className="absolute inset-y-0 left-0 flex w-72 animate-in flex-col bg-sidebar">
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/15">
              <Factory size={18} />
            </span>
            <p className="text-sm font-bold text-white">ESTOQUE ERP</p>
          </div>
          <button onClick={onFechar} className="rounded-lg p-1.5 text-white/70 hover:bg-sidebar-hover">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {LINKS_NAVEGACAO.filter((l) => !l.permissao || pode(l.permissao)).map((link) => {
            const ativo = pathname?.startsWith(link.href);
            const Icone = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onFechar}
                className={clsx(
                  'mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  ativo ? 'bg-sidebar-active text-white' : 'text-white/65 hover:bg-sidebar-hover hover:text-white'
                )}
              >
                <Icone size={17} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
