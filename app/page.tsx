'use client';

import { useEffect, useState } from 'react';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { TelaBoasVindas } from '@/components/layout/TelaBoasVindas';

// Fluxo inicial do app: Splash (carregamento rápido, com a identidade visual
// do sistema) seguido pela tela institucional de boas-vindas, que apresenta
// o sistema e dá acesso rápido a todas as abas existentes.
export default function PaginaInicial() {
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const tempo = setTimeout(() => setCarregando(false), 900);
    return () => clearTimeout(tempo);
  }, []);

  if (carregando) return <SplashScreen />;
  return <TelaBoasVindas />;
}
