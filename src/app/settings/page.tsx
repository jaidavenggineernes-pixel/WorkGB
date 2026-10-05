"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { sound } from "@/lib/sound/sound-engine";
import {
  Settings,
  Volume2,
  Sliders,
  RotateCcw,
  LogOut,
  Save,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [soundVolume, setSoundVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(50);
  const [graphicsQuality, setGraphicsQuality] = useState("HIGH");
  const [animations, setAnimations] = useState(true);
  const [language, setLanguage] = useState("ID");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSoundVolume(val);
    sound.setVolume(val / 100);
    sound.playClick();
  };

  const handleSave = () => {
    sound.playSnap();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = async () => {
    if (confirm("PERINGATAN: Seluruh progres rakitan akan dihapus dari akun ini. Lanjutkan?")) {
      sound.playError();
      try {
        const res = await fetch("/api/builds");
        if (res.ok) {
          const data = await res.json();
          for (const b of data.builds) {
            await fetch(`/api/builds/${b.id}`, { method: "DELETE" });
          }
          alert("Data berhasil direset.");
          router.push("/menu");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = async () => {
    sound.playClick();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-white flex flex-col bg-tech-grid">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-cyber-cyan" />
              <span>PENGATURAN GAME</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Sesuaikan audio sintetis, performa visual, dan preferensi akun
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-cyber-green bg-cyber-green/10 px-3 py-1.5 rounded-lg border border-cyber-green/30 animate-pulse font-mono">
              <CheckCircle className="w-4 h-4" />
              <span>Pengaturan Tersimpan</span>
            </div>
          )}
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Audio Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyber-cyan">
              Audio & Suara Efek
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyber-cyan" />
                  <span>Volume Efek Suara (SFX Klik & Mekanikal)</span>
                </span>
                <span className="font-mono text-cyber-cyan font-bold">{soundVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={handleVolumeChange}
                className="w-full accent-cyber-cyan cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyber-green" />
                  <span>Volume Fan & Ambience Sistem</span>
                </span>
                <span className="font-mono text-cyber-green font-bold">{musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="w-full accent-cyber-green cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Graphics & Animation Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyber-cyan">
              Grafis & Animasi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                  Kualitas Efek Pencahayaan
                </label>
                <select
                  value={graphicsQuality}
                  onChange={(e) => setGraphicsQuality(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyber-cyan"
                >
                  <option value="ULTRA">Ultra (Neon Glow & Scanline Maksimal)</option>
                  <option value="HIGH">Tinggi (Default Optimal)</option>
                  <option value="MEDIUM">Sedang (Performa Ringan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                  Bahasa Antarmuka
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyber-cyan"
                >
                  <option value="ID">Bahasa Indonesia</option>
                  <option value="EN">English</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-300">
                Aktifkan Animasi Putaran Kipas & RGB Real-Time
              </span>
              <button
                onClick={() => setAnimations(!animations)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  animations ? "bg-cyber-cyan border-cyber-cyan" : "bg-slate-800 border-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    animations ? "translate-x-6 bg-cyber-dark" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Account Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyber-cyan">
              Manajemen Data Akun
            </h3>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                onClick={handleResetData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-950 border border-rose-800 text-rose-300 text-xs font-semibold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Seluruh Data Rakitan</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyber-cyan text-cyber-dark font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-cyber-cyan"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
