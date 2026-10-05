"use client";

import React, { useState, useEffect } from "react";
import {
  ComponentCategory,
  PCComponent,
  SlotKey,
  BuildState,
} from "@/lib/game-engine/types";
import {
  COMPONENTS_CATALOG,
  getComponentById,
} from "@/lib/game-engine/components-catalog";
import { checkComponentCompatibility } from "@/lib/game-engine/compatibility";
import { sound } from "@/lib/sound/sound-engine";
import {
  Layers,
  Cpu,
  Fan,
  HardDrive,
  Zap,
  Box,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";

interface PartsDrawerProps {
  buildState: BuildState;
  activeSlot: SlotKey | null;
  onInstallComponent: (slot: SlotKey, component: PCComponent) => void;
  onRemoveComponent: (slot: SlotKey) => void;
  onIncompatibleAttempt: (reason: string) => void;
}

const CATEGORIES: { key: ComponentCategory; label: string; icon: React.ElementType }[] = [
  { key: "CASE", label: "Casing", icon: Box },
  { key: "MOTHERBOARD", label: "Motherboard", icon: Layers },
  { key: "CPU", label: "Prosesor", icon: Cpu },
  { key: "COOLER", label: "Cooler", icon: Fan },
  { key: "RAM", label: "RAM", icon: SlidersHorizontal },
  { key: "STORAGE", label: "Storage", icon: HardDrive },
  { key: "GPU", label: "Kartu Grafis", icon: Layers },
  { key: "PSU", label: "Power Supply", icon: Zap },
  { key: "FAN", label: "Kipas Fan", icon: Fan },
];

export default function PartsDrawer({
  buildState,
  activeSlot,
  onInstallComponent,
  onRemoveComponent,
  onIncompatibleAttempt,
}: PartsDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>("CASE");
  const [subFilter, setSubFilter] = useState<string>("ALL");

  // Sync selectedCategory when player clicks an activeSlot in workbench
  useEffect(() => {
    if (!activeSlot) return;
    if (activeSlot === "case") setSelectedCategory("CASE");
    else if (activeSlot === "motherboard") setSelectedCategory("MOTHERBOARD");
    else if (activeSlot === "cpu") setSelectedCategory("CPU");
    else if (activeSlot === "cooler") setSelectedCategory("COOLER");
    else if (activeSlot === "ram_1" || activeSlot === "ram_2") setSelectedCategory("RAM");
    else if (activeSlot === "storage_m2" || activeSlot === "storage_sata") setSelectedCategory("STORAGE");
    else if (activeSlot === "gpu") setSelectedCategory("GPU");
    else if (activeSlot === "psu") setSelectedCategory("PSU");
    else if (activeSlot === "fan_front" || activeSlot === "fan_rear") setSelectedCategory("FAN");
  }, [activeSlot]);

  // Reset subfilter when category changes
  useEffect(() => {
    setSubFilter("ALL");
  }, [selectedCategory]);

  const resolveTargetSlot = (comp: PCComponent): SlotKey => {
    if (comp.category === "CASE") return "case";
    if (comp.category === "MOTHERBOARD") return "motherboard";
    if (comp.category === "CPU") return "cpu";
    if (comp.category === "COOLER") return "cooler";
    if (comp.category === "GPU") return "gpu";
    if (comp.category === "PSU") return "psu";

    if (comp.category === "RAM") {
      if (activeSlot === "ram_2") return "ram_2";
      if (activeSlot === "ram_1") return "ram_1";
      if (buildState.installedParts["ram_1"] && !buildState.installedParts["ram_2"]) {
        return "ram_2";
      }
      return "ram_1";
    }

    if (comp.category === "STORAGE") {
      if (activeSlot === "storage_sata") return "storage_sata";
      if (activeSlot === "storage_m2") return "storage_m2";
      if (comp.storageType === "NVMe M.2") return "storage_m2";
      return "storage_sata";
    }

    if (comp.category === "FAN") {
      if (activeSlot === "fan_rear") return "fan_rear";
      if (activeSlot === "fan_front") return "fan_front";
      if (buildState.installedParts["fan_front"] && !buildState.installedParts["fan_rear"]) {
        return "fan_rear";
      }
      return "fan_front";
    }

    return "case";
  };

  const currentGeneralSlot = (() => {
    switch (selectedCategory) {
      case "CASE": return "case";
      case "MOTHERBOARD": return "motherboard";
      case "CPU": return "cpu";
      case "COOLER": return "cooler";
      case "RAM": return activeSlot === "ram_2" ? "ram_2" : "ram_1";
      case "STORAGE": return activeSlot === "storage_sata" ? "storage_sata" : "storage_m2";
      case "GPU": return "gpu";
      case "PSU": return "psu";
      case "FAN": return activeSlot === "fan_rear" ? "fan_rear" : "fan_front";
    }
  })();

  const rawItems = COMPONENTS_CATALOG.filter((c) => c.category === selectedCategory);

  // Sub-filtering (e.g. AM4 vs AM5 vs LGA1700, or DDR4 vs DDR5)
  const items = rawItems.filter((item) => {
    if (subFilter === "ALL") return true;
    if (item.socket === subFilter) return true;
    if (item.memoryType === subFilter) return true;
    if (item.formFactor === subFilter) return true;
    if (item.storageType === subFilter) return true;
    return true;
  });

  const currentlyInstalledId = buildState.installedParts[currentGeneralSlot];

  const handleInstallClick = (comp: PCComponent) => {
    const targetSlot = resolveTargetSlot(comp);

    const check = checkComponentCompatibility(targetSlot, comp, buildState.installedParts);
    if (!check.compatible) {
      sound.playError();
      onIncompatibleAttempt(check.error || "Komponen tidak kompatibel dengan rakitan saat ini!");
      return;
    }

    if (comp.category === "RAM") {
      sound.playRamClick();
    } else if (comp.category === "CPU") {
      sound.playSnap();
    } else {
      sound.playScrew();
    }

    onInstallComponent(targetSlot, comp);
  };

  return (
    <div className="w-full bg-cyber-card border border-cyber-border rounded-xl shadow-xl p-4 flex flex-col gap-4">
      {/* Category Horizontal Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-cyber-border pb-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          const count = COMPONENTS_CATALOG.filter((c) => c.category === cat.key).length;

          return (
            <button
              key={cat.key}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat.key);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cyber-cyan text-cyber-dark font-bold shadow-cyber-cyan"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? "bg-black/20 text-cyber-dark" : "bg-slate-800 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Target Slot Info & Quick Sub-filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Target Slot:</span>
          <span className="font-mono font-bold text-cyber-cyan uppercase bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
            {currentGeneralSlot}
          </span>
          {currentlyInstalledId && (
            <span className="text-slate-400 text-[11px] truncate max-w-xs">
              (Terpasang: {getComponentById(currentlyInstalledId)?.name})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentlyInstalledId && (
            <button
              onClick={() => {
                sound.playScrew();
                onRemoveComponent(currentGeneralSlot);
              }}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Lepas Komponen ({currentGeneralSlot})</span>
            </button>
          )}
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pr-1">
        {items.map((comp) => {
          const targetSlot = resolveTargetSlot(comp);
          const isInstalledInTarget = buildState.installedParts[targetSlot] === comp.id;

          const compCheck = checkComponentCompatibility(
            targetSlot,
            comp,
            buildState.installedParts
          );

          return (
            <div
              key={comp.id}
              className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                isInstalledInTarget
                  ? "bg-cyber-cyan/10 border-cyber-cyan shadow-sm shadow-cyber-cyan/20"
                  : !compCheck.compatible
                  ? "bg-slate-950/60 border-slate-800/80 opacity-80 hover:opacity-100"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                    {comp.brand}
                  </span>
                  <span className="text-[10px] font-mono text-cyber-cyan font-semibold">
                    Rp {comp.price.toLocaleString("id-ID")}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-1.5">
                  {comp.name}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                  {comp.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {comp.socket && (
                    <span className="text-[9px] font-mono bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700">
                      Socket {comp.socket}
                    </span>
                  )}
                  {comp.formFactor && (
                    <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {comp.formFactor}
                    </span>
                  )}
                  {comp.memoryType && (
                    <span className="text-[9px] font-mono bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {comp.memoryType}
                    </span>
                  )}
                  {comp.storageType && (
                    <span className="text-[9px] font-mono bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {comp.storageType}
                    </span>
                  )}
                  {comp.powerWattage > 0 && (
                    <span className="text-[9px] font-mono bg-slate-800 text-rose-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {comp.powerWattage}W TDP
                    </span>
                  )}
                  {comp.psuWattage && (
                    <span className="text-[9px] font-mono bg-slate-800 text-yellow-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {comp.psuWattage}W
                    </span>
                  )}
                </div>
              </div>

              <div>
                {isInstalledInTarget ? (
                  <button
                    onClick={() => {
                      sound.playScrew();
                      onRemoveComponent(targetSlot);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold bg-cyber-cyan text-cyber-dark hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Terpasang di {targetSlot} (Lepas)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstallClick(comp)}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold transition-all ${
                      !compCheck.compatible
                        ? "bg-slate-800 text-amber-300/80 hover:bg-amber-600 hover:text-white border border-amber-500/30"
                        : "bg-slate-800 text-slate-200 hover:bg-cyber-cyan hover:text-cyber-dark hover:shadow-cyber-cyan border border-slate-700"
                    }`}
                  >
                    {!compCheck.compatible ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pasang ({targetSlot}) - Cek</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pasang ke {targetSlot}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
