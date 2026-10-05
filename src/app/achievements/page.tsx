"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import {
  Trophy,
  Power,
  Droplets,
  Workflow,
  ShieldCheck,
  Cpu,
  Zap,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface AchievementItem {
  code: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Power,
  Droplets,
  Workflow,
  ShieldCheck,
  Cpu,
  Zap,
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.achievements) {
          setAchievements(data.achievements);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-cyber-dark text-white flex flex-col bg-tech-grid">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-cyber-cyan" />
              <span>PENCAPAIAN (ACHIEVEMENTS)</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Buktikan keahlian Anda sebagai PC Master Builder profesional
            </p>
          </div>

          <div className="bg-cyber-card border border-cyber-border rounded-xl px-4 py-2 flex items-center gap-3">
            <span className="text-xs text-slate-400">Terbuka:</span>
            <span className="text-base font-mono font-bold text-cyber-cyan">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono text-slate-400">Memuat data pencapaian...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((item) => {
              const IconComp = ICON_MAP[item.icon] || Trophy;

              return (
                <div
                  key={item.code}
                  className={`p-5 rounded-xl border transition-all flex items-start gap-4 ${
                    item.unlocked
                      ? "bg-cyber-card border-cyber-cyan/50 shadow-lg shadow-cyber-cyan/10"
                      : "bg-slate-950/60 border-slate-800/80 opacity-70"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.unlocked
                        ? "bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan"
                        : "bg-slate-900 border border-slate-800 text-slate-600"
                    }`}
                  >
                    {item.unlocked ? (
                      <IconComp className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`text-sm font-bold ${
                          item.unlocked ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {item.title}
                      </h3>
                      {item.unlocked && (
                        <span className="text-[10px] font-mono text-cyber-green bg-cyber-green/10 px-2 py-0.5 rounded border border-cyber-green/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>TERBUKA</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-2">
                      {item.description}
                    </p>

                    {item.unlocked && item.unlockedAt && (
                      <p className="text-[10px] font-mono text-slate-500">
                        Diraih pada: {new Date(item.unlockedAt).toLocaleDateString("id-ID")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
