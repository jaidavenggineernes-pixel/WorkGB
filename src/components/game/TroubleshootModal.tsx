"use client";

import React from "react";
import { X, AlertOctagon, Wrench } from "lucide-react";
import { sound } from "@/lib/sound/sound-engine";

interface TroubleshootModalProps {
  missingItems: string[];
  onClose: () => void;
}

export default function TroubleshootModal({
  missingItems,
  onClose,
}: TroubleshootModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0e1424] border-2 border-rose-600 rounded-2xl shadow-[0_0_40px_rgba(244,63,94,0.3)] overflow-hidden">
        {/* Header */}
        <div className="bg-rose-950/60 border-b border-rose-800/80 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold text-sm tracking-wide uppercase text-white">
              PC GAGAL MENYALA / TIDAK DAPAT POST
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Komputer belum dapat dinyalakan karena sistem mendeteksi ada komponen wajib yang belum
            terpasang atau ada kesalahan konfigurasi perakitan:
          </p>

          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 max-h-60 overflow-y-auto space-y-2">
            {missingItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs text-rose-300 font-mono bg-rose-950/30 p-2 rounded border border-rose-900/50"
              >
                <span className="text-rose-500 font-bold">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="bg-cyber-cyan/5 border border-cyber-cyan/30 rounded-lg p-3 text-xs text-slate-300 flex items-start gap-2">
            <Wrench className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
            <span>
              Periksa checklist di panel kanan atau pilih komponen yang sesuai dari laci di bawah
              untuk melengkapi perakitan.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-cyber-cyan text-cyber-dark font-bold text-xs hover:bg-white transition-all shadow-cyber-cyan"
          >
            Lanjutkan Merakit PC
          </button>
        </div>
      </div>
    </div>
  );
}
