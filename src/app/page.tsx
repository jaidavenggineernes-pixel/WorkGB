"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sound } from "@/lib/sound/sound-engine";
import {
  Cpu,
  Play,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          if (data.stats?.totalBuilds > 0) {
            setHasSave(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleStartGame = () => {
    sound.playClick();
    if (currentUser) {
      router.push("/game");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070a12] text-white flex flex-col justify-between overflow-hidden bg-tech-grid selection:bg-cyber-cyan selection:text-black">
      {/* Ambient Radial Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/20 via-blue-700/15 to-purple-800/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-card border border-cyber-cyan/50 flex items-center justify-center text-cyber-cyan shadow-cyber-cyan">
            <Cpu className="w-6 h-6 animate-pulse-glow" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-widest text-white">
              WORK<span className="text-cyber-cyan">GB</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <Link
              href="/menu"
              onClick={() => sound.playClick()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 text-xs font-bold text-slate-200 transition-all"
            >
              <span>Menu Utama ({currentUser.username})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => sound.playClick()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => sound.playClick()}
                className="px-4 py-2 rounded-xl bg-cyber-cyan text-cyber-dark text-xs font-bold hover:bg-white transition-all shadow-cyber-cyan"
              >
                Daftar Akun
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan text-xs font-mono font-semibold mb-6 shadow-sm shadow-cyber-cyan/20">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>VIRTUAL WORKSPACE SIMULATOR v1.0 READY</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none text-white uppercase mb-4">
          WORK<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-blue-400 to-purple-400">GB</span>
        </h1>

        <p className="text-xl sm:text-2xl font-mono text-cyan-300/90 font-medium tracking-wide mb-6">
          PC Building Simulator
        </p>

        <p className="max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed mb-10">
          Mulai dari meja kerja kosong dengan komponen PC terpisah. Pasang motherboard, oles pasta termal ke CPU, pasang cooler, kunci RAM di slot DIMM, selipkan kartu grafis GPU, dan rapikan kabel daya hingga PC menyala dan boot ke BIOS!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleStartGame}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 text-cyber-dark font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-cyber-cyan"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>MULAI RAKIT PC</span>
          </button>

          {hasSave && (
            <Link
              href="/game"
              onClick={() => sound.playClick()}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyber-card border border-cyber-cyan/50 hover:bg-cyber-cyan/10 text-white font-bold text-sm transition-all shadow-lg"
            >
              <Zap className="w-4 h-4 text-cyber-green" />
              <span>LANJUTKAN RAKITAN</span>
            </Link>
          )}

          <button
            onClick={() => {
              sound.playClick();
              setShowAboutModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold text-sm transition-all"
          >
            <Info className="w-4 h-4" />
            <span>TENTANG GAME</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-4xl text-left">
          <div className="p-4 rounded-xl bg-cyber-card/60 border border-cyber-border backdrop-blur-sm hover:border-cyber-cyan/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-cyber-cyan/15 flex items-center justify-center text-cyber-cyan mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Meja Kerja Interaktif 2.5D</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visualisasi casing PC dengan slot komponen, bracket cooler, soket LGA/AM5, dan panel kaca.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-card/60 border border-cyber-border backdrop-blur-sm hover:border-cyber-cyan/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-cyber-green/15 flex items-center justify-center text-cyber-green mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Sistem Kompatibilitas Riil</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validasi ketat soket CPU, tipe RAM DDR4 vs DDR5, daya PSU (TDP), dan clearance GPU.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-card/60 border border-cyber-border backdrop-blur-sm hover:border-cyber-cyan/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Boot POST & Uji Benchmark</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulasi menyalakan PC dengan suara beep BIOS, kipas berputar, dan uji performa WorkOS 3DMark.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-20 border-t border-cyber-border/70 py-6 text-center text-xs text-slate-500 font-mono">
        <p>WORKGB — PC Building Simulator • Full-Stack Web Edition</p>
      </footer>

      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1424] border border-cyber-cyan/40 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-cyber-cyan" />
              <span>Tentang WorkGb</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-80 overflow-y-auto pr-1">
              <p>
                <strong>WorkGb</strong> adalah game simulasi perakitan komputer yang dirancang untuk
                memberikan pengalaman merakit komputer yang nyata, interaktif, dan mendidik.
              </p>
              <p>
                Pemain dapat memilih casing, motherboard, prosesor, RAM, pendingin CPU, media
                penyimpanan, power supply, dan kartu grafis. Game dilengkapi dengan aturan
                kompatibilitas hardware dunia nyata, efek suara prosedural Web Audio API, simulasi
                pasta termal, dan pengetesan boot sequence hingga BIOS dan sistem operasi.
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <p className="font-mono text-cyan-300 mb-1">Fitur Utama:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>20+ Tahapan perakitan komponen bertahap</li>
                  <li>30+ Komponen PC dengan spesifikasi detail</li>
                  <li>Audio synthesizer mekanis (snap, click, fan, POST beep)</li>
                  <li>Sistem penyimpanan cloud SQLite otomatis</li>
                  <li>Simulasi benchmark FPS & skor Cinebench</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowAboutModal(false);
                }}
                className="px-5 py-2 bg-cyber-cyan text-cyber-dark font-bold text-xs rounded-lg hover:bg-white transition-all shadow-cyber-cyan"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
