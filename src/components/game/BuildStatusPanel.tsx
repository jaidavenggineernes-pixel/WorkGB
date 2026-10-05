"use client";

import React from "react";
import { BuildState, SlotKey } from "@/lib/game-engine/types";
import { getComponentById } from "@/lib/game-engine/components-catalog";
import { validateFullBuild } from "@/lib/game-engine/compatibility";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Zap,
  Save,
  Clock,
} from "lucide-react";
import { sound } from "@/lib/sound/sound-engine";

interface BuildStatusPanelProps {
  buildState: BuildState;
  onSelectSlot: (slot: SlotKey) => void;
  onSaveBuild: () => void;
  isSaving: boolean;
}

export default function BuildStatusPanel({
  buildState,
  onSelectSlot,
  onSaveBuild,
  isSaving,
}: BuildStatusPanelProps) {
  const compValidation = validateFullBuild(buildState.installedParts);
  const psu = buildState.installedParts["psu"]
    ? getComponentById(buildState.installedParts["psu"])
    : null;

  const checklistItems = [
    {
      slot: "case" as SlotKey,
      label: "Casing PC",
      installed: !!buildState.installedParts["case"],
    },
    {
      slot: "motherboard" as SlotKey,
      label: "Motherboard",
      installed: !!buildState.installedParts["motherboard"],
    },
    {
      slot: "cpu" as SlotKey,
      label: "Prosesor (CPU)",
      installed: !!buildState.installedParts["cpu"],
    },
    {
      slot: "cpu" as SlotKey,
      label: "Thermal Paste",
      installed: buildState.thermalPasteApplied,
    },
    {
      slot: "cooler" as SlotKey,
      label: "CPU Cooler",
      installed: !!buildState.installedParts["cooler"],
    },
    {
      slot: "ram_1" as SlotKey,
      label: "RAM DIMM 1",
      installed: !!buildState.installedParts["ram_1"],
    },
    {
      slot: "ram_2" as SlotKey,
      label: "RAM DIMM 2",
      installed: !!buildState.installedParts["ram_2"],
    },
    {
      slot: "storage_m2" as SlotKey,
      label: "M.2 NVMe SSD",
      installed: !!buildState.installedParts["storage_m2"],
    },
    {
      slot: "storage_sata" as SlotKey,
      label: "Drive Bay (SATA/HDD)",
      installed: !!buildState.installedParts["storage_sata"],
    },
    {
      slot: "psu" as SlotKey,
      label: "Power Supply",
      installed: !!buildState.installedParts["psu"],
    },
    {
      slot: "gpu" as SlotKey,
      label: "Kartu Grafis (GPU)",
      installed: !!buildState.installedParts["gpu"],
    },
    {
      slot: "psu" as SlotKey,
      label: "Kabel PSU Terpasang",
      installed: buildState.cablesConnected,
    },
    {
      slot: "case" as SlotKey,
      label: "Panel Kaca Tertutup",
      installed: buildState.caseClosed,
    },
  ];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full bg-cyber-card border border-cyber-border rounded-xl p-4 flex flex-col gap-4 shadow-xl">
      {/* Top Header & Save Button */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            STATUS PERAKITAN
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
            <Clock className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Waktu: {formatTime(buildState.buildTimeSeconds)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onSaveBuild();
          }}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyber-cardHover hover:bg-cyber-cyan hover:text-cyber-dark text-slate-300 border border-cyber-border transition-all disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Menyimpan..." : "Simpan Progres"}</span>
        </button>
      </div>

      {/* Progress Bar & Percentage */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-slate-300">Progress Selesai</span>
          <span className="text-cyber-cyan font-mono text-sm">{buildState.progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyber-blue via-cyber-cyan to-cyber-green transition-all duration-300 rounded-full"
            style={{ width: `${buildState.progress}%` }}
          />
        </div>
      </div>

      {/* Power Wattage Budget */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <p className="text-[11px] text-slate-400 leading-none">Estimasi Konsumsi Daya</p>
            <p className="text-xs font-bold text-white font-mono mt-0.5">
              ~{compValidation.totalWattage}W /{" "}
              <span className="text-slate-400">{psu ? `${psu.psuWattage}W` : "Belum ada PSU"}</span>
            </p>
          </div>
        </div>
        <div>
          {psu ? (
            psu.psuWattage && psu.psuWattage >= compValidation.totalWattage ? (
              <span className="text-[10px] font-mono text-cyber-green bg-cyber-green/10 px-2 py-0.5 rounded border border-cyber-green/30">
                Daya Aman
              </span>
            ) : (
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                Daya Kurang!
              </span>
            )
          ) : (
            <span className="text-[10px] text-slate-500 font-mono">Perlu PSU</span>
          )}
        </div>
      </div>

      {/* Assembly Checklist */}
      <div>
        <h4 className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2">
          CHECKLIST KOMPONEN
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                sound.playClick();
                onSelectSlot(item.slot);
              }}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition-all border ${
                item.installed
                  ? "bg-cyber-green/5 border-cyber-green/20 text-slate-200"
                  : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {item.installed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                )}
                <span className="truncate text-[11px]">{item.label}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 ml-1">
                {item.installed ? "OK" : "BELUM"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Warnings or Errors */}
      {compValidation.errors.length > 0 && (
        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Peringatan Kompatibilitas ({compValidation.errors.length})</span>
          </div>
          <ul className="space-y-1 text-[11px] text-rose-200/90 list-disc list-inside">
            {compValidation.errors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
