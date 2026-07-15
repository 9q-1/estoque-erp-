'use client';

import { useEffect, useRef, useState } from 'react';

interface ScannerCameraProps {
  aberto: boolean;
  onFechar: () => void;
  onDetectado: (codigo: string) => void;
}

// Suporte nativo via BarcodeDetector (Chrome/Edge/Android). Em navegadores sem suporte
// (ex: Safari/iOS mais antigo), mostramos um aviso claro em vez de travar a tela —
// o operador sempre pode digitar o código manualmente como alternativa.
export function ScannerCamera({ aberto, onFechar, onDetectado }: ScannerCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [suportado, setSuportado] = useState(true);
  const [erroCamera, setErroCamera] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;

    if (!('BarcodeDetector' in window)) {
      setSuportado(false);
      return;
    }

    let streamAtivo: MediaStream | null = null;
    let intervalo: ReturnType<typeof setInterval> | null = null;
    let cancelado = false;

    async function iniciar() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamAtivo = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // @ts-expect-error BarcodeDetector ainda não tem tipos oficiais no TS/DOM lib
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'],
        });

        intervalo = setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const codigos = await detector.detect(videoRef.current);
            if (codigos.length > 0) {
              onDetectado(codigos[0].rawValue);
            }
          } catch {
            // frame ilegível — tenta de novo no próximo intervalo
          }
        }, 400);
      } catch {
        setErroCamera('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
      }
    }

    iniciar();

    return () => {
      cancelado = true;
      if (intervalo) clearInterval(intervalo);
      streamAtivo?.getTracks().forEach((t) => t.stop());
    };
  }, [aberto, onDetectado]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-base-950/90 px-4">
      {suportado && !erroCamera && (
        <video ref={videoRef} className="max-h-[70vh] w-full max-w-md rounded-xl" muted playsInline />
      )}

      {!suportado && (
        <p className="max-w-sm text-center text-white">
          Este navegador não suporta leitura de código de barras pela câmera. Use um leitor USB ou
          digite o código manualmente.
        </p>
      )}

      {erroCamera && <p className="max-w-sm text-center text-white">{erroCamera}</p>}

      <button
        onClick={onFechar}
        className="mt-6 rounded-lg bg-surface px-6 py-3 text-sm font-semibold text-base-950"
      >
        Fechar
      </button>
    </div>
  );
}
