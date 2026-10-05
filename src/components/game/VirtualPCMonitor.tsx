"use client";

import React, { useState, useEffect, useRef } from "react";
import { BuildState, ScoreReport } from "@/lib/game-engine/types";
import { getComponentById } from "@/lib/game-engine/components-catalog";
import { calculateBuildScore } from "@/lib/game-engine/scoring";
import {
  SIMULATED_GAMES,
  ResolutionSetting,
  QualityPreset,
  calculateRealtimeFps,
  LiveFpsTelemetry,
} from "@/lib/game-engine/fps-engine";
import { sound } from "@/lib/sound/sound-engine";
import confetti from "canvas-confetti";
import {
  X,
  Gamepad2,
  Activity,
  Cpu,
  HardDrive,
  Globe,
  FileText,
  Trophy,
  Power,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Wrench,
  Search,
  Sliders,
} from "lucide-react";

export type OSType = "WORKOS_11" | "WORK_LINUX" | "WORK_MAC" | "WORK_98";
type ActiveAppId =
  | "GAME_CENTER"
  | "TASK_MANAGER"
  | "SPECS"
  | "DRIVES"
  | "BROWSER"
  | "NOTEPAD"
  | "SCORE"
  | "OS_SETTINGS";

interface VirtualPCMonitorProps {
  buildState: BuildState;
  onBackToWorkbench: () => void;
  onPowerOn: () => void;
  onSaveCompletedBuild: (scoreReport: ScoreReport) => void;
}

