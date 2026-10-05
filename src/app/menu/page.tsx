"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { sound } from "@/lib/sound/sound-engine";
import {
  Play,
  FolderKanban,
  PackageOpen,
  Trophy,
  Settings,
  LogOut,
  Plus,
  Cpu,
  ArrowRight,
} from "lucide-react";

interface BuildItem {
  id: string;
  name: string;
  status: string;
  progress: number;
  score?: string;
  updatedAt: string;
}

export default function MainMenuPage() {
  const router = useRouter();
  const [builds, setBuilds] = useState<BuildItem[]>([]);
  const [latestBuild, setLatestBuild] = useState<BuildItem | null>(null);
  const [showNewBuildModal, setShowNewBuildModal] = useState(false);
  const [newBuildName, setNewBuildName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetch("/api/builds")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.builds) {
          setBuilds(data.builds);
          if (data.builds.length > 0) {
            setLatestBuild(data.builds[0]);
          }
        }
      })
      .catch(() => {});
  }, [router]);

  const handleCreateNewBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsCreating(true);

    try {
      const res = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBuildName.trim() || undefined }),
      });

      if (res.ok) {
        const data = await res.json();
        sound.playSnap();
        router.push(`/game/${data.build.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
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

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center items-center">
        <div className="w-full max-w-xl bg-cyber-card/90 border border-cyber-border rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-cyber-cyan/50 flex items-center justify-center text-cyber-cyan mx-auto mb-3 shadow-cyber-cyan">
              <Cpu className="w-9 h-9 animate-pulse-glow" />
            </div>
            <h1 className="text-3xl font-black tracking-widest text-white">
              WORK<span className="text-cyber-cyan">GB</span>
            </h1>
            <p className="text-xs font-mono text-cyan-300 uppercase tracking-widest mt-1">
              MENU UTAMA
            </p>
          </div>

          {/* Quick Continue / Start Action Hero */}
          <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            {latestBuild ? (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Progres Perakitan Terakhir:</span>
                  <span className="font-mono text-cyber-cyan font-bold">
                    {latestBuild.progress}%
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-3">{latestBuild.name}</h3>

                <Link
                  href={`/game/${latestBuild.id}`}
                  onClick={() => sound.playClick()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cyber-cyan text-cyber-dark font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-cyber-cyan"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>LANJUTKAN RAKITAN INI</span>
                </Link>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-slate-400 mb-3">
                  Belum ada progres perakitan yang tersimpan.
                </p>
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowNewBuildModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cyber-cyan text-cyber-dark font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-cyber-cyan"
                >
                  <Plus className="w-4 h-4" />
                  <span>START NEW BUILD</span>
                </button>
              </div>
            )}
          </div>

          {/* Menu Navigation Buttons */}
          <div className="space-y-2.5">
            {latestBuild && (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowNewBuildModal(true);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-cyber-cardHover hover:bg-slate-800 border border-cyber-border hover:border-cyber-cyan/40 text-xs font-bold transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4 text-cyber-cyan" />
                  <span>Mulai Rakitan Baru (New Game)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
              </button>
            )}

            <Link
              href="/builds"
              onClick={() => sound.playClick()}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-cyber-cardHover hover:bg-slate-800 border border-cyber-border hover:border-cyber-cyan/40 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="w-4 h-4 text-cyber-green" />
                <span>Daftar PC Builds ({builds.length})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
            </Link>

            <Link
              href="/inventory"
              onClick={() => sound.playClick()}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-cyber-cardHover hover:bg-slate-800 border border-cyber-border hover:border-cyber-cyan/40 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-3">
                <PackageOpen className="w-4 h-4 text-amber-400" />
                <span>Katalog Komponen (Inventory)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
            </Link>

            <Link
              href="/achievements"
              onClick={() => sound.playClick()}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-cyber-cardHover hover:bg-slate-800 border border-cyber-border hover:border-cyber-cyan/40 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span>Pencapaian (Achievements)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
            </Link>

            <Link
              href="/settings"
              onClick={() => sound.playClick()}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-cyber-cardHover hover:bg-slate-800 border border-cyber-border hover:border-cyber-cyan/40 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Pengaturan Game</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-300 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Keluar Akun (Logout)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        </div>
      </main>

      {/* New Build Modal */}
      {showNewBuildModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1424] border border-cyber-cyan/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Mulai Rakitan PC Baru</h3>
            <p className="text-xs text-slate-400 mb-4">
              Beri nama rancangan komputer Anda untuk memulai dari meja kerja kosong.
            </p>

            <form onSubmit={handleCreateNewBuild} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Nama PC Build
                </label>
                <input
                  type="text"
                  value={newBuildName}
                  onChange={(e) => setNewBuildName(e.target.value)}
                  placeholder="Contoh: Gaming Beast RTX 4090 / Sleeper PC"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyber-cyan"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowNewBuildModal(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg bg-cyber-cyan text-cyber-dark font-bold text-xs hover:bg-white transition-all shadow-cyber-cyan"
                >
                  {isCreating ? "Menyiapkan..." : "Mulai Rakit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
