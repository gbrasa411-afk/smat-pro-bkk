'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, User, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Username atau password salah');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-5 py-8 min-h-dvh">
      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Logo section */}
      <div className="flex flex-col items-center mb-8 animate-fade-in-up">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-[#00916E]/15 rounded-3xl blur-2xl scale-150" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-[#00916E] to-[#00B386] rounded-3xl flex items-center justify-center shadow-lg shadow-[#00916E]/25 animate-pulse-glow">
            <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">
          SMAT <span className="text-[#00916E]">PRO</span>
        </h1>
        <p className="text-sm text-gray-500 font-medium tracking-wide text-center">
          Balai Kekarantinaan Kesehatan Kelas II Tembilahan
        </p>
      </div>

      {/* Login card */}
      <div
        className="w-full max-w-sm bg-white border border-gray-200/60 rounded-2xl shadow-xl shadow-gray-200/50 p-6 animate-fade-in-up"
        style={{ animationDelay: '0.1s' }}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-1">Selamat Datang</h2>
        <p className="text-sm text-gray-500 mb-6">
          Masuk untuk melanjutkan ke dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-11"
                placeholder="Masukkan username"
                autoComplete="username"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-11 pr-11"
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors touch-target"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>
      </div>

      <p
        className="mt-8 text-xs text-gray-400 animate-fade-in-up text-center"
        style={{ animationDelay: '0.2s' }}
      >
        © 2026 SMAT PRO — Kementerian Kesehatan RI
      </p>
    </div>
  );
}
