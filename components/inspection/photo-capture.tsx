'use client';

import { useRef, useState } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoChange: (dataUrl: string) => void;
  value?: string;
}

export default function PhotoCapture({ onPhotoChange, value }: PhotoCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value || '');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = document.createElement('img');

    img.onload = () => {
      const maxWidth = 1200;
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setPreview(dataUrl);
      onPhotoChange(dataUrl);
    };

    img.src = URL.createObjectURL(file);
  };

  const clear = () => {
    setPreview('');
    onPhotoChange('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700">
          Foto Inspeksi <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        {preview && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all active:scale-95"
          >
            <RotateCcw size={14} /> Ulang
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

      {preview ? (
        <div className="glass-card p-1 overflow-hidden relative">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-all active:scale-95"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-48 glass-card flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#00916E] hover:border-[#00916E]/30 transition-all active:scale-[0.98] cursor-pointer border-2 border-dashed border-gray-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#00916E]/10 flex items-center justify-center">
            <Camera size={28} className="text-[#00916E]" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-500">Ambil Foto</p>
            <p className="text-[10px] text-gray-400 mt-1">Ketuk untuk membuka kamera</p>
          </div>
        </button>
      )}
    </div>
  );
}
