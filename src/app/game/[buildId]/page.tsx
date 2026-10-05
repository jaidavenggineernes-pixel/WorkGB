"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Workbench from "@/components/game/Workbench";
import PartsDrawer from "@/components/game/PartsDrawer";
import BuildStatusPanel from "@/components/game/BuildStatusPanel";
import TroubleshootModal from "@/components/game/TroubleshootModal";
import VirtualPCMonitor from "@/components/game/VirtualPCMonitor";
import {
  BuildState,
  SlotKey,
  PCComponent,
  ScoreReport,
} from "@/lib/game-engine/types";
import {
  getInitialBuildState,
  calculateBuildProgress,
  canPowerOn,
} from "@/lib/game-engine/assembly-state";
import { sound } from "@/lib/sound/sound-engine";
import { AlertCircle, CheckCircle2, RotateCcw, ArrowLeft, Wrench, Monitor } from "lucide-react";
import Link from "next/link";

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const buildId = params?.buildId as string;

  const [buildState, setBuildState] = useState<BuildState>(() => getInitialBuildState());
  const [viewMode, setViewMode] = useState<"WORKBENCH" | "MONITOR">("WORKBENCH");
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>("case");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [troubleshootMissing, setTroubleshootMissing] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load build from API
  useEffect(() => {
    async function loadBuild() {
      try {
        const res = await fetch(`/api/builds/${buildId}`);
        if (res.ok) {
          const data = await res.json();
          const b = data.build;
          const parsedParts = JSON.parse(b.installedPartsJson || "{}");

          const loadedState: BuildState = {
            id: b.id,
            name: b.name,
            status: b.status,
            progress: b.progress,
            accuracyScore: b.accuracyScore,
            compatibilityScore: b.compatibilityScore,
            cableScore: b.cableScore,
            errorsCount: b.errorsCount,
            buildTimeSeconds: b.buildTimeSeconds,
            isPoweredOn: b.isPoweredOn,
            currentStep: b.currentStep,
            caseClosed: b.caseState === "CLOSED",
            thermalPasteApplied: b.thermalPasteApplied,
            cablesConnected: b.cablesConnected,
            installedParts: parsedParts,
          };

          setBuildState(loadedState);
        } else {
          router.push("/menu");
        }
      } catch (err) {
        console.error("Error loading build:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (buildId) {
      loadBuild();
    }
  }, [buildId, router]);

  // Build Time Counter
  useEffect(() => {
    const timer = setInterval(() => {
      setBuildState((prev) => ({
        ...prev,
        buildTimeSeconds: prev.buildTimeSeconds + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerToast = (text: string, type: "error" | "success" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const unlockAchievement = async (code: string) => {
    try {
      await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
    } catch {}
  };

  const handleSaveBuild = async (overrideState?: BuildState) => {
    setIsSaving(true);
    const stateToSave = overrideState || buildState;

    try {
      await fetch(`/api/builds/${buildId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stateToSave),
      });
      triggerToast("Progres perakitan berhasil disimpan ke server!", "success");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInstallComponent = (slot: SlotKey, comp: PCComponent) => {
    setBuildState((prev) => {
      const nextParts = { ...prev.installedParts, [slot]: comp.id };
      const nextState: BuildState = {
        ...prev,
        installedParts: nextParts,
      };
      nextState.progress = calculateBuildProgress(nextState);

      if (comp.id.includes("4090") || comp.id.includes("7800x3d")) {
        unlockAchievement("SILICON_BEAST");
      }

      triggerToast(`${comp.name} berhasil dipasang ke slot ${slot}!`, "success");
      return nextState;
    });
  };

  const handleRemoveComponent = (slot: SlotKey) => {
    setBuildState((prev) => {
      const nextParts = { ...prev.installedParts };
      delete nextParts[slot];
      const nextState: BuildState = {
        ...prev,
        installedParts: nextParts,
      };
      nextState.progress = calculateBuildProgress(nextState);
      triggerToast(`Komponen pada slot ${slot} telah dilepas.`, "success");
      return nextState;
    });
  };

  const handleIncompatibleAttempt = (reason: string) => {
    setBuildState((prev) => ({
      ...prev,
      errorsCount: prev.errorsCount + 1,
    }));
    triggerToast(reason, "error");
  };

  const handleApplyThermalPaste = () => {
    setBuildState((prev) => {
      const nextState = {
        ...prev,
        thermalPasteApplied: true,
      };
      nextState.progress = calculateBuildProgress(nextState);
      unlockAchievement("THERMAL_MASTER");
      triggerToast("Thermal paste berhasil diaplikasikan secara merata!", "success");
      return nextState;
    });
  };

  const handleConnectCables = () => {
    setBuildState((prev) => {
      const nextState = {
        ...prev,
        cablesConnected: true,
      };
      nextState.progress = calculateBuildProgress(nextState);
      unlockAchievement("CABLE_LEGEND");
      triggerToast("Kabel daya 24-Pin ATX, CPU 8-Pin, dan PCIe berhasil terhubung rapi!", "success");
      return nextState;
    });
  };

  const handleToggleCaseGlass = () => {
    setBuildState((prev) => {
      const nextState = {
        ...prev,
        caseClosed: !prev.caseClosed,
      };
      nextState.progress = calculateBuildProgress(nextState);
      triggerToast(
        nextState.caseClosed ? "Panel kaca casing terpasang rapat." : "Panel kaca casing dibuka.",
        "success"
      );
      return nextState;
    });
  };

  const handlePowerOn = () => {
    const powerCheck = canPowerOn(buildState);
    if (!powerCheck.canBoot) {
      sound.playError();
      setTroubleshootMissing(powerCheck.missing);
      setShowTroubleshoot(true);
      return;
    }

    setBuildState((prev) => ({ ...prev, isPoweredOn: true }));
    setViewMode("MONITOR");
    sound.playPowerSwitch();
    sound.playBootChime();
    unlockAchievement("FIRST_BOOT");

    if (buildState.errorsCount === 0) {
      unlockAchievement("FLAWLESS_BUILD");
    }
    if (buildState.buildTimeSeconds < 180) {
      unlockAchievement("SPEED_BUILDER");
    }
  };

  const handleSaveCompletedBuild = (report: ScoreReport) => {
    const finalState: BuildState = {
      ...buildState,
      status: "COMPLETED",
      score: report.grade,
      progress: 100,
    };
    setBuildState(finalState);
    handleSaveBuild(finalState);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-mono text-cyber-cyan animate-pulse">
            Memuat meja kerja WorkGb...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-cyber-card px-3 py-1.5 rounded-lg border border-cyber-border hover:border-slate-600 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Menu</span>
            </Link>
            <h1 className="text-lg font-extrabold text-white tracking-wide">
              {buildState.name}
            </h1>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                buildState.status === "COMPLETED"
                  ? "bg-cyber-green/10 text-cyber-green border-cyber-green/30"
                  : "bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30"
              }`}
            >
              {buildState.status === "COMPLETED" ? "SELESAI (BOOTING)" : "SEDANG DIRAKIT"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm("Reset ulang perakitan ini dari awal?")) {
                  sound.playScrew();
                  const reset = getInitialBuildState(buildState.name);
                  reset.id = buildState.id;
                  setBuildState(reset);
                  handleSaveBuild(reset);
                }
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 bg-cyber-card px-3 py-1.5 rounded-lg border border-cyber-border transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bongkar Ulang</span>
            </button>
          </div>
        </div>

        {toastMessage && (
          <div
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-xs font-semibold max-w-md transition-all animate-bounce ${
              toastMessage.type === "error"
                ? "bg-rose-950/95 border-rose-500 text-rose-200 shadow-rose-900/50"
                : "bg-slate-900/95 border-cyber-cyan text-cyan-200 shadow-cyber-cyan/30"
            }`}
          >
            {toastMessage.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-cyber-green flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Workspace Mode Switcher Tabs */}
        <div className="flex items-center gap-2 bg-cyber-card/90 p-1 rounded-xl border border-cyber-border w-fit shadow-lg">
          <button
            onClick={() => {
              sound.playClick();
              setViewMode("WORKBENCH");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === "WORKBENCH"
                ? "bg-cyber-cyan text-cyber-dark shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>🛠️ Meja Rakit Hardware</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setViewMode("MONITOR");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === "MONITOR"
                ? "bg-cyber-cyan text-cyber-dark shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${buildState.isPoweredOn ? "relative" : ""}`}
          >
            <Monitor className="w-4 h-4" />
            <span>🖥️ Masuk ke Monitor PC (Desktop & Uji FPS)</span>
            {buildState.isPoweredOn && (
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            )}
          </button>
        </div>

        {viewMode === "WORKBENCH" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Workbench
                  buildState={buildState}
                  activeSlot={activeSlot}
                  onSelectSlot={(slot) => {
                    sound.playClick();
                    setActiveSlot(slot);
                  }}
                  onApplyThermalPaste={handleApplyThermalPaste}
                  onConnectCables={handleConnectCables}
                  onToggleCaseGlass={handleToggleCaseGlass}
                  onPowerOn={handlePowerOn}
                  onRemovePart={handleRemoveComponent}
                  onOpenMonitor={() => setViewMode("MONITOR")}
                />
              </div>

              <div className="lg:col-span-1">
                <BuildStatusPanel
                  buildState={buildState}
                  onSelectSlot={(slot) => {
                    sound.playClick();
                    setActiveSlot(slot);
                  }}
                  onSaveBuild={() => handleSaveBuild()}
                  isSaving={isSaving}
                />
              </div>
            </div>

            <div className="w-full">
              <PartsDrawer
                buildState={buildState}
                activeSlot={activeSlot}
                onInstallComponent={handleInstallComponent}
                onRemoveComponent={handleRemoveComponent}
                onIncompatibleAttempt={handleIncompatibleAttempt}
              />
            </div>
          </>
        ) : (
          <div className="w-full">
            <VirtualPCMonitor
              buildState={buildState}
              onBackToWorkbench={() => setViewMode("WORKBENCH")}
              onPowerOn={handlePowerOn}
              onSaveCompletedBuild={handleSaveCompletedBuild}
            />
          </div>
        )}
      </main>

      {showTroubleshoot && (
        <TroubleshootModal
          missingItems={troubleshootMissing}
          onClose={() => setShowTroubleshoot(false)}
        />
      )}
    </div>
  );
}
