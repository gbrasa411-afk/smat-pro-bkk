'use client';

import { useState } from 'react';
import { Check, X, Minus } from 'lucide-react';

interface ChecklistItemProps {
  label: string;
  category: string;
  index: number;
  value?: { status: 'baik' | 'rusak' | 'na'; notes?: string };
  onChange: (index: number, status: 'baik' | 'rusak' | 'na', notes?: string) => void;
}

export default function ChecklistItem({ label, category, index, value, onChange }: ChecklistItemProps) {
  const [notes, setNotes] = useState(value?.notes || '');
  const status = value?.status;

  return (
    <div className="glass-card p-4 space-y-3 animate-fade-in-up" style={{ animationDelay: `${index * 30}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-[#00916E] uppercase tracking-wider mb-1">{category}</p>
          <p className="text-sm font-medium text-gray-800 leading-snug">{label}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(index, 'baik', '')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            status === 'baik'
              ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300 shadow-sm'
              : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Check size={18} />
          Baik
        </button>

        <button
          type="button"
          onClick={() => onChange(index, 'rusak')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            status === 'rusak'
              ? 'bg-red-50 text-red-700 border-2 border-red-300 shadow-sm'
              : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <X size={18} />
          Rusak
        </button>

        <button
          type="button"
          onClick={() => onChange(index, 'na', '')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            status === 'na'
              ? 'bg-gray-200 text-gray-700 border-2 border-gray-400'
              : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Minus size={18} />
          N/A
        </button>
      </div>

      {status === 'rusak' && (
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            onChange(index, 'rusak', e.target.value);
          }}
          className="input-field text-sm mt-2"
          rows={2}
          placeholder="Jelaskan kerusakan yang ditemukan..."
        />
      )}
    </div>
  );
}