export default function VirtualPCMonitor({
  buildState,
  onBackToWorkbench,
  onPowerOn,
  onSaveCompletedBuild,
}: VirtualPCMonitorProps) {
  // OS & Desktop state
  const [currentOS, setCurrentOS] = useState<OSType>("WORKOS_11");
  const [openApps, setOpenApps] = useState<ActiveAppId[]>(["GAME_CENTER"]);
  const [focusedApp, setFocusedApp] = useState<ActiveAppId>("GAME_CENTER");
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Game Center / FPS Test state
  const [selectedGameId, setSelectedGameId] = useState<string>("cyberpunk");
  const [resolution, setResolution] = useState<ResolutionSetting>("1080p");
  const [preset, setPreset] = useState<QualityPreset>("High");
  const [rayTracing, setRayTracing] = useState<boolean>(false);
  const [isPlayingGame, setIsPlayingGame] = useState<boolean>(true);
  const [fpsJitter, setFpsJitter] = useState<number>(0);
  const [frametimeHistory, setFrametimeHistory] = useState<number[]>([7, 7, 7, 7, 7, 7, 7, 7, 7, 7]);

  // Task manager tab
  const [taskManagerTab, setTaskManagerTab] = useState<"PERFORMANCE" | "SENSORS" | "HARDWARE">("PERFORMANCE");

  // Notepad text
  const [notes, setNotes] = useState<string>(
    `# Catatan Rakitan PC WorkGb - ${buildState.name}\nTanggal: ${new Date().toLocaleDateString("id-ID")}\n\nKomponen aktif terpasang dan siap diuji coba secara real-time!`
  );

  // Canvas ref for animated gameplay simulator
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Score report
  const scoreReport = calculateBuildScore(buildState);

  // Telemetry calculation
  const telemetry: LiveFpsTelemetry = calculateRealtimeFps(
    buildState,
    selectedGameId,
    resolution,
    preset,
    rayTracing
  );

  // Time clock update
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time FPS jitter and frametime graph ticker
  useEffect(() => {
    if (!isPlayingGame || !buildState.isPoweredOn) return;

    const interval = setInterval(() => {
      // Natural FPS jitter between -3 and +3
      const jitter = Math.floor(Math.random() * 7) - 3;
      setFpsJitter(jitter);

      const currentInstantFps = Math.max(5, telemetry.fps + jitter);
      const instantFrametime = Math.round((1000 / currentInstantFps) * 10) / 10;

      setFrametimeHistory((prev) => [...prev.slice(1), instantFrametime]);
    }, 200);

    return () => clearInterval(interval);
  }, [isPlayingGame, telemetry.fps, buildState.isPoweredOn]);

  // Animated 3D/Grid Canvas loop for the game preview
  useEffect(() => {
    if (!isPlayingGame || !buildState.isPoweredOn) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid horizon
      const horizon = canvas.height * 0.55;

      // Draw sun or glow
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        horizon - 20,
        10,
        canvas.width / 2,
        horizon - 20,
        140
      );
      grad.addColorStop(0, selectedGameId === "cyberpunk" ? "rgba(250, 204, 21, 0.4)" : "rgba(56, 189, 248, 0.4)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw moving perspective grid floor
      ctx.strokeStyle =
        selectedGameId === "cyberpunk"
          ? "rgba(234, 179, 8, 0.35)"
          : selectedGameId === "blackmyth"
          ? "rgba(217, 119, 6, 0.35)"
          : "rgba(14, 165, 233, 0.35)";
      ctx.lineWidth = 1.5;

      offset = (offset + (telemetry.fps > 60 ? 3 : 1.2)) % 40;

      // Vertical perspective lines
      const cx = canvas.width / 2;
      for (let x = -canvas.width * 1.5; x <= canvas.width * 2.5; x += 60) {
        ctx.beginPath();
        ctx.moveTo(cx, horizon);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines moving forward
      for (let y = horizon; y < canvas.height; y += 14) {
        const factor = Math.pow((y - horizon) / (canvas.height - horizon), 2);
        const actualY = horizon + factor * (canvas.height - horizon) + (offset * factor * 0.4);
        if (actualY <= canvas.height) {
          ctx.beginPath();
          ctx.moveTo(0, actualY);
          ctx.lineTo(canvas.width, actualY);
          ctx.stroke();
        }
      }

      // Draw simulated 3D floating target wireframe
      const boxSize = 35 + Math.sin(Date.now() / 400) * 6;
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(canvas.width / 2 - boxSize / 2, horizon - boxSize - 10, boxSize, boxSize);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlayingGame, selectedGameId, telemetry.fps, buildState.isPoweredOn]);

  const openApp = (appId: ActiveAppId) => {
    sound.playClick();
    if (!openApps.includes(appId)) {
      setOpenApps((prev) => [...prev, appId]);
    }
    setFocusedApp(appId);
    setIsStartMenuOpen(false);
  };

  const closeApp = (appId: ActiveAppId) => {
    sound.playClick();
    setOpenApps((prev) => prev.filter((id) => id !== appId));
    if (focusedApp === appId) {
      const remaining = openApps.filter((id) => id !== appId);
      if (remaining.length > 0) {
        setFocusedApp(remaining[remaining.length - 1]);
      }
    }
  };

  const currentDisplayFps = Math.max(4, telemetry.fps + fpsJitter);

  // Desktop Background based on OS
  const getDesktopBg = () => {
    switch (currentOS) {
      case "WORKOS_11":
        return "bg-gradient-to-tr from-[#001026] via-[#051e3c] to-[#01142f]";
      case "WORK_LINUX":
        return "bg-gradient-to-br from-[#2c001e] via-[#461133] to-[#77216f]";
      case "WORK_MAC":
        return "bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#0c0a09]";
      case "WORK_98":
        return "bg-[#008080]";
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Monitor Control Strip */}
      <div className="flex items-center justify-between bg-cyber-card/90 border border-cyber-border rounded-xl px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToWorkbench();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/40 text-cyber-cyan text-xs font-bold transition-all"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Kembali ke Meja Rakit (Ganti Komponen)</span>
          </button>

          <div className="h-4 w-px bg-cyber-border hidden sm:block" />

          {/* OS Switcher Badges */}
          <div className="hidden sm:flex items-center gap-1.5 bg-cyber-dark/80 p-1 rounded-lg border border-cyber-border text-xs">
            <span className="text-[10px] text-slate-400 font-mono px-1">OS:</span>
            {(
              [
                { id: "WORKOS_11", name: "WorkOS 11" },
                { id: "WORK_LINUX", name: "WorkLinux" },
                { id: "WORK_MAC", name: "Workmac" },
                { id: "WORK_98", name: "Work98" },
              ] as const
            ).map((os) => (
              <button
                key={os.id}
                onClick={() => {
                  sound.playClick();
                  setCurrentOS(os.id);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  currentOS === os.id
                    ? "bg-cyber-cyan text-cyber-dark font-bold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {os.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Power Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                buildState.isPoweredOn
                  ? "bg-cyber-green shadow-[0_0_8px_#10b981] animate-pulse"
                  : "bg-cyber-amber shadow-[0_0_8px_#f59e0b]"
              }`}
            />
            <span className="text-xs font-mono text-slate-300 font-semibold">
              {buildState.isPoweredOn ? "PC: MENYALA (ONLINE)" : "PC: MATI (STANDBY)"}
            </span>
          </div>

          {!buildState.isPoweredOn && (
            <button
              onClick={() => {
                sound.playPowerSwitch();
                onPowerOn();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyber-green hover:bg-emerald-400 text-cyber-dark font-bold text-xs transition-all animate-bounce"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Nyalakan PC</span>
            </button>
          )}
        </div>
      </div>

      {/* Realistic Gaming Monitor Bezel Frame */}
      <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#181d28] via-[#10141d] to-[#090c13] p-3 sm:p-4 border-2 border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Top Bezel Webcam */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-cyber-cyan/40" />
        </div>

        {/* Inside Monitor Screen Display */}
        <div
          className={`relative w-full min-h-[640px] h-[680px] rounded-xl overflow-hidden border border-slate-900 shadow-inner flex flex-col justify-between select-none ${getDesktopBg()}`}
        >
          {/* Case 1: PC Is Turn OFF (Standby / No Signal) */}
          {!buildState.isPoweredOn ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black/95 text-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-cyber-card border border-cyber-border flex items-center justify-center mb-4 text-slate-500">
                <Power className="w-8 h-8 text-cyber-cyan animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">MONITOR PC: NO SIGNAL</h2>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                Komputer rakitan Anda dalam kondisi mati atau belum dinyalakan. Tekan tombol
                Power di bawah ini untuk memulai sequence booting ke sistem operasi.
              </p>
              <button
                onClick={() => {
                  sound.playPowerSwitch();
                  onPowerOn();
                }}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-cyber-dark font-extrabold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105"
              >
                <Power className="w-4 h-4" />
                <span>TEKAN TOMBOL POWER UNTUK BOOTING</span>
              </button>
            </div>
          ) : (
            <>
              {/* Top Bar for macOS style */}
              {currentOS === "WORK_MAC" && (
                <div className="w-full h-7 bg-black/40 backdrop-blur-md px-4 flex items-center justify-between text-xs text-white/90 border-b border-white/10 z-30">
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-white">🍎 Workmac</span>
                    <button
                      onClick={() => openApp("SPECS")}
                      className="hover:text-cyber-cyan transition-colors"
                    >
                      Tentang Mac Ini
                    </button>
                    <button
                      onClick={() => openApp("GAME_CENTER")}
                      className="hover:text-cyber-cyan transition-colors"
                    >
                      Game Benchmark
                    </button>
                    <button
                      onClick={() => openApp("TASK_MANAGER")}
                      className="hover:text-cyber-cyan transition-colors"
                    >
                      Aktivitas
                    </button>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-white/80">
                    <span>
                      GPU: {telemetry.gpuUsagePercent}% | CPU: {telemetry.cpuTempCelsius}°C
                    </span>
                    <span>{currentTime}</span>
                  </div>
                </div>
              )}

              {/* Desktop Workspace (Homescreen Icons & Open Windows) */}
              <div className="relative flex-1 p-4 overflow-hidden flex">
                {/* Desktop Icons Column (Left Side) */}
                <div className="flex flex-col gap-4 z-10 w-24">
                  {/* App 1: Game Center */}
                  <button
                    onClick={() => openApp("GAME_CENTER")}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white drop-shadow text-center leading-tight">
                      Game Center & FPS
                    </span>
                  </button>

                  {/* App 2: Task Manager */}
                  <button
                    onClick={() => openApp("TASK_MANAGER")}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white drop-shadow text-center leading-tight">
                      Task Manager
                    </span>
                  </button>

                  {/* App 3: This PC */}
                  <button
                    onClick={() => openApp("DRIVES")}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white drop-shadow text-center leading-tight">
                      Penyimpanan
                    </span>
                  </button>

                  {/* App 4: System Specs */}
                  <button
                    onClick={() => openApp("SPECS")}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white drop-shadow text-center leading-tight">
                      Spek Hardware
                    </span>
                  </button>

                  {/* App 5: Browser */}
                  <button
                    onClick={() => openApp("BROWSER")}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Globe className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white drop-shadow text-center leading-tight">
                      WorkBrowser
                    </span>
                  </button>

                  {/* App 6: Build Score */}
                  <button
                    onClick={() => openApp("SCORE")}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white drop-shadow text-center leading-tight">
                      Skor Rakitan
                    </span>
                  </button>
                </div>

                {/* Open Window Manager Layer */}
                <div className="relative flex-1 h-full pl-2">
                  {/* APP 1: GAME CENTER & FPS TEST */}
                  {openApps.includes("GAME_CENTER") && (
                    <div
                      onClick={() => setFocusedApp("GAME_CENTER")}
                      className={`absolute inset-0 rounded-xl overflow-hidden flex flex-col border shadow-2xl transition-all ${
                        focusedApp === "GAME_CENTER"
                          ? "border-cyber-cyan/60 shadow-cyber-cyan/20 z-20"
                          : "border-slate-700/50 opacity-90 z-10"
                      } bg-[#0c121e]/95 backdrop-blur-xl`}
                    >
                      {/* Window Titlebar */}
                      <div className="h-9 px-3 bg-cyber-dark/80 border-b border-cyber-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-cyber-cyan" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            Game Center & Real-Time FPS Benchmark
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => closeApp("GAME_CENTER")}
                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Game Center Content */}
                      <div className="flex-1 p-3.5 overflow-y-auto flex flex-col lg:flex-row gap-3 text-xs">
                        {/* Left Side: Game Selection & Settings */}
                        <div className="w-full lg:w-72 flex flex-col gap-3">
                          {/* Game Selector */}
                          <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-3">
                            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Gamepad2 className="w-3.5 h-3.5 text-cyber-cyan" />
                              <span>Pilih Judul Game:</span>
                            </h4>
                            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                              {SIMULATED_GAMES.map((g) => (
                                <button
                                  key={g.id}
                                  onClick={() => {
                                    sound.playClick();
                                    setSelectedGameId(g.id);
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                                    selectedGameId === g.id
                                      ? "bg-cyber-cyan text-cyber-dark font-bold shadow-sm"
                                      : "bg-cyber-dark/60 text-slate-300 hover:bg-cyber-dark hover:text-white"
                                  }`}
                                >
                                  <span className="truncate">{g.title}</span>
                                  <span className="text-[9px] font-mono opacity-80 shrink-0 ml-1">
                                    {g.category}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Graphics Settings */}
                          <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-3 flex flex-col gap-2.5">
                            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-cyber-cyan" />
                              <span>Pengaturan Grafis:</span>
                            </h4>

                            {/* Resolution */}
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">
                                Resolusi Layar:
                              </span>
                              <div className="grid grid-cols-3 gap-1">
                                {(["1080p", "1440p", "4k"] as ResolutionSetting[]).map((r) => (
                                  <button
                                    key={r}
                                    onClick={() => {
                                      sound.playClick();
                                      setResolution(r);
                                    }}
                                    className={`py-1 rounded font-semibold text-[10px] uppercase transition-all ${
                                      resolution === r
                                        ? "bg-cyber-cyan text-cyber-dark font-bold"
                                        : "bg-cyber-dark/60 text-slate-300 hover:text-white"
                                    }`}
                                  >
                                    {r}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Preset */}
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">
                                Preset Grafis:
                              </span>
                              <div className="grid grid-cols-4 gap-1">
                                {(["Low", "Medium", "High", "Ultra"] as QualityPreset[]).map((p) => (
                                  <button
                                    key={p}
                                    onClick={() => {
                                      sound.playClick();
                                      setPreset(p);
                                    }}
                                    className={`py-1 rounded font-semibold text-[10px] transition-all ${
                                      preset === p
                                        ? "bg-cyber-cyan text-cyber-dark font-bold"
                                        : "bg-cyber-dark/60 text-slate-300 hover:text-white"
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Ray Tracing */}
                            <div className="flex items-center justify-between pt-1 border-t border-cyber-border/60">
                              <span className="text-[10px] text-slate-300 font-medium">
                                Ray Tracing:
                              </span>
                              <button
                                onClick={() => {
                                  sound.playClick();
                                  setRayTracing(!rayTracing);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  rayTracing
                                    ? "bg-amber-400 text-slate-900"
                                    : "bg-cyber-dark/80 text-slate-400"
                                }`}
                              >
                                {rayTracing ? "AKTIF (RTX ON)" : "NONAKTIF"}
                              </button>
                            </div>
                          </div>

                          {/* Quick Upgrade Callout */}
                          <div className="bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-xl p-2.5">
                            <p className="text-[10px] text-cyan-200 leading-snug mb-2">
                              Ingin FPS lebih tinggi atau test hardware lain?
                            </p>
                            <button
                              onClick={() => {
                                sound.playClick();
                                onBackToWorkbench();
                              }}
                              className="w-full py-1.5 rounded-lg bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark font-extrabold text-[11px] transition-all"
                            >
                              Ganti Hardware di Meja Kerja ↗
                            </button>
                          </div>
                        </div>

                        {/* Right Side: Gameplay Simulation & Live RivaTuner Overlay */}
                        <div className="flex-1 flex flex-col gap-3">
                          {/* Live Game Simulation Screen */}
                          <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-cyber-border bg-black shadow-lg">
                            <canvas
                              ref={canvasRef}
                              width={640}
                              height={320}
                              className="w-full h-full object-cover"
                            />

                            {/* RivaTuner / MSI Afterburner Style Live OSD Overlay */}
                            <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md rounded-lg p-2.5 font-mono text-[11px] border border-white/10 shadow-xl flex flex-col gap-1 min-w-[210px]">
                              {/* Big Live FPS Counter */}
                              <div className="flex items-baseline justify-between border-b border-white/10 pb-1 mb-0.5">
                                <span className="text-amber-400 font-bold text-xs">FPS:</span>
                                <div className="flex items-baseline gap-1">
                                  <span
                                    className={`text-lg font-black tracking-tight ${
                                      currentDisplayFps >= 100
                                        ? "text-emerald-400"
                                        : currentDisplayFps >= 60
                                        ? "text-cyber-cyan"
                                        : currentDisplayFps >= 30
                                        ? "text-amber-400"
                                        : "text-rose-500"
                                    }`}
                                  >
                                    {currentDisplayFps}
                                  </span>
                                  <span className="text-[9px] text-slate-400">
                                    (1%: {telemetry.onePercentLow})
                                  </span>
                                </div>
                              </div>

                              {/* Live Frametime */}
                              <div className="flex items-center justify-between text-[10px] text-slate-300">
                                <span className="text-slate-400">Frametime:</span>
                                <span className="font-semibold text-cyan-300">
                                  {telemetry.frametimeMs} ms
                                </span>
                              </div>

                              {/* Mini Frametime sparkline graph */}
                              <div className="flex items-end gap-0.5 h-4 w-full bg-slate-900/80 rounded px-1 py-0.5 border border-white/5">
                                {frametimeHistory.map((val, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      height: `${Math.min(100, Math.max(15, (val / 30) * 100))}%`,
                                    }}
                                    className="flex-1 bg-cyber-cyan rounded-t-xs"
                                  />
                                ))}
                              </div>

                              {/* GPU Telemetry */}
                              <div className="flex items-center justify-between text-[10px] pt-0.5 border-t border-white/10">
                                <span className="text-emerald-400 font-bold truncate max-w-[110px]">
                                  GPU: {telemetry.gpuName.split(" ")[0]}
                                </span>
                                <span className="text-white">
                                  {telemetry.gpuUsagePercent}% | {telemetry.gpuTempCelsius}°C
                                </span>
                              </div>

                              {/* VRAM Telemetry */}
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-400">VRAM:</span>
                                <span
                                  className={
                                    telemetry.vramOverloaded ? "text-rose-400 font-bold" : "text-slate-200"
                                  }
                                >
                                  {telemetry.vramUsedGb} / {telemetry.vramTotalGb} GB
                                </span>
                              </div>

                              {/* CPU Telemetry */}
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-cyan-400 font-bold truncate max-w-[110px]">
                                  CPU: {telemetry.cpuName.split(" ")[0]}
                                </span>
                                <span
                                  className={
                                    telemetry.cpuThrottling ? "text-rose-400 font-bold" : "text-white"
                                  }
                                >
                                  {telemetry.cpuUsagePercent}% | {telemetry.cpuTempCelsius}°C
                                </span>
                              </div>

                              {/* RAM Telemetry */}
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-400">RAM:</span>
                                <span className="text-slate-200">
                                  {telemetry.ramUsedGb} / {telemetry.ramTotalGb} GB (
                                  {telemetry.isDualChannel ? "Dual" : "Single"})
                                </span>
                              </div>
                            </div>

                            {/* Simulation Pause / Play button */}
                            <button
                              onClick={() => {
                                sound.playClick();
                                setIsPlayingGame(!isPlayingGame);
                              }}
                              className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-dark/85 hover:bg-cyber-dark border border-white/20 text-xs font-semibold text-white backdrop-blur-md"
                            >
                              {isPlayingGame ? (
                                <>
                                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Pause Test</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Lanjutkan</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Real-time Hardware Analysis Verdict Box */}
                          <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">Status Performa:</span>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold uppercase ${
                                    telemetry.evaluationVerdict === "Monster Gaming"
                                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                      : telemetry.evaluationVerdict === "Sangat Lancar"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                      : telemetry.evaluationVerdict === "Cukup Nyaman"
                                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                  }`}
                                >
                                  {telemetry.evaluationVerdict}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                Target: {resolution.toUpperCase()} • {preset}
                              </span>
                            </div>

                            {/* Diagnostics & Real-time Notes */}
                            <div className="flex flex-col gap-1.5">
                              {telemetry.diagnosticNotes.length > 0 ? (
                                telemetry.diagnosticNotes.map((note, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-1.5 text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                    <span>{note}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>
                                    Konfigurasi hardware bekerja optimal! Dual-channel RAM aktif dan
                                    suhu prosesor terjaga stabil.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP 2: TASK MANAGER & HARDWARE MONITOR */}
                  {openApps.includes("TASK_MANAGER") && (
                    <div
                      onClick={() => setFocusedApp("TASK_MANAGER")}
                      className={`absolute inset-0 rounded-xl overflow-hidden flex flex-col border shadow-2xl transition-all ${
                        focusedApp === "TASK_MANAGER"
                          ? "border-cyber-cyan/60 shadow-cyber-cyan/20 z-20"
                          : "border-slate-700/50 opacity-90 z-10"
                      } bg-[#0c121e]/95 backdrop-blur-xl`}
                    >
                      <div className="h-9 px-3 bg-cyber-dark/80 border-b border-cyber-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            Task Manager & Sensor Hardware
                          </span>
                        </div>
                        <button
                          onClick={() => closeApp("TASK_MANAGER")}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Tabs Bar */}
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-cyber-border/70 bg-cyber-dark/40 text-xs">
                        <button
                          onClick={() => setTaskManagerTab("PERFORMANCE")}
                          className={`px-3 py-1 rounded font-semibold transition-all ${
                            taskManagerTab === "PERFORMANCE"
                              ? "bg-cyber-cyan text-cyber-dark font-bold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Performa (Graphs)
                        </button>
                        <button
                          onClick={() => setTaskManagerTab("SENSORS")}
                          className={`px-3 py-1 rounded font-semibold transition-all ${
                            taskManagerTab === "SENSORS"
                              ? "bg-cyber-cyan text-cyber-dark font-bold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Suhu, Daya & Kipas
                        </button>
                        <button
                          onClick={() => setTaskManagerTab("HARDWARE")}
                          className={`px-3 py-1 rounded font-semibold transition-all ${
                            taskManagerTab === "HARDWARE"
                              ? "bg-cyber-cyan text-cyber-dark font-bold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Inventaris Slot PC
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="flex-1 p-4 overflow-y-auto text-xs">
                        {taskManagerTab === "PERFORMANCE" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* CPU Card */}
                            <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-3 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <Cpu className="w-4 h-4 text-cyber-cyan" />
                                  <span>CPU ({telemetry.cpuName})</span>
                                </span>
                                <span className="text-cyan-400 font-mono font-bold">
                                  {telemetry.cpuUsagePercent}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-cyber-cyan h-full rounded-full transition-all duration-300"
                                  style={{ width: `${telemetry.cpuUsagePercent}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Suhu: {telemetry.cpuTempCelsius}°C • Status:{" "}
                                {telemetry.cpuThrottling ? "Thermal Throttling ⚠️" : "Optimal ✅"}
                              </span>
                            </div>

                            {/* GPU Card */}
                            <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-3 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <Gamepad2 className="w-4 h-4 text-emerald-400" />
                                  <span>GPU ({telemetry.gpuName})</span>
                                </span>
                                <span className="text-emerald-400 font-mono font-bold">
                                  {telemetry.gpuUsagePercent}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${telemetry.gpuUsagePercent}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Suhu: {telemetry.gpuTempCelsius}°C • VRAM Terpakai:{" "}
                                {telemetry.vramUsedGb} / {telemetry.vramTotalGb} GB
                              </span>
                            </div>

                            {/* RAM Card */}
                            <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-3 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white">
                                  Memori RAM ({telemetry.ramTotalGb} GB Total)
                                </span>
                                <span className="text-indigo-400 font-mono font-bold">
                                  {Math.round((telemetry.ramUsedGb / telemetry.ramTotalGb) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.round(
                                      (telemetry.ramUsedGb / telemetry.ramTotalGb) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Mode: {telemetry.isDualChannel ? "Dual Channel (128-bit)" : "Single Channel (64-bit)"}
                              </span>
                            </div>

                            {/* Storage Card */}
                            <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-3 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white">Penyimpanan Utama (Disk C:)</span>
                                <span className="text-emerald-400 font-mono font-bold">Aktif</span>
                              </div>
                              <p className="text-[11px] text-slate-300">
                                Estimasi Waktu Muat Game:{" "}
                                <strong className="text-cyber-cyan">{telemetry.loadTimeSeconds}s</strong>
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {buildState.installedParts["storage_m2"]
                                  ? "NVMe M.2 SSD Terpasang (Ultra Cepat)"
                                  : "SATA Storage Terpasang"}
                              </span>
                            </div>
                          </div>
                        )}

                        {taskManagerTab === "SENSORS" && (
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="bg-cyber-card/60 p-3 rounded-xl border border-cyber-border">
                                <span className="text-[10px] text-slate-400 block">Suhu CPU</span>
                                <span className="text-lg font-bold font-mono text-cyan-400">
                                  {telemetry.cpuTempCelsius}°C
                                </span>
                              </div>
                              <div className="bg-cyber-card/60 p-3 rounded-xl border border-cyber-border">
                                <span className="text-[10px] text-slate-400 block">Suhu GPU</span>
                                <span className="text-lg font-bold font-mono text-emerald-400">
                                  {telemetry.gpuTempCelsius}°C
                                </span>
                              </div>
                              <div className="bg-cyber-card/60 p-3 rounded-xl border border-cyber-border">
                                <span className="text-[10px] text-slate-400 block">Total Daya Sistem</span>
                                <span className="text-lg font-bold font-mono text-amber-400">
                                  {telemetry.powerDrawWatts} W
                                </span>
                              </div>
                              <div className="bg-cyber-card/60 p-3 rounded-xl border border-cyber-border">
                                <span className="text-[10px] text-slate-400 block">Kipas Casing</span>
                                <span className="text-lg font-bold font-mono text-purple-400">
                                  {telemetry.cpuTempCelsius > 70 ? "1,850 RPM" : "1,200 RPM"}
                                </span>
                              </div>
                            </div>

                            <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-3">
                              <h5 className="font-bold text-white mb-1">Status Power Supply (PSU)</h5>
                              <p className="text-[11px] text-slate-300 mb-2">
                                Daya yang dibutuhkan rakitan: <strong>{telemetry.powerDrawWatts} Watt</strong>.
                              </p>
                              {telemetry.powerThrottling ? (
                                <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                                  ⚠️ Daya PSU tidak mencukupi! Komponen dibatasi oleh pasokan watt yang kurang.
                                </p>
                              ) : (
                                <p className="text-[11px] text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                  ✅ Kapasitas PSU mencukupi untuk operasional rakitan ini secara stabil.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {taskManagerTab === "HARDWARE" && (
                          <div className="space-y-2">
                            {Object.entries(buildState.installedParts).map(([slot, partId]) => {
                              const comp = getComponentById(partId);
                              if (!comp) return null;
                              return (
                                <div
                                  key={slot}
                                  className="flex items-center justify-between p-2 rounded-lg bg-cyber-dark/60 border border-cyber-border"
                                >
                                  <div>
                                    <span className="text-[10px] font-mono text-cyber-cyan uppercase block">
                                      {slot}
                                    </span>
                                    <span className="font-semibold text-white">{comp.name}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {comp.category}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* APP 3: THIS PC / DRIVES */}
                  {openApps.includes("DRIVES") && (
                    <div
                      onClick={() => setFocusedApp("DRIVES")}
                      className={`absolute inset-0 rounded-xl overflow-hidden flex flex-col border shadow-2xl transition-all ${
                        focusedApp === "DRIVES"
                          ? "border-cyber-cyan/60 shadow-cyber-cyan/20 z-20"
                          : "border-slate-700/50 opacity-90 z-10"
                      } bg-[#0c121e]/95 backdrop-blur-xl`}
                    >
                      <div className="h-9 px-3 bg-cyber-dark/80 border-b border-cyber-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            Penyimpanan & Drive (This PC)
                          </span>
                        </div>
                        <button
                          onClick={() => closeApp("DRIVES")}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-4 flex flex-col gap-4 text-xs">
                        {/* Drive C: */}
                        <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <HardDrive className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-white">Local Disk (C:) - OS & Games</span>
                              <span className="font-mono text-slate-400 text-[10px]">
                                {buildState.installedParts["storage_m2"]
                                  ? "M.2 NVMe PCIe 4.0 (7,400 MB/s)"
                                  : "SATA Storage (550 MB/s)"}
                              </span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mb-1">
                              <div className="bg-emerald-400 h-full w-[42%]" />
                            </div>
                            <span className="text-[10px] text-slate-400">
                              420 GB terpakai dari 1.000 GB
                            </span>
                          </div>
                        </div>

                        {/* Drive D: if SATA installed */}
                        {buildState.installedParts["storage_sata"] && (
                          <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                              <HardDrive className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">Secondary Disk (D:)</span>
                                <span className="font-mono text-slate-400 text-[10px]">SATA Drive</span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mb-1">
                                <div className="bg-blue-400 h-full w-[15%]" />
                              </div>
                              <span className="text-[10px] text-slate-400">
                                300 GB terpakai dari 2.000 GB
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* APP 4: SPECS (ABOUT THIS PC) */}
                  {openApps.includes("SPECS") && (
                    <div
                      onClick={() => setFocusedApp("SPECS")}
                      className={`absolute inset-0 rounded-xl overflow-hidden flex flex-col border shadow-2xl transition-all ${
                        focusedApp === "SPECS"
                          ? "border-cyber-cyan/60 shadow-cyber-cyan/20 z-20"
                          : "border-slate-700/50 opacity-90 z-10"
                      } bg-[#0c121e]/95 backdrop-blur-xl`}
                    >
                      <div className="h-9 px-3 bg-cyber-dark/80 border-b border-cyber-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            Spesifikasi Sistem Rakitan (About PC)
                          </span>
                        </div>
                        <button
                          onClick={() => closeApp("SPECS")}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-4 overflow-y-auto text-xs space-y-3">
                        <div className="bg-cyber-card/60 p-3 rounded-xl border border-cyber-border">
                          <h4 className="font-bold text-white text-sm mb-1">{buildState.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            Sistem Operasi Aktif: <strong>{currentOS}</strong>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-cyber-dark/60 p-2.5 rounded-lg border border-cyber-border">
                            <span className="text-[10px] text-slate-400 block">Prosesor (CPU)</span>
                            <span className="font-bold text-white">{telemetry.cpuName}</span>
                          </div>
                          <div className="bg-cyber-dark/60 p-2.5 rounded-lg border border-cyber-border">
                            <span className="text-[10px] text-slate-400 block">Kartu Grafis (GPU)</span>
                            <span className="font-bold text-white">{telemetry.gpuName}</span>
                          </div>
                          <div className="bg-cyber-dark/60 p-2.5 rounded-lg border border-cyber-border">
                            <span className="text-[10px] text-slate-400 block">Total RAM</span>
                            <span className="font-bold text-white">
                              {telemetry.ramTotalGb} GB ({telemetry.isDualChannel ? "Dual Channel" : "Single Channel"})
                            </span>
                          </div>
                          <div className="bg-cyber-dark/60 p-2.5 rounded-lg border border-cyber-border">
                            <span className="text-[10px] text-slate-400 block">Kapasitas VRAM</span>
                            <span className="font-bold text-white">{telemetry.vramTotalGb} GB GDDR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP 5: BROWSER */}
                  {openApps.includes("BROWSER") && (
                    <div
                      onClick={() => setFocusedApp("BROWSER")}
                      className={`absolute inset-0 rounded-xl overflow-hidden flex flex-col border shadow-2xl transition-all ${
                        focusedApp === "BROWSER"
                          ? "border-cyber-cyan/60 shadow-cyber-cyan/20 z-20"
                          : "border-slate-700/50 opacity-90 z-10"
                      } bg-[#0c121e]/95 backdrop-blur-xl`}
                    >
                      <div className="h-9 px-3 bg-cyber-dark/80 border-b border-cyber-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            WorkBrowser
                          </span>
                        </div>
                        <button
                          onClick={() => closeApp("BROWSER")}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* URL Bar */}
                      <div className="px-3 py-1.5 bg-cyber-dark/60 border-b border-cyber-border flex items-center gap-2 text-xs">
                        <div className="flex-1 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-2">
                          <Search className="w-3 h-3 text-slate-500" />
                          <span>https://hardware-benchmark.workgb.io/result</span>
                        </div>
                      </div>

                      <div className="p-4 overflow-y-auto text-xs space-y-3">
                        <div className="bg-cyber-card/60 p-4 rounded-xl border border-cyber-border">
                          <h3 className="text-sm font-bold text-cyber-cyan mb-1">
                            Laporan Kecepatan Browser & Kompatibilitas
                          </h3>
                          <p className="text-slate-300 text-[11px] leading-relaxed mb-3">
                            Rakitan Anda mampu memuat halaman web modern, rendering canvas WebGL,
                            dan kalkulasi komputasi tanpa lag.
                          </p>
                          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                            Status Koneksi: 1,000 Mbps Gigabit LAN • Latency: 4ms
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP 6: BUILD SCORE */}
                  {openApps.includes("SCORE") && (
                    <div
                      onClick={() => setFocusedApp("SCORE")}
                      className={`absolute inset-0 rounded-xl overflow-hidden flex flex-col border shadow-2xl transition-all ${
                        focusedApp === "SCORE"
                          ? "border-cyber-cyan/60 shadow-cyber-cyan/20 z-20"
                          : "border-slate-700/50 opacity-90 z-10"
                      } bg-[#0c121e]/95 backdrop-blur-xl`}
                    >
                      <div className="h-9 px-3 bg-cyber-dark/80 border-b border-cyber-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            Laporan Nilai Rakitan (Build Score)
                          </span>
                        </div>
                        <button
                          onClick={() => closeApp("SCORE")}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-5 overflow-y-auto text-xs flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl font-black text-slate-900 shadow-xl mb-3">
                          {scoreReport.grade}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          Skor Total: {scoreReport.totalScore} / 100
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mb-4">{scoreReport.summary}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md text-left mb-4">
                          <div className="bg-cyber-card/60 p-2.5 rounded-lg border border-cyber-border">
                            <span className="text-[10px] text-slate-400 block">Akurasi Rakit</span>
                            <span className="font-bold text-white">
                              {scoreReport.assemblyAccuracy}%
                            </span>
                          </div>
                          <div className="bg-cyber-card/60 p-2.5 rounded-lg border border-cyber-border">
                            <span className="text-[10px] text-slate-400 block">Kompatibilitas</span>
                            <span className="font-bold text-white">{scoreReport.compatibility}%</span>
                          </div>
                          <div className="bg-cyber-card/60 p-2.5 rounded-lg border border-cyber-border">
                            <span className="text-[10px] text-slate-400 block">Manajemen Kabel</span>
                            <span className="font-bold text-white">
                              {scoreReport.cableManagement}%
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            sound.playSuccess();
                            confetti({ particleCount: 70, spread: 60 });
                            onSaveCompletedBuild(scoreReport);
                          }}
                          className="px-6 py-2 rounded-xl bg-cyber-green hover:bg-emerald-400 text-cyber-dark font-extrabold text-xs transition-all shadow-lg"
                        >
                          Simpan Status Selesai ke Database 💾
                        </button>
                      </div>
                    </div>
                  )}

                  {/* APP 7: NOTEPAD */}
                  {openApps.includes("NOTEPAD") && (
                    <div
                      onClick={() => setFocusedApp("NOTEPAD")}
                      className={`absolute inset-0 rounded-xl overflow-hidden flex flex-col border shadow-2xl transition-all ${
                        focusedApp === "NOTEPAD"
                          ? "border-cyber-cyan/60 shadow-cyber-cyan/20 z-20"
                          : "border-slate-700/50 opacity-90 z-10"
                      } bg-[#0c121e]/95 backdrop-blur-xl`}
                    >
                      <div className="h-9 px-3 bg-cyber-dark/80 border-b border-cyber-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            WorkNotes - Editor Catatan PC
                          </span>
                        </div>
                        <button
                          onClick={() => closeApp("NOTEPAD")}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-3 flex-1 flex flex-col gap-2">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="flex-1 w-full p-3 rounded-lg bg-slate-950/80 border border-cyber-border/70 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyber-cyan resize-none"
                          placeholder="Tulis catatan rakitan PC Anda di sini..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Start Menu Popup */}
              {isStartMenuOpen && (
                <div
                  className={`absolute bottom-12 z-50 w-72 rounded-2xl border shadow-2xl p-4 flex flex-col gap-3 ${
                    currentOS === "WORK_98"
                      ? "left-2 bg-[#c0c0c0] border-t-white border-l-white border-b-black border-r-black text-black font-sans"
                      : "left-1/2 -translate-x-1/2 bg-[#0c121e]/95 border-cyber-border text-white backdrop-blur-2xl"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-xs">WorkGb PC Menu</span>
                    <span className="text-[10px] font-mono opacity-60">{currentOS}</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => openApp("GAME_CENTER")}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-xs text-left"
                    >
                      <Gamepad2 className="w-4 h-4 text-amber-400" />
                      <span>Game Center & FPS Tester</span>
                    </button>
                    <button
                      onClick={() => openApp("TASK_MANAGER")}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-xs text-left"
                    >
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>Task Manager</span>
                    </button>
                    <button
                      onClick={() => openApp("DRIVES")}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-xs text-left"
                    >
                      <HardDrive className="w-4 h-4 text-emerald-400" />
                      <span>Penyimpanan (Drives)</span>
                    </button>
                    <button
                      onClick={() => openApp("SPECS")}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-xs text-left"
                    >
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>Spesifikasi Hardware</span>
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onBackToWorkbench();
                      }}
                      className="text-[11px] text-cyber-cyan hover:underline flex items-center gap-1"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Meja Rakit</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playPowerSwitch();
                        onBackToWorkbench();
                      }}
                      className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Power className="w-3 h-3" />
                      <span>Shut Down</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom OS Taskbar / Dock */}
              <div
                className={`relative w-full z-30 select-none ${
                  currentOS === "WORKOS_11"
                    ? "h-11 bg-slate-950/85 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-4"
                    : currentOS === "WORK_LINUX"
                    ? "h-11 bg-[#1e0a24]/90 backdrop-blur-xl border-t border-orange-500/20 flex items-center justify-between px-4"
                    : currentOS === "WORK_MAC"
                    ? "h-12 bg-transparent flex items-center justify-center pb-2"
                    : "h-9 bg-[#c0c0c0] border-t-2 border-white border-b-2 border-black flex items-center justify-between px-2 text-black font-sans"
                }`}
              >
                {/* WorkOS 11 Taskbar */}
                {currentOS === "WORKOS_11" && (
                  <>
                    <div className="w-24" />
                    {/* Centered App Icons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setIsStartMenuOpen(!isStartMenuOpen);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-cyber-cyan"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openApp("GAME_CENTER")}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          openApps.includes("GAME_CENTER")
                            ? "bg-white/15 border-b-2 border-cyber-cyan text-white"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        <Gamepad2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openApp("TASK_MANAGER")}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          openApps.includes("TASK_MANAGER")
                            ? "bg-white/15 border-b-2 border-cyan-400 text-white"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openApp("DRIVES")}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          openApps.includes("DRIVES")
                            ? "bg-white/15 border-b-2 border-emerald-400 text-white"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        <HardDrive className="w-4 h-4" />
                      </button>
                    </div>
                    {/* System Tray */}
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
                      <span className="hidden sm:inline text-cyber-cyan">
                        {currentDisplayFps} FPS
                      </span>
                      <span>{currentTime}</span>
                    </div>
                  </>
                )}

                {/* Workmac Floating Glass Dock */}
                {currentOS === "WORK_MAC" && (
                  <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl px-4 py-1.5 flex items-center gap-3 shadow-2xl">
                    <button
                      onClick={() => openApp("GAME_CENTER")}
                      className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow hover:-translate-y-1 transition-transform"
                    >
                      <Gamepad2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openApp("TASK_MANAGER")}
                      className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow hover:-translate-y-1 transition-transform"
                    >
                      <Activity className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openApp("DRIVES")}
                      className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow hover:-translate-y-1 transition-transform"
                    >
                      <HardDrive className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openApp("SPECS")}
                      className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow hover:-translate-y-1 transition-transform"
                    >
                      <Cpu className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* WorkLinux Taskbar */}
                {currentOS === "WORK_LINUX" && (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
                        className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                      >
                        Apps
                      </button>
                      <button
                        onClick={() => openApp("GAME_CENTER")}
                        className="p-1 rounded hover:bg-white/10 text-white"
                      >
                        <Gamepad2 className="w-4 h-4 text-orange-400" />
                      </button>
                      <button
                        onClick={() => openApp("TASK_MANAGER")}
                        className="p-1 rounded hover:bg-white/10 text-white"
                      >
                        <Activity className="w-4 h-4 text-cyan-400" />
                      </button>
                    </div>
                    <div className="text-xs font-mono text-orange-200">{currentTime}</div>
                  </>
                )}

                {/* WorkRetro 98 Classic Taskbar */}
                {currentOS === "WORK_98" && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
                        className="px-2.5 py-0.5 bg-[#c0c0c0] border-t-white border-l-white border-b-black border-r-black border font-bold text-xs text-black flex items-center gap-1"
                      >
                        <span className="w-3 h-3 bg-red-500 inline-block" />
                        <span>Start</span>
                      </button>
                      <button
                        onClick={() => openApp("GAME_CENTER")}
                        className="px-2 py-0.5 bg-[#c0c0c0] border text-xs text-black"
                      >
                        Game Center
                      </button>
                    </div>
                    <div className="border border-inset border-gray-600 px-2 py-0.5 text-xs text-black font-mono">
                      {currentTime}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom Monitor Chin with Brand & Power LED */}
        <div className="relative mt-2 flex items-center justify-between px-4 text-[10px] font-mono text-slate-500">
          <span>WORKGB ULTRA-SHARP 165Hz IPS</span>
          <div className="flex items-center gap-1.5">
            <span>STANDBY</span>
            <span
              className={`w-2 h-2 rounded-full ${
                buildState.isPoweredOn
                  ? "bg-cyber-cyan shadow-[0_0_6px_#06b6d4]"
                  : "bg-cyber-amber shadow-[0_0_6px_#f59e0b]"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Monitor Stand Base */}
      <div className="flex flex-col items-center select-none">
        <div className="w-16 h-4 bg-gradient-to-b from-[#181d28] to-[#0f131a] border-x border-slate-700 shadow-lg" />
        <div className="w-48 h-2.5 rounded-full bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 border border-slate-700 shadow-xl" />
      </div>
    </div>
  );
}
