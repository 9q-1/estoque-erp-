'use client';

import { useEffect, useRef, useState } from 'react';
import { X, FlashlightOff, Flashlight } from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';

interface ScannerCameraProps {
  aberto: boolean;
  onFechar: () => void;
  onDetectado: (codigo: string) => void;
}

// Leitor de código de barras / QR Code via câmera.
//
// Usamos a biblioteca ZXing (decodificação 100% em JavaScript, a partir dos
// frames de vídeo) em vez da API nativa `BarcodeDetector`, porque o Safari
// no iPhone — a principal plataforma deste PWA — nunca implementou essa API.
// Com ZXing o scanner funciona igualmente em Safari/iOS, Chrome, Android e
// desktop, sem depender de suporte específico do navegador.
const FORMATOS_SUPORTADOS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
];

export function ScannerCamera({ aberto, onFechar, onDetectado }: ScannerCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [erroCamera, setErroCamera] = useState<string | null>(null);
  const [lanternaDisponivel, setLanternaDisponivel] = useState(false);
  const [lanternaLigada, setLanternaLigada] = useState(false);

  useEffect(() => {
    if (!aberto) return;

    setErroCamera(null);
    setLanternaLigada(false);

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATOS_SUPORTADOS);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const leitor = new BrowserMultiFormatReader(hints);

    let cancelado = false;
    let jaDetectou = false;

    leitor
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current!,
        (resultado, erro) => {
          if (cancelado || jaDetectou) return;
          if (resultado) {
            jaDetectou = true;
            onDetectado(resultado.getText());
            return;
          }
          // NotFoundException é disparada a cada frame sem código legível —
          // é o caso normal enquanto o operador ainda está mirando a câmera,
          // então não deve ser tratada como erro real.
          if (erro && !(erro instanceof NotFoundException)) {
            // eslint-disable-next-line no-console
            console.warn('Falha ao decodificar frame do scanner:', erro);
          }
        }
      )
      .then((controls) => {
        if (cancelado) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setLanternaDisponivel(typeof controls.switchTorch === 'function');
      })
      .catch(() => {
        if (!cancelado) {
          setErroCamera('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
        }
      });

    return () => {
      cancelado = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [aberto, onDetectado]);

  async function alternarLanterna() {
    const controls = controlsRef.current;
    if (!controls?.switchTorch) return;
    try {
      await controls.switchTorch(!lanternaLigada);
      setLanternaLigada((v) => !v);
    } catch {
      // lanterna não suportada neste dispositivo/frame — ignora silenciosamente
    }
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-base-950/90 px-4">
      <div className="flex w-full max-w-md items-center justify-between pb-3">
        <p className="text-sm font-medium text-white/80">Aponte a câmera para o código</p>
        <div className="flex items-center gap-2">
          {lanternaDisponivel && (
            <button
              onClick={alternarLanterna}
              aria-label="Alternar lanterna"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            >
              {lanternaLigada ? <Flashlight size={17} /> : <FlashlightOff size={17} />}
            </button>
          )}
          <button
            onClick={onFechar}
            aria-label="Fechar leitor"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {!erroCamera && (
        <div className="relative w-full max-w-md overflow-hidden rounded-xl">
          <video ref={videoRef} className="max-h-[65vh] w-full" muted playsInline autoPlay />
          {/* Moldura de mira — puramente visual, ajuda o operador a enquadrar o código */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-1/2 w-4/5 rounded-lg border-2 border-white/70" />
          </div>
        </div>
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
