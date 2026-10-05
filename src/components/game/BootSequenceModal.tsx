"use client";

import React, { useState, useEffect } from "react";
import { BuildState, ScoreReport, BenchmarkResult } from "@/lib/game-engine/types";
import { getComponentById } from "@/lib/game-engine/components-catalog";
import { calculateBuildScore, runBenchmarkSimulation } from "@/lib/game-engine/scoring";
import { sound } from "@/lib/sound/sound-engine";
import confetti from "canvas-confetti";
import {
  X,
  Cpu,
  Gauge,
  Trophy,
  Play,
  Terminal,
  Monitor,
  FileText,
  Power,
  RefreshCw,
  HardDrive,
  ChevronRight,
} from "lucide-react";

interface BootSequenceModalProps {
  buildState: BuildState;
  onClose: () => void;
  onSaveCompletedBuild: (scoreReport: ScoreReport) => void;
}

export type OSType = "WORKOS_11" | "WORK_LINUX" | "WORK_MAC" | "WORK_98";
type BootPhase = "POST" | "BIOS" | "OS_SELECT" | "BOOTING_OS" | "DESKTOP";
type ActiveAppId = "SPECS" | "TERMINAL" | "BENCHMARK" | "MONITOR" | "SCORE" | "NOTEPAD";

export default function BootSequenceModal({
  buildState,
  onClose,
  onSaveCompletedBuild,
}: BootSequenceModalProps) {
  const [phase, setPhase] = useState<BootPhase>("POST");
  const [selectedOS, setSelectedOS] = useState<OSType>("WORKOS_11");
  const [activeApp, setActiveApp] = useState<ActiveAppId>("SPECS");
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Selamat datang di Terminal Miniatur WorkGb!",
    "Ketik 'help' untuk melihat daftar perintah atau 'neofetch' untuk info sistem.",
  ]);
  const [terminalInput, setTerminalInput] = useState("");

  // Notepad state
  const [notepadText, setNotepadText] = useState(
    `# Catatan Rakitan PC - ${buildState.name}\nTanggal: ${new Date().toLocaleDateString("id-ID")}\nStatus: Berhasil dirakit dan siap digunakan!\n`
  );

  const cpu = buildState.installedParts["cpu"] ? getComponentById(buildState.installedParts["cpu"]) : null;
  const mb = buildState.installedParts["motherboard"] ? getComponentById(buildState.installedParts["motherboard"]) : null;
  const gpu = buildState.installedParts["gpu"] ? getComponentById(buildState.installedParts["gpu"]) : null;
  const ram1 = buildState.installedParts["ram_1"] ? getComponentById(buildState.installedParts["ram_1"]) : null;
  const ram2 = buildState.installedParts["ram_2"] ? getComponentById(buildState.installedParts["ram_2"]) : null;
  const m2 = buildState.installedParts["storage_m2"] ? getComponentById(buildState.installedParts["storage_m2"]) : null;
  const sata = buildState.installedParts["storage_sata"] ? getComponentById(buildState.installedParts["storage_sata"]) : null;
  const psu = buildState.installedParts["psu"] ? getComponentById(buildState.installedParts["psu"]) : null;

  const scoreReport = calculateBuildScore(buildState);
  const benchmarkResult: BenchmarkResult = runBenchmarkSimulation(buildState);

  // Auto progression from POST to BIOS, then to OS Select
  useEffect(() => {
    sound.playPowerSwitch();
    sound.startFanSound();

    const t1 = setTimeout(() => {
      sound.playBiosBeep();
    }, 1200);

    const t2 = setTimeout(() => {
      setPhase("BIOS");
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      sound.stopFanSound();
    };
  }, []);

  const handleChooseOSAndBoot = (os: OSType) => {
    sound.playClick();
    setSelectedOS(os);
    setPhase("BOOTING_OS");
    sound.playBootChime();

    setTimeout(() => {
      setPhase("DESKTOP");
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
      onSaveCompletedBuild(scoreReport);
    }, 2500);
  };

  const handleRunBenchmark = () => {
    sound.playClick();
    setIsBenchmarking(true);

    setTimeout(() => {
      setIsBenchmarking(false);
      sound.playBootChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
      });
    }, 3000);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    sound.playClick();
    const newHistory = [...terminalHistory, `$ ${terminalInput}`];

    switch (cmd) {
      case "help":
        newHistory.push(
          "Perintah tersedia:",
          "  neofetch  - Menampilkan ringkasan sistem & ASCII art",
          "  specs     - Menampilkan komponen hardware PC yang terpasang",
          "  bench     - Menjalankan uji performa CPU & GPU",
          "  clear     - Membersihkan layar terminal",
          "  os        - Menampilkan nama dan arsitektur OS saat ini",
          "  exit      - Menutup terminal"
        );
        break;
      case "neofetch":
        newHistory.push(
          `       /\\_    OS: ${selectedOS.replace("_", " ")} Desktop (64-bit)`,
          `      /o o\\   Host: WorkGb Virtual Rig v1.0`,
          `     (  -  )  Kernel: 6.9.1-workgb-generic`,
          `     /\\   /\\  CPU: ${cpu?.name || "Generic CPU"}`,
          `    /  \\ /  \\ GPU: ${gpu?.name || "Integrated Graphics"}`,
          `              RAM: ${(ram1?.memoryCapacityGb || 8) + (ram2?.memoryCapacityGb || 0)} GB ${ram1?.memoryType || "DDR4"}`,
          `              Storage: ${m2?.name || sata?.name || "1TB SSD"}`
        );
        break;
      case "specs":
        newHistory.push(
          `[CPU]: ${cpu?.name || "None"} (${cpu?.powerWattage || 0}W TDP)`,
          `[GPU]: ${gpu?.name || "None"} (${gpu?.powerWattage || 0}W TDP)`,
          `[RAM]: ${ram1?.name || "None"}${ram2 ? ` + ${ram2.name}` : ""}`,
          `[Motherboard]: ${mb?.name || "None"}`,
          `[PSU]: ${psu?.name || "None"}`
        );
        break;
      case "bench":
        newHistory.push(
          "Menjalankan benchmark kalkulasi...",
          `-> CPU Score: ${benchmarkResult.cpuScore} Pts`,
          `-> GPU Score: ${benchmarkResult.gpuScore} Pts`,
          `-> Estimasi Gaming FPS 1080p: ${benchmarkResult.fps1080p} FPS`,
          `-> Estimasi Gaming FPS 1440p: ${benchmarkResult.fps1440p} FPS`
        );
        break;
      case "os":
        newHistory.push(`Sistem Operasi aktif: ${selectedOS}`);
        break;
      case "clear":
        setTerminalHistory([]);
        setTerminalInput("");
        return;
      case "exit":
        setActiveApp("SPECS");
        setTerminalInput("");
        return;
      default:
        newHistory.push(`Perintah '${cmd}' tidak dikenali. Ketik 'help' untuk panduan.`);
        break;
    }

    setTerminalHistory(newHistory);
    setTerminalInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl h-[650px] bg-[#070a12] border-2 border-cyber-cyan/50 rounded-2xl shadow-[0_0_60px_rgba(0,243,255,0.25)] flex flex-col overflow-hidden">
        {/* Monitor Bezel Frame Header */}
        <div className="h-10 bg-[#0d1320] border-b border-cyber-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-300">
              WORKGB VIRTUAL MONITOR • 2560x1440 @ 165Hz
            </span>
          </div>

          <div className="flex items-center gap-2">
            {phase === "DESKTOP" && (
              <button
                onClick={() => {
                  sound.playClick();
                  setPhase("OS_SELECT");
                }}
                className="text-[10px] font-mono text-cyan-300 hover:text-white bg-cyber-cyan/15 hover:bg-cyber-cyan/30 px-2 py-0.5 rounded border border-cyber-cyan/40 transition-colors flex items-center gap-1"
                title="Ganti OS yang sedang berjalan"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Ganti OS</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.stopFanSound();
                onClose();
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Tutup Virtual Monitor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SCREEN VIEWPORT ACCORDING TO PHASE */}
        {/* ============================================================ */}
        <div className="flex-1 bg-black text-white p-4 sm:p-6 overflow-hidden flex flex-col justify-between crt-screen">
          {/* PHASE 1: POST SCREEN */}
          {phase === "POST" && (
            <div className="w-full h-full flex flex-col justify-between font-mono text-xs">
              <div className="space-y-2">
                <div className="text-cyber-cyan font-bold text-lg mb-4 tracking-wider">
                  WORKGB POWER-ON SELF-TEST (POST) v3.4
                </div>
                <p className="text-slate-400">Memeriksa mikrokode CPU & inisialisasi hardware...</p>
                <p className="text-green-400">✓ CPU Terdeteksi: {cpu?.name || "Processor OK"}</p>
                <p className="text-green-400">
                  ✓ Memori RAM: {ram1?.name || "16GB"}{ram2 ? ` + ${ram2.name}` : ""} - Dual Channel OK
                </p>
                <p className="text-green-400">
                  ✓ Primary Graphics: {gpu?.name || "Integrated Graphics"} - PCIe 4.0 x16
                </p>
                <p className="text-green-400">
                  ✓ Penyimpanan: {m2?.name || sata?.name || "Storage Device"} - Healthy
                </p>
                <p className="text-green-400">✓ Power Supply: {psu?.name || "PSU Connected"}</p>
              </div>
              <div className="text-slate-500 text-[11px] flex items-center justify-between border-t border-slate-800 pt-2">
                <span>Tekan &lt;DEL&gt; untuk masuk ke BIOS Setup</span>
                <span className="animate-pulse text-cyber-cyan">Memuat UEFI Firmware...</span>
              </div>
            </div>
          )}

          {/* PHASE 2: BIOS UTILITY SCREEN */}
          {phase === "BIOS" && (
            <div className="w-full h-full flex flex-col justify-between font-mono text-xs bg-[#030914] p-4 rounded-lg border border-blue-900">
              <div>
                <div className="flex items-center justify-between border-b border-blue-800 pb-2 mb-4">
                  <span className="font-bold text-cyber-cyan text-sm">
                    WORKGB UEFI BIOS UTILITY - EZ MODE
                  </span>
                  <span className="text-slate-400 text-[11px]">Motherboard: {mb?.name}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                    <h4 className="text-blue-400 font-bold mb-2">Informasi Hardware Utama</h4>
                    <p className="text-[11px] text-slate-300">
                      <strong>CPU:</strong> {cpu?.name} ({cpu?.socket})
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>RAM:</strong> {ram1?.name} {ram2 ? `+ ${ram2.name}` : ""}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>GPU:</strong> {gpu?.name}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>Storage:</strong> {m2?.name || sata?.name}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>PSU:</strong> {psu?.name}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                    <h4 className="text-emerald-400 font-bold mb-2">Sensor & Voltase</h4>
                    <p className="text-[11px] text-slate-300">
                      <strong>CPU Temp:</strong> {benchmarkResult.cpuTempCelsius}°C (Normal)
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>Motherboard Temp:</strong> 31°C
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>CPU Fan Speed:</strong> 1,420 RPM
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>+12V Rail:</strong> 12.08 V (Stabil)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-blue-800 pt-2 text-[11px] text-slate-400">
                <span>Hardware siap! Pilih sistem operasi yang ingin dijalankan:</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setPhase("OS_SELECT");
                  }}
                  className="px-4 py-1.5 bg-cyber-cyan text-cyber-dark font-bold rounded hover:bg-white transition-colors"
                >
                  Pilih OS & Boot &gt;
                </button>
              </div>
            </div>
          )}

          {/* PHASE 3: INTERACTIVE OS SELECTOR SCREEN */}
          {phase === "OS_SELECT" && (
            <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-[#090e1c] to-[#04060c] rounded-xl border border-slate-800">
              <div className="text-center">
                <span className="text-[10px] font-mono tracking-widest text-cyber-cyan uppercase font-bold">
                  ★ BOOT MANAGER & OS SELECTOR ★
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  PILIH SISTEM OPERASI PC RAKITAN ANDA
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Coba antarmuka sistem operasi miniatur yang berbeda pada komputer yang baru saja Anda rakit!
                </p>
              </div>

              {/* 4 OS Choices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
                {/* 1. WorkOS 11 */}
                <div
                  onClick={() => handleChooseOSAndBoot("WORKOS_11")}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-blue-950/40 border-2 border-slate-700 hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300">
                      WorkOS 11 Pro
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Antarmuka modern Windows 11 style dengan Taskbar terpusat, Start Menu, dan gaming support optimal.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-blue-400">
                    <span>Install & Boot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 2. WorkLinux */}
                <div
                  onClick={() => handleChooseOSAndBoot("WORK_LINUX")}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-amber-950/40 border-2 border-slate-700 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300">
                      WorkLinux Cyber
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Distribusi Ubuntu / Debian style dengan Dock vertikal di kiri, Neofetch, dan Terminal interaktif.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-amber-400">
                    <span>Install & Boot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 3. Workmac */}
                <div
                  onClick={() => handleChooseOSAndBoot("WORK_MAC")}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-purple-950/40 border-2 border-slate-700 hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300">
                      Workmac Sequoia
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Desain elegan macOS style dengan Top Menu Bar, floating dock melayang, dan About This Mac.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-purple-400">
                    <span>Install & Boot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 4. WorkRetro 98 */}
                <div
                  onClick={() => handleChooseOSAndBoot("WORK_98")}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border-2 border-slate-700 hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">
                      WorkRetro 98
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Nostalgia klasik era 90-an dengan abu-abu Windows 98, suara retro, dan tampilan vintage.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                    <span>Install & Boot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="text-center text-[11px] text-slate-500">
                <span>Klik salah satu OS di atas untuk langsung mencoba desktop simulasinya.</span>
              </div>
            </div>
          )}

          {/* PHASE 4: BOOTING OS ANIMATION */}
          {phase === "BOOTING_OS" && (
            <div className="w-full h-full flex flex-col items-center justify-center font-sans">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyber-blue to-cyber-cyan flex items-center justify-center shadow-lg shadow-cyber-cyan/30 mb-6 animate-pulse">
                <Cpu className="w-10 h-10 text-cyber-dark" />
              </div>
              <h2 className="text-2xl font-bold tracking-wider text-white mb-2">
                Memuat {selectedOS.replace("_", " ")}...
              </h2>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                <div className="w-full h-full bg-cyber-cyan animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-3">Menyiapkan desktop miniatur...</p>
            </div>
          )}

          {/* PHASE 5: PLAYABLE MINIATURE DESKTOP SIMULATOR */}
          {phase === "DESKTOP" && (
            <div
              className={`relative w-full h-full rounded-xl flex flex-col justify-between overflow-hidden border border-slate-800 select-none ${
                selectedOS === "WORK_98"
                  ? "bg-[#008080]"
                  : selectedOS === "WORK_LINUX"
                  ? "bg-gradient-to-br from-[#2c001e] via-[#400030] to-[#120015]"
                  : selectedOS === "WORK_MAC"
                  ? "bg-gradient-to-tr from-[#1a1c29] via-[#242b45] to-[#141624]"
                  : "bg-gradient-to-br from-[#0c1424] via-[#090d18] to-[#04060a]"
              }`}
            >
              {/* TOP MENU BAR FOR WORKMAC ONLY */}
              {selectedOS === "WORK_MAC" && (
                <div className="h-7 bg-slate-900/70 backdrop-blur-md border-b border-white/10 px-3 flex items-center justify-between text-[11px] text-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white"> Workmac</span>
                    <span className="hover:text-white cursor-pointer" onClick={() => setActiveApp("SPECS")}>
                      About This PC
                    </span>
                    <span className="hover:text-white cursor-pointer" onClick={() => setActiveApp("BENCHMARK")}>
                      Benchmark
                    </span>
                    <span className="hover:text-white cursor-pointer" onClick={() => setActiveApp("TERMINAL")}>
                      Terminal
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-300">
                    <span>{new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              )}

              {/* DESKTOP WORKSPACE AREA */}
              <div className="flex-1 p-3 flex relative overflow-hidden">
                {/* LINUX VERTICAL DOCK (LEFT) */}
                {selectedOS === "WORK_LINUX" && (
                  <div className="w-12 bg-black/60 backdrop-blur-md rounded-xl p-1.5 flex flex-col gap-2 items-center mr-3 border border-white/10">
                    <button
                      onClick={() => setActiveApp("SPECS")}
                      className={`p-2 rounded-lg transition-all ${activeApp === "SPECS" ? "bg-amber-500 text-black" : "text-slate-300 hover:bg-white/10"}`}
                      title="Info Sistem"
                    >
                      <Monitor className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveApp("TERMINAL")}
                      className={`p-2 rounded-lg transition-all ${activeApp === "TERMINAL" ? "bg-amber-500 text-black" : "text-slate-300 hover:bg-white/10"}`}
                      title="Terminal"
                    >
                      <Terminal className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveApp("BENCHMARK")}
                      className={`p-2 rounded-lg transition-all ${activeApp === "BENCHMARK" ? "bg-amber-500 text-black" : "text-slate-300 hover:bg-white/10"}`}
                      title="Benchmark"
                    >
                      <Gauge className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveApp("SCORE")}
                      className={`p-2 rounded-lg transition-all ${activeApp === "SCORE" ? "bg-amber-500 text-black" : "text-slate-300 hover:bg-white/10"}`}
                      title="Sertifikat"
                    >
                      <Trophy className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* DESKTOP DESK ICONS (Left side on Windows & Retro) */}
                {(selectedOS === "WORKOS_11" || selectedOS === "WORK_98") && (
                  <div className="w-20 flex flex-col gap-3 mr-2 select-none">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveApp("SPECS");
                      }}
                      className="flex flex-col items-center text-center p-1.5 rounded-lg hover:bg-white/10 group transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 group-hover:scale-105">
                        <Monitor className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-slate-200 mt-1 font-medium leading-tight drop-shadow">
                        Spesifikasi PC
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveApp("BENCHMARK");
                      }}
                      className="flex flex-col items-center text-center p-1.5 rounded-lg hover:bg-white/10 group transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-400 group-hover:scale-105">
                        <Gauge className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-slate-200 mt-1 font-medium leading-tight drop-shadow">
                        Game Bench
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveApp("TERMINAL");
                      }}
                      className="flex flex-col items-center text-center p-1.5 rounded-lg hover:bg-white/10 group transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 group-hover:scale-105">
                        <Terminal className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-slate-200 mt-1 font-medium leading-tight drop-shadow">
                        Terminal
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveApp("NOTEPAD");
                      }}
                      className="flex flex-col items-center text-center p-1.5 rounded-lg hover:bg-white/10 group transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-cyan-600/30 flex items-center justify-center text-cyan-300 group-hover:scale-105">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-slate-200 mt-1 font-medium leading-tight drop-shadow">
                        Catatan
                      </span>
                    </button>
                  </div>
                )}

                {/* ACTIVE APPLICATION WINDOW */}
                <div className="flex-1 h-full bg-[#0b101c]/95 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md">
                  {/* Window Titlebar */}
                  <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan" />
                      <span>
                        {activeApp === "SPECS" && "Spesifikasi PC Rakitan Anda (About This PC)"}
                        {activeApp === "TERMINAL" && "Terminal Miniatur WorkGb (CLI Shell)"}
                        {activeApp === "BENCHMARK" && "CineBench & 3DMark Simulator"}
                        {activeApp === "MONITOR" && "Hardware & Thermal Diagnostics"}
                        {activeApp === "SCORE" && "Sertifikat Evaluasi Perakitan"}
                        {activeApp === "NOTEPAD" && "Catatan / Notepad"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveApp("SPECS")}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Info PC"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveApp("BENCHMARK")}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Benchmark"
                      >
                        <Gauge className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveApp("TERMINAL")}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Terminal"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Window Body Content */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {/* APP 1: SPECS (ABOUT THIS PC) */}
                    {activeApp === "SPECS" && (
                      <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                            <Monitor className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{buildState.name}</h3>
                            <p className="text-[11px] font-mono text-cyan-300">
                              OS: {selectedOS.replace("_", " ")} Edition • 64-bit Architecture
                            </p>
                          </div>
                        </div>

                        {/* Hardware Specs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-mono">PROSESOR (CPU)</span>
                            <p className="font-bold text-white mt-0.5">{cpu?.name || "Belum terpasang"}</p>
                            <span className="text-[10px] text-slate-500">Socket {cpu?.socket} • TDP {cpu?.powerWattage}W</span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-mono">MOTHERBOARD</span>
                            <p className="font-bold text-white mt-0.5">{mb?.name || "Belum terpasang"}</p>
                            <span className="text-[10px] text-slate-500">{mb?.formFactor} • {mb?.memoryType} Slot</span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-mono">MEMORI RAM</span>
                            <p className="font-bold text-white mt-0.5">
                              {(ram1?.memoryCapacityGb || 0) + (ram2?.memoryCapacityGb || 0)} GB Total
                            </p>
                            <span className="text-[10px] text-slate-500">
                              {ram1?.name}{ram2 ? ` + ${ram2.name}` : ""}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-mono">KARTU GRAFIS (GPU)</span>
                            <p className="font-bold text-white mt-0.5">{gpu?.name || "Integrated Graphics"}</p>
                            <span className="text-[10px] text-slate-500">PCIe 4.0 x16 • TDP {gpu?.powerWattage}W</span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-mono">PENYIMPANAN</span>
                            <p className="font-bold text-white mt-0.5">{m2?.name || sata?.name || "Penyimpanan Utama"}</p>
                            <span className="text-[10px] text-slate-500">
                              {m2 ? `NVMe ${m2.storageCapacityGb}GB` : ""}{sata ? ` | SATA ${sata.storageCapacityGb}GB` : ""}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-mono">POWER SUPPLY (PSU)</span>
                            <p className="font-bold text-white mt-0.5">{psu?.name || "PSU Unit"}</p>
                            <span className="text-[10px] text-slate-500">{psu?.psuWattage}W • {psu?.efficiencyRating}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => setActiveApp("BENCHMARK")}
                            className="px-3 py-1.5 bg-cyber-cyan text-cyber-dark font-bold text-xs rounded-lg hover:bg-white transition-all shadow-cyber-cyan"
                          >
                            Uji Game Benchmark &gt;
                          </button>
                        </div>
                      </div>
                    )}

                    {/* APP 2: TERMINAL CLI */}
                    {activeApp === "TERMINAL" && (
                      <div className="h-full flex flex-col font-mono text-xs bg-black/90 p-3 rounded-lg border border-slate-800 text-emerald-400 overflow-hidden">
                        <div className="flex-1 overflow-y-auto space-y-1 mb-2">
                          {terminalHistory.map((line, idx) => (
                            <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                              {line}
                            </div>
                          ))}
                        </div>
                        <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 border-t border-slate-800 pt-2">
                          <span className="text-cyan-400">$</span>
                          <input
                            type="text"
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                            placeholder="Ketik 'neofetch', 'specs', 'bench', 'help'..."
                            className="flex-1 bg-transparent text-emerald-300 focus:outline-none"
                            autoFocus
                          />
                        </form>
                      </div>
                    )}

                    {/* APP 3: BENCHMARK */}
                    {activeApp === "BENCHMARK" && (
                      <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div>
                            <h3 className="text-sm font-bold text-white">WorkGB 3D Benchmark Simulator</h3>
                            <p className="text-xs text-slate-400">
                              Uji render 3D & frame rate gaming berdasarkan CPU & GPU yang dipasang
                            </p>
                          </div>
                          <button
                            onClick={handleRunBenchmark}
                            disabled={isBenchmarking}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyber-blue to-cyber-cyan text-cyber-dark font-bold text-xs rounded-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-cyber-cyan"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isBenchmarking ? "Menguji..." : "Mulai Tes"}</span>
                          </button>
                        </div>

                        {isBenchmarking ? (
                          <div className="text-center py-10">
                            <div className="w-10 h-10 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-xs font-mono text-cyber-cyan animate-pulse">
                              Merender scene 3D & menghitung frame rate riil...
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-400">Skor CPU Multi-Core</span>
                                <p className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                                  {benchmarkResult.cpuScore} Pts
                                </p>
                                <span className="text-[9px] text-slate-500">{cpu?.name}</span>
                              </div>
                              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-400">Skor Grafik 3DMark</span>
                                <p className="text-lg font-bold font-mono text-purple-400 mt-0.5">
                                  {benchmarkResult.gpuScore} Pts
                                </p>
                                <span className="text-[9px] text-slate-500">{gpu?.name}</span>
                              </div>
                            </div>

                            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                              <h4 className="text-xs font-bold text-slate-300 mb-2">
                                Estimasi Frame Rate Gaming (FPS Rata-Rata)
                              </h4>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                  <span className="text-[9px] text-slate-400">1080p Ultra</span>
                                  <p className="text-base font-bold text-emerald-400 font-mono">
                                    {benchmarkResult.fps1080p} FPS
                                  </p>
                                </div>
                                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                  <span className="text-[9px] text-slate-400">1440p 2K Ultra</span>
                                  <p className="text-base font-bold text-cyber-cyan font-mono">
                                    {benchmarkResult.fps1440p} FPS
                                  </p>
                                </div>
                                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                  <span className="text-[9px] text-slate-400">4K UHD</span>
                                  <p className="text-base font-bold text-amber-400 font-mono">
                                    {benchmarkResult.fps4k} FPS
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* APP 4: SCORE CERTIFICATE */}
                    {activeApp === "SCORE" && (
                      <div className="max-w-xl mx-auto text-center space-y-4">
                        <span className="text-[10px] font-mono tracking-widest text-cyber-green uppercase font-bold">
                          ★ PERAKITAN PC BERHASIL DAN DAPAT DIGUNAKAN ★
                        </span>
                        <h3 className="text-xl font-black text-white">EVALUASI PERAKITAN WORKGB</h3>
                        <p className="text-xs text-slate-400">{scoreReport.summary}</p>

                        <div className="flex items-center justify-center my-2">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex flex-col items-center justify-center shadow-lg font-black">
                            <span className="text-3xl leading-none">{scoreReport.grade}</span>
                            <span className="text-[9px] uppercase tracking-wider mt-1 font-bold">NILAI</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 block">Akurasi</span>
                            <span className="font-bold text-cyan-400">{scoreReport.assemblyAccuracy}%</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 block">Kompatibilitas</span>
                            <span className="font-bold text-emerald-400">{scoreReport.compatibility}%</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 block">Kabel Rapi</span>
                            <span className="font-bold text-purple-400">{scoreReport.cableManagement}%</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 block">Waktu Rakit</span>
                            <span className="font-bold text-amber-400">{scoreReport.buildTime}</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => {
                              sound.stopFanSound();
                              onClose();
                            }}
                            className="px-5 py-2 bg-cyber-cyan text-cyber-dark font-bold text-xs rounded-lg hover:bg-white transition-all shadow-cyber-cyan"
                          >
                            Tutup Monitor & Kembali ke Meja Kerja
                          </button>
                        </div>
                      </div>
                    )}

                    {/* APP 5: NOTEPAD */}
                    {activeApp === "NOTEPAD" && (
                      <div className="h-full flex flex-col">
                        <textarea
                          value={notepadText}
                          onChange={(e) => setNotepadText(e.target.value)}
                          className="w-full flex-1 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                          placeholder="Ketik catatan rakitan PC Anda di sini..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM TASKBAR (WINDOWS / RETRO / MAC DOCK) */}
              {selectedOS !== "WORK_MAC" && (
                <div
                  className={`h-10 px-3 flex items-center justify-between text-xs border-t ${
                    selectedOS === "WORK_98"
                      ? "bg-[#c0c0c0] border-white text-black font-mono shadow-inner"
                      : "bg-[#0a0e18]/90 backdrop-blur-md border-slate-800 text-slate-300"
                  }`}
                >
                  {/* Start Button & Left Tools */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsStartMenuOpen(!isStartMenuOpen);
                      }}
                      className={`px-3 py-1 rounded flex items-center gap-1.5 font-bold text-xs transition-all ${
                        selectedOS === "WORK_98"
                          ? "bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-inset text-black"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </button>

                    <div className="h-4 w-px bg-slate-700/60" />

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveApp("SPECS")}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                          activeApp === "SPECS" ? "bg-white/20 text-white font-bold" : "hover:bg-white/10"
                        }`}
                      >
                        Spesifikasi
                      </button>
                      <button
                        onClick={() => setActiveApp("BENCHMARK")}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                          activeApp === "BENCHMARK" ? "bg-white/20 text-white font-bold" : "hover:bg-white/10"
                        }`}
                      >
                        Benchmark
                      </button>
                      <button
                        onClick={() => setActiveApp("TERMINAL")}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                          activeApp === "TERMINAL" ? "bg-white/20 text-white font-bold" : "hover:bg-white/10"
                        }`}
                      >
                        Terminal
                      </button>
                    </div>
                  </div>

                  {/* System Tray Clock & Switcher */}
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-400">
                      {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              )}

              {/* POPUP START MENU (WINDOWS STYLE) */}
              {isStartMenuOpen && (
                <div className="absolute bottom-11 left-3 w-64 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-30 space-y-2">
                  <div className="border-b border-slate-800 pb-2">
                    <p className="text-xs font-bold text-white">Menu Utama WorkOS</p>
                    <p className="text-[10px] text-slate-400">PC Builder: {buildState.name}</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setActiveApp("SPECS");
                        setIsStartMenuOpen(false);
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <Monitor className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tentang PC Ini</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveApp("BENCHMARK");
                        setIsStartMenuOpen(false);
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <Gauge className="w-3.5 h-3.5 text-purple-400" />
                      <span>Uji Game 3D</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveApp("TERMINAL");
                        setIsStartMenuOpen(false);
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Command Prompt</span>
                    </button>
                    <button
                      onClick={() => {
                        setPhase("OS_SELECT");
                        setIsStartMenuOpen(false);
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-cyan-300 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ganti Sistem Operasi</span>
                    </button>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5">
                    <button
                      onClick={() => {
                        sound.stopFanSound();
                        onClose();
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-rose-950/60 text-rose-300 flex items-center gap-2 text-xs"
                    >
                      <Power className="w-3.5 h-3.5 text-rose-400" />
                      <span>Shut Down PC (Matikan)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
