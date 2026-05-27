'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ArrowRight, Check, MapPin, ClipboardCheck, Camera, Send, CheckCircle2, Loader2 } from 'lucide-react';
import ChecklistItem from '@/components/inspection/checklist-item';
import SignaturePad from '@/components/inspection/signature-pad';
import PhotoCapture from '@/components/inspection/photo-capture';
import { getAssetById } from '@/actions/assets';
import { getChecklistForAsset, saveInspection } from '@/actions/inspections';

interface AssetData {
  id: string;
  name: string;
  categoryName: string | null;
  assetTypeName: string | null;
  location: string | null;
  plateNumber: string | null;
  lastStatus: string;
}

interface ChecklistResult {
  label: string;
  category: string;
  status: 'baik' | 'rusak' | 'na';
  notes?: string;
}

const STEP_LABELS = ['Info', 'Checklist', 'Bukti', 'Review'];

export default function InspectionWizardPage({ params }: { params: Promise<{ assetId: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [assetId, setAssetId] = useState('');
  const [step, setStep] = useState(0);
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [checklistTemplate, setChecklistTemplate] = useState<{ label: string; category: string }[]>([]);
  const [results, setResults] = useState<ChecklistResult[]>([]);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState('');
  const [signature, setSignature] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    params.then(async (p) => {
      setAssetId(p.assetId);
      try {
        const [assetData, checklist] = await Promise.all([
          getAssetById(p.assetId),
          getChecklistForAsset(p.assetId),
        ]);
        if (assetData) {
          setAsset(assetData);
        } else {
          setErrorMsg(`Aset "${p.assetId}" tidak ditemukan dalam database.`);
        }
        if (checklist && checklist.length > 0) {
          setChecklistTemplate(checklist);
          setResults(checklist.map((c) => ({ label: c.label, category: c.category, status: 'baik' as const })));
        } else if (assetData) {
          setErrorMsg('Checklist template belum tersedia untuk jenis aset ini.');
        }
      } catch (err) {
        setErrorMsg('Gagal memuat data aset. Periksa koneksi database.');
      }
      setLoading(false);
    });
  }, [params]);

  const totalSteps = STEP_LABELS.length;

  const handleChecklistChange = (index: number, status: 'baik' | 'rusak' | 'na', itemNotes?: string) => {
    setResults((prev) => prev.map((r, i) => (i === index ? { ...r, status, notes: itemNotes } : r)));
  };

  const canProceed = () => {
    if (step === 0) return !!asset && checklistTemplate.length > 0;
    if (step === 1) return results.every((r) => r.status);
    const evidenceStep = 2;
    if (step === evidenceStep) return true; // Photo and signature optional
    return true;
  };

  const calcStatus = () => {
    const rusak = results.filter((r) => r.status === 'rusak').length;
    const critical = results.filter(
      (r) => r.status === 'rusak' && ['Mesin', 'Rem', 'Kelistrikan', 'Keamanan', 'Komponen Utama', 'Power'].some((c) => r.category.includes(c))
    ).length;
    if (critical >= 2 || rusak >= 5) return 'Rusak Berat';
    if (rusak > 0) return 'Perlu Perbaikan';
    return 'Normal';
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await saveInspection({
      assetId,
      checklistResults: results,
      notes,
      photoBase64: photo,
      signatureBase64: signature,
      nextInspectionDate: nextDate,
    });
    setSubmitting(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } else {
      alert(result.error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-[#00916E] animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-bold text-sm">Memuat data aset...</p>
      </div>
    </div>
  );

  if (errorMsg) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-6">
      <div className="text-center glass-card p-8 max-w-sm">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Tidak Dapat Melanjutkan</h2>
        <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
        <button onClick={() => router.back()} className="btn-primary w-full">
          Kembali
        </button>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F7FA]">
      <div className="text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Inspeksi Berhasil!</h2>
        <p className="text-gray-500 font-medium">Laporan inspeksi telah disimpan</p>
        <div className={`mt-4 inline-block px-4 py-2 rounded-xl font-bold text-sm ${
          calcStatus() === 'Normal' ? 'bg-emerald-50 text-emerald-700' :
          calcStatus() === 'Perlu Perbaikan' ? 'bg-amber-50 text-amber-700' :
          'bg-red-50 text-red-700'
        }`}>{calcStatus()}</div>
      </div>
    </div>
  );

  const baikCount = results.filter((r) => r.status === 'baik').length;
  const rusakCount = results.filter((r) => r.status === 'rusak').length;
  const naCount = results.filter((r) => r.status === 'na').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-center gap-3 shrink-0 bg-white border-b border-gray-200/60">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-700 transition-all active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-black text-gray-900">Inspeksi Aset</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{asset?.id} • {STEP_LABELS[step]}</p>
        </div>
        <span className="text-xs font-bold text-[#00916E] bg-[#00916E]/10 px-3 py-1.5 rounded-lg">{step + 1}/{totalSteps}</span>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-white">
        <div className="flex gap-1.5">
          {STEP_LABELS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#00916E]' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {/* STEP 0: Asset Info */}
        {step === 0 && asset && (
          <div className="space-y-4 animate-fade-in-up pt-4">
            <div className="bg-gradient-to-br from-[#00916E]/10 to-[#00B386]/10 border border-[#00916E]/20 rounded-2xl p-5">
              <p className="text-2xl font-black text-gray-900 tracking-tight">{asset.id}</p>
              <p className="text-sm font-bold text-[#00916E] mt-1">{asset.name}</p>
            </div>
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00916E]/10 flex items-center justify-center"><ClipboardCheck size={20} className="text-[#00916E]" /></div>
                <div><p className="text-[10px] text-gray-400 font-bold uppercase">Kategori / Jenis</p><p className="text-sm font-bold text-gray-900">{asset.categoryName} • {asset.assetTypeName}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><MapPin size={20} className="text-emerald-600" /></div>
                <div><p className="text-[10px] text-gray-400 font-bold uppercase">Lokasi</p><p className="text-sm font-bold text-gray-900">{asset.location || '-'}</p></div>
              </div>
            </div>
            <div className="glass-card p-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Petugas Inspeksi</p>
              <p className="text-base font-black text-gray-900">{session?.user?.fullName}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Checklist Tersedia</p>
              <p className="text-sm font-bold text-gray-900">{checklistTemplate.length} item akan diperiksa</p>
            </div>
          </div>
        )}

        {/* STEP 1: Checklist */}
        {step === 1 && (
          <div className="space-y-3 pt-4">
            <div className="glass-card p-3 flex items-center justify-between sticky top-0 z-10 bg-white/90 backdrop-blur-xl">
              <p className="text-xs font-bold text-gray-500">Checklist Inspeksi</p>
              <div className="flex gap-2 text-[10px] font-bold">
                <span className="text-emerald-600">{baikCount} Baik</span>
                <span className="text-red-600">{rusakCount} Rusak</span>
                <span className="text-gray-400">{naCount} N/A</span>
              </div>
            </div>
            {checklistTemplate.map((item, i) => (
              <ChecklistItem key={i} label={item.label} category={item.category} index={i} value={results[i]} onChange={handleChecklistChange} />
            ))}
            <div className="glass-card p-4 mt-4">
              <label className="text-sm font-bold text-gray-700 block mb-2">Catatan Tambahan</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field text-sm" rows={3} placeholder="Catatan tambahan (opsional)..." />
            </div>
          </div>
        )}

        {/* STEP 2: Evidence */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up pt-4">
            <PhotoCapture onPhotoChange={setPhoto} value={photo} />
            <SignaturePad onSignatureChange={setSignature} value={signature} />
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in-up pt-4">
            <h3 className="text-base font-black text-gray-900 mb-3">Ringkasan Inspeksi</h3>
            <div className={`glass-card p-4 text-center ${calcStatus() === 'Normal' ? 'border-emerald-200' : calcStatus() === 'Perlu Perbaikan' ? 'border-amber-200' : 'border-red-200'} border-2`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Status Hasil Inspeksi</p>
              <p className={`text-xl font-black ${calcStatus() === 'Normal' ? 'text-emerald-600' : calcStatus() === 'Perlu Perbaikan' ? 'text-amber-600' : 'text-red-600'}`}>{calcStatus()}</p>
              <div className="flex justify-center gap-4 mt-3 text-xs font-bold">
                <span className="text-emerald-600">✓ {baikCount} Baik</span>
                <span className="text-red-600">✗ {rusakCount} Rusak</span>
                <span className="text-gray-400">— {naCount} N/A</span>
              </div>
            </div>
            <div className="glass-card p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Aset</span><span className="font-bold text-gray-900">{asset?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">ID</span><span className="font-bold text-gray-900 font-mono">{asset?.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Petugas</span><span className="font-bold text-gray-900">{session?.user?.fullName}</span></div>
            </div>
            {photo && <div className="glass-card p-1 overflow-hidden"><img src={photo} alt="Foto" className="w-full h-32 object-cover rounded-xl" /></div>}
            {signature && <div className="glass-card p-3"><p className="text-[10px] font-bold text-gray-400 mb-2">Tanda Tangan</p><img src={signature} alt="TTD" className="h-16 mx-auto" /></div>}
            <div className="glass-card p-4">
              <label className="text-sm font-bold text-gray-700 block mb-2">Jadwal Inspeksi Selanjutnya</label>
              <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} className="input-field" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5F7FA] via-[#F5F7FA] to-transparent pt-10 z-20">
        <div className="max-w-lg mx-auto">
          {step === totalSteps - 1 ? (
            <button onClick={handleSubmit} disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50">
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              {submitting ? 'Menyimpan...' : 'SUBMIT LAPORAN'}
            </button>
          ) : (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="w-full btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-30 disabled:cursor-not-allowed">
              Lanjutkan <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
