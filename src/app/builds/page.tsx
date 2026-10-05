"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { sound } from "@/lib/sound/sound-engine";
import {
  FolderKanban,
  Plus,
  Play,
  Trash2,
  Layers,
} from "lucide-react";

interface BuildRecord {
  id: string;
  name: string;
  status: string;
  progress: number;
  score?: string;
  buildTimeSeconds: number;
  updatedAt: string;
}

export default function BuildsPage() {
  const [builds, setBuilds] = useState<BuildRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBuildName, setNewBuildName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchBuilds = async () => {
    try {
      const res = await fetch("/api/builds");
      if (res.ok) {
        const data = await res.json();
        setBuilds(data.builds || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
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
        sound.playSnap();
        setNewBuildName("");
        setShowModal(false);
        fetchBuilds();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus build "${name}"?`)) return;
    sound.playScrew();

    try {
      await fetch(`/api/builds/${id}`, { method: "DELETE" });
      setBuilds((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-white flex flex-col bg-tech-grid">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <FolderKanban className="w-6 h-6 text-cyber-cyan" />
              <span>DAFTAR PC BUILDS SAYA</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Kelola berbagai proyek rakitan komputer Anda (Gaming, Office, Workstation)
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-cyan text-cyber-dark font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-cyber-cyan"
          >
            <Plus className="w-4 h-4" />
            <span>BUAT BUILD BARU</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono text-slate-400">Memuat daftar rakitan...</p>
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-20 bg-cyber-card/60 border border-cyber-border rounded-2xl p-8 max-w-md mx-auto">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300 mb-1">Belum Ada Proyek Rakitan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Mulai buat PC impian pertamamu dengan menekan tombol di bawah.
            </p>
            <button
              onClick={() => {
                sound.playClick();
                setShowModal(true);
              }}
              className="px-5 py-2.5 rounded-lg bg-cyber-cyan text-cyber-dark font-bold text-xs"
            >
              Mulai Rakit PC Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {builds.map((b) => (
              <div
                key={b.id}
                className="bg-cyber-card border border-cyber-border rounded-xl p-5 hover:border-cyber-cyan/50 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${
                        b.status === "COMPLETED"
                          ? "bg-cyber-green/10 text-cyber-green border-cyber-green/30"
                          : "bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30"
                      }`}
                    >
                      {b.status === "COMPLETED" ? "SELESAI" : "PROSES"}
                    </span>

                    {b.score && (
                      <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        SKOR: {b.score}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{b.name}</h3>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Progres Perakitan</span>
                      <span className="font-mono text-cyber-cyan font-bold">{b.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyber-blue to-cyber-cyan rounded-full"
                        style={{ width: `${b.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleDelete(b.id, b.name)}
                    className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Hapus Proyek"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/game/${b.id}`}
                    onClick={() => sound.playClick()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyber-cardHover hover:bg-cyber-cyan hover:text-cyber-dark text-slate-200 border border-cyber-border text-xs font-bold transition-all"
                  >
                    <span>Masuk Simulator</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1424] border border-cyber-cyan/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Tambah Proyek PC Baru</h3>
            <p className="text-xs text-slate-400 mb-4">
              Beri nama rancangan komputer baru yang ingin Anda simulasikan.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Nama PC Build
                </label>
                <input
                  type="text"
                  value={newBuildName}
                  onChange={(e) => setNewBuildName(e.target.value)}
                  placeholder="Contoh: Mid-Range Gaming 1440p"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyber-cyan"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowModal(false);
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
                  {isCreating ? "Menyiapkan..." : "Buat Build"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
