"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, Lock, User, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import { sound } from "@/lib/sound/sound-engine";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        sound.playError();
        setError(data.error || "Gagal masuk");
        return;
      }

      sound.playSnap();
      router.push("/menu");
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    sound.playClick();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDemo: true }),
      });

      if (!res.ok) {
        setError("Gagal masuk dengan akun demo.");
        return;
      }

      sound.playSnap();
      router.push("/menu");
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-white flex flex-col justify-center items-center p-4 bg-tech-grid relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-cyber-cyan/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Back to Home link */}
      <Link
        href="/"
        onClick={() => sound.playClick()}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="w-full max-w-md bg-cyber-card/90 border border-cyber-border rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-cyber-cyan/50 flex items-center justify-center text-cyber-cyan mx-auto mb-3 shadow-cyber-cyan">
            <Cpu className="w-7 h-7 animate-pulse-glow" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">
            MASUK <span className="text-cyber-cyan">WORKGB</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Simpan & lanjutkan progres perakitan PC Anda
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Username atau Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="nama_pengguna / email@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyber-cyan transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyber-cyan transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyber-cyan text-cyber-dark font-extrabold text-xs tracking-wider uppercase hover:bg-white transition-all shadow-cyber-cyan disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk ke Game"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-cyber-card px-3 text-[10px] font-mono text-slate-500 uppercase">
            Atau Uji Langsung
          </span>
        </div>

        {/* Quick Demo 1-Click Login */}
        <button
          onClick={handleQuickDemo}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-cyber-cardHover border border-cyber-cyan/40 hover:border-cyber-cyan text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyber-green" />
          <span>Masuk Instan Mode Demo (1-Click)</span>
        </button>

        {/* Link to Register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Belum memiliki akun?{" "}
          <Link
            href="/register"
            onClick={() => sound.playClick()}
            className="text-cyber-cyan font-bold hover:underline"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
