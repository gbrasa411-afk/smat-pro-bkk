'use client';

import { useRef, useEffect, useCallback } from 'react';
import SignaturePadLib from 'signature_pad';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string) => void;
  value?: string;
}

export default function SignaturePad({ onSignatureChange, value }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(ratio, ratio);
    if (padRef.current) padRef.current.clear();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    padRef.current = new SignaturePadLib(canvas, {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      penColor: '#00916E',
      minWidth: 1.5,
      maxWidth: 3,
    });

    padRef.current.addEventListener('endStroke', () => {
      if (padRef.current && !padRef.current.isEmpty()) {
        onSignatureChange(padRef.current.toDataURL('image/png'));
      }
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [onSignatureChange, resizeCanvas]);

  const clear = () => {
    padRef.current?.clear();
    onSignatureChange('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700">
          Tanda Tangan <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all active:scale-95"
        >
          <Eraser size={14} /> Hapus
        </button>
      </div>
      <div className="glass-card p-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl touch-none"
          style={{
            height: '160px',
            border: '2px dashed #E2E8F0',
            borderRadius: '0.75rem',
            backgroundColor: '#FAFBFC',
          }}
        />
      </div>
      <p className="text-[10px] text-gray-400 text-center">Gunakan jari atau stylus untuk menandatangani</p>
    </div>
  );
}
