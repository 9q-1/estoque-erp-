'use client';

import { Factory } from 'lucide-react';
import { APP_NOME } from '@/lib/appInfo';

// Tela de carregamento exibida por uma fração de segundo antes da tela
// institucional de boas-vindas. Reaproveita a identidade visual do ícone do
// app (quadrado verde com o ícone de fábrica) para reforçar a marca também
// dentro do próprio site, além do splash nativo do PWA no iPhone.
export function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-base-50">
      <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-sidebar-active to-sidebar text-white shadow-elevated">
        <Factory size={34} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg font-bold tracking-tight text-base-950">{APP_NOME}</p>
        <div className="flex items-center gap-1.5 text-xs text-base-800/50">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-action" />
          Carregando o sistema...
        </div>
      </div>
    </div>
  );
}
