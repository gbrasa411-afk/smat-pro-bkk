'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Camera,
  Search,
  ArrowRight,
  Loader2,
  Scan,
  Keyboard,
} from 'lucide-react';
import PageHeader from '@/components/layout/page-header';

export default function ScanPage() {
  const router = useRouter();
  const [manualId, setManualId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState<'scan' | 'manual'>('manual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      router.push(`/inspection/${manualId.trim().toUpperCase()}`);
    }
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    // Simulate QR scan processing
    setTimeout(() => {
      setIsScanning(false);
      router.push('/inspection/LAB-FOG-001');
    }, 2000);
  };

  return (
    <div className="pb-4">
      <PageHeader title="Scan QR Code" subtitle="Arahkan kamera ke QR code aset" showBack />

      <div className="px-5 space-y-5">
        {/* Mode Toggle */}
        <div className="glass-card p-1 flex gap-1">
          <button
            onClick={() => setMode('scan')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              mode === 'scan'
                ? 'bg-[#00916E] text-white shadow-lg'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Scan className="w-4 h-4" />
            Scan QR
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              mode === 'manual'
                ? 'bg-[#00916E] text-white shadow-lg'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual
          </button>
        </div>

        {mode === 'scan' ? (
          <>
            {/* Scanner viewfinder */}
            <div className="relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00916E] rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00916E] rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00916E] rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00916E] rounded-br-lg" />
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#00916E] to-transparent animate-scan-line shadow-[0_0_8px_rgba(0,145,110,0.6)]" />
                </div>
              </div>

              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <QrCode className="w-12 h-12 text-gray-300" />
                  <p className="text-xs text-gray-400 text-center px-4">
                    Posisikan QR code dalam bingkai
                  </p>
                </div>
              )}

              {isScanning && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-[#00916E] animate-spin" />
                  <p className="text-xs text-[#00916E] font-medium">Memproses...</p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <label className="btn-primary flex items-center gap-2 cursor-pointer">
                <Camera className="w-5 h-5" />
                Ambil Foto QR Code
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileScan}
                  className="hidden"
                />
              </label>
            </div>
          </>
        ) : (
          <div className="glass-card p-5 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#00916E]/10 flex items-center justify-center mx-auto mb-2">
              <Search className="w-7 h-7 text-[#00916E]" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">Masukkan ID Manual</h3>
              <p className="text-sm text-gray-500 mt-1">
                Ketik ID peralatan yang tertera pada aset
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value.toUpperCase())}
                className="input-field text-center text-lg font-mono font-bold tracking-widest"
                placeholder="LAB-FOG-001"
                autoFocus
              />
              <button
                type="submit"
                disabled={!manualId.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <span>Mulai Inspeksi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Quick tips */}
        <div className="glass-card p-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tips</h4>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li>• Pastikan QR code dalam kondisi bersih dan tidak rusak</li>
            <li>• Arahkan kamera tegak lurus dengan jarak 15-30 cm</li>
            <li>• Gunakan input manual jika QR code tidak terbaca</li>
            <li>• ID aset: LAB-xxx untuk lab, MED-xxx untuk medis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
