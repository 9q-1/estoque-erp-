'use client';

import { useEffect } from 'react';

// Registra o service worker do PWA assim que o app carrega no navegador.
// Não altera nenhuma parte visual: este componente não renderiza nada.
export function RegistroServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Evita registrar em ambiente de desenvolvimento (next dev), onde o cache
    // do service worker atrapalha o hot-reload.
    if (process.env.NODE_ENV !== 'production') return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Falha silenciosa: o app continua funcionando normalmente sem PWA offline.
    });
  }, []);

  return null;
}
