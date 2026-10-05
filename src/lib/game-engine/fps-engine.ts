import { BuildState } from "./types";
import { getComponentById } from "./components-catalog";

export interface GameDefinition {
  id: string;
  title: string;
  category: "AAA Heavy" | "eSports High-FPS" | "Open World" | "Next-Gen UE5";
  bannerColor: string;
  baseRequirement: {
    minGpuScore: number;
    recommendedGpuScore: number;
    recommendedVramGb: number;
    minRamGb: number;
    recommendedRamGb: number;
    cpuWeight: number; // 0 to 1 (how much CPU affects FPS)
    gpuWeight: number; // 0 to 1
  };
}

export const SIMULATED_GAMES: GameDefinition[] = [
  {
    id: "cyberpunk",
    title: "Cyberpunk 2077: Phantom Liberty",
    category: "AAA Heavy",
    bannerColor: "from-yellow-500/20 to-red-500/20",
    baseRequirement: {
      minGpuScore: 4000,
      recommendedGpuScore: 16000,
      recommendedVramGb: 12,
      minRamGb: 16,
      recommendedRamGb: 32,
      cpuWeight: 0.25,
      gpuWeight: 0.75,
    },
  },
  {
    id: "blackmyth",
    title: "Black Myth: Wukong (UE5)",
    category: "Next-Gen UE5",
    bannerColor: "from-amber-600/20 to-stone-900/40",
    baseRequirement: {
      minGpuScore: 5000,
      recommendedGpuScore: 18000,
      recommendedVramGb: 16,
      minRamGb: 16,
      recommendedRamGb: 32,
      cpuWeight: 0.2,
      gpuWeight: 0.8,
    },
  },
  {
    id: "cs2",
    title: "Counter-Strike 2",
    category: "eSports High-FPS",
    bannerColor: "from-orange-500/20 to-blue-600/20",
    baseRequirement: {
      minGpuScore: 2500,
      recommendedGpuScore: 8000,
      recommendedVramGb: 6,
      minRamGb: 8,
      recommendedRamGb: 16,
      cpuWeight: 0.55,
      gpuWeight: 0.45,
    },
  },
  {
    id: "valorant",
    title: "Valorant",
    category: "eSports High-FPS",
    bannerColor: "from-rose-600/20 to-slate-900/40",
    baseRequirement: {
      minGpuScore: 1800,
      recommendedGpuScore: 5000,
      recommendedVramGb: 4,
      minRamGb: 8,
      recommendedRamGb: 16,
      cpuWeight: 0.7,
      gpuWeight: 0.3,
    },
  },
  {
    id: "forza",
    title: "Forza Horizon 5",
    category: "Open World",
    bannerColor: "from-pink-500/20 to-orange-500/20",
    baseRequirement: {
      minGpuScore: 3500,
      recommendedGpuScore: 12000,
      recommendedVramGb: 8,
      minRamGb: 16,
      recommendedRamGb: 32,
      cpuWeight: 0.3,
      gpuWeight: 0.7,
    },
  },
  {
    id: "gtav",
    title: "Grand Theft Auto V: Enhanced",
    category: "Open World",
    bannerColor: "from-emerald-600/20 to-teal-900/40",
    baseRequirement: {
      minGpuScore: 2000,
      recommendedGpuScore: 7000,
      recommendedVramGb: 6,
      minRamGb: 8,
      recommendedRamGb: 16,
      cpuWeight: 0.4,
      gpuWeight: 0.6,
    },
  },
];

export type ResolutionSetting = "1080p" | "1440p" | "4k";
export type QualityPreset = "Low" | "Medium" | "High" | "Ultra";

export interface LiveFpsTelemetry {
  gameTitle: string;
  resolution: ResolutionSetting;
  preset: QualityPreset;
  rayTracing: boolean;
  fps: number;
  onePercentLow: number;
  frametimeMs: number;
  cpuName: string;
  cpuUsagePercent: number;
  cpuTempCelsius: number;
  cpuThrottling: boolean;
  gpuName: string;
  gpuUsagePercent: number;
  gpuTempCelsius: number;
  vramUsedGb: number;
  vramTotalGb: number;
  vramOverloaded: boolean;
  ramTotalGb: number;
  ramUsedGb: number;
  isDualChannel: boolean;
  loadTimeSeconds: number;
  powerDrawWatts: number;
  powerThrottling: boolean;
  evaluationVerdict: "Monster Gaming" | "Sangat Lancar" | "Cukup Nyaman" | "Lag / Butuh Upgrade" | "Tidak Kuat";
  diagnosticNotes: string[];
}

export function calculateRealtimeFps(
  state: BuildState,
  gameId: string,
  resolution: ResolutionSetting = "1080p",
  preset: QualityPreset = "High",
  rayTracing: boolean = false
): LiveFpsTelemetry {
  const game = SIMULATED_GAMES.find((g) => g.id === gameId) || SIMULATED_GAMES[0];

  const cpu = state.installedParts["cpu"] ? getComponentById(state.installedParts["cpu"]) : null;
  const gpu = state.installedParts["gpu"] ? getComponentById(state.installedParts["gpu"]) : null;
  const ram1 = state.installedParts["ram_1"] ? getComponentById(state.installedParts["ram_1"]) : null;
  const ram2 = state.installedParts["ram_2"] ? getComponentById(state.installedParts["ram_2"]) : null;
  const cooler = state.installedParts["cooler"] ? getComponentById(state.installedParts["cooler"]) : null;
  const m2 = state.installedParts["storage_m2"] ? getComponentById(state.installedParts["storage_m2"]) : null;
  const sata = state.installedParts["storage_sata"] ? getComponentById(state.installedParts["storage_sata"]) : null;
  const psu = state.installedParts["psu"] ? getComponentById(state.installedParts["psu"]) : null;

  // 1. Calculate RAM
  const parseRamGb = (c: typeof ram1) => {
    if (!c) return 0;
    if (c.memoryCapacityGb) return c.memoryCapacityGb;
    if (c.name.includes("64GB")) return 64;
    if (c.name.includes("32GB")) return 32;
    if (c.name.includes("16GB")) return 16;
    if (c.name.includes("8GB")) return 8;
    return 16;
  };
  const ram1Gb = parseRamGb(ram1);
  const ram2Gb = parseRamGb(ram2);
  const ramTotalGb = ram1Gb + ram2Gb || 8;
  const isDualChannel = Boolean(ram1 && ram2);

  // 2. Calculate VRAM
  const parseVramGb = (c: typeof gpu) => {
    if (!c) return 2; // Integrated graphics
    const text = `${c.name} ${c.description}`;
    const match = text.match(/(\d+)\s*GB/i);
    if (match) return parseInt(match[1]);
    return 8;
  };
  const vramTotalGb = parseVramGb(gpu);

  // 3. Base Scores
  const cpuScore = cpu?.benchmarkScore || 4000;
  const gpuScore = gpu?.benchmarkScore || 800; // Integrated GPU is very weak

  // 4. Resolution & Preset Multipliers
  const resMultiplier = resolution === "1080p" ? 1.0 : resolution === "1440p" ? 0.72 : 0.42;
  const presetMultiplier =
    preset === "Low" ? 1.35 : preset === "Medium" ? 1.15 : preset === "High" ? 1.0 : 0.82;
  const rtPenalty = rayTracing ? 0.65 : 1.0;

  // 5. Raw Target FPS
  const req = game.baseRequirement;
  let rawFps =
    ((gpuScore / 100) * req.gpuWeight * 1.5 + (cpuScore / 120) * req.cpuWeight * 1.8) *
    resMultiplier *
    presetMultiplier *
    rtPenalty;

  // High FPS games scaling (CS2 & Valorant push higher frames)
  if (game.id === "valorant") rawFps *= 1.6;
  if (game.id === "cs2") rawFps *= 1.3;

  // 6. Dual Channel & RAM Penalties
  let ramFactor = 1.0;
  const notes: string[] = [];

  if (isDualChannel) {
    ramFactor += 0.12; // +12% performance boost from dual channel
  } else {
    ramFactor -= 0.12;
    notes.push("RAM berjalan dalam mode Single Channel (1 keping). Pasang keping RAM kedua untuk boost performa hingga +15%!");
  }

  if (ramTotalGb < req.minRamGb) {
    ramFactor -= 0.25;
    notes.push(`Kapasitas RAM (${ramTotalGb} GB) di bawah batas minimum game (${req.minRamGb} GB). Terjadi stuttering memory.`);
  }

  // 7. VRAM Overload check
  let vramDemand =
    (game.id === "cyberpunk" || game.id === "blackmyth" ? 8 : 4) *
    (resolution === "4k" ? 1.6 : resolution === "1440p" ? 1.25 : 1.0) *
    (preset === "Ultra" ? 1.3 : 1.0) *
    (rayTracing ? 1.2 : 1.0);
  vramDemand = Math.round(vramDemand * 10) / 10;
  const vramUsedGb = Math.min(vramDemand, vramTotalGb);
  const vramOverloaded = vramDemand > vramTotalGb;

  let vramPenalty = 1.0;
  if (vramOverloaded) {
    vramPenalty = 0.55; // 45% hit when running out of VRAM (swapping to system RAM)
    notes.push(`VRAM tidak mencukupi (${vramTotalGb} GB VRAM terpasang vs ${vramDemand} GB dibutuhkan). Terjadi penurunan FPS drastis.`);
  }

  // 8. CPU Cooler & Thermal Paste
  let cpuTemp = 40; // idle
  let cpuThrottling = false;
  if (!state.thermalPasteApplied) {
    cpuTemp = 96; // Severe thermal throttling
    cpuThrottling = true;
    notes.push("PERINGATAN: Thermal paste belum dioleskan! CPU mengalami Thermal Throttling parah (96°C) dan menurunkan FPS.");
  } else if (!cooler) {
    cpuTemp = 92;
    cpuThrottling = true;
    notes.push("PERINGATAN: Pendingin CPU belum terpasang! Suhu kritis.");
  } else if (cooler.coolerType === "Stock Cooler") {
    cpuTemp = cpuScore > 20000 ? 84 : 72;
    if (cpuScore > 20000) {
      notes.push("Stock cooler kewalahan mendinginkan prosesor kelas atas. Pertimbangkan upgrade ke AIO Liquid Cooler.");
    }
  } else if (cooler.coolerType === "Air Cooler") {
    cpuTemp = cpuScore > 20000 ? 73 : 62;
  } else {
    // AIO Liquid
    cpuTemp = cpuScore > 20000 ? 64 : 52;
  }

  const thermalFactor = cpuThrottling ? 0.6 : 1.0;

  // 9. Power Supply (PSU) check
  const totalPowerDraw = (cpu?.powerWattage || 65) + (gpu?.powerWattage || 150) + 70;
  const psuWatt = psu?.psuWattage || psu?.powerWattage || 450;
  const powerThrottling = totalPowerDraw > psuWatt;
  const psuFactor = powerThrottling ? 0.7 : 1.0;

  if (powerThrottling) {
    notes.push(`Kebutuhan daya (${totalPowerDraw}W) melebihi kapasitas PSU (${psuWatt}W). Komponen mengalami under-power throttling!`);
  }

  // 10. Final FPS calculation
  let finalFps = Math.max(5, Math.round(rawFps * ramFactor * vramPenalty * thermalFactor * psuFactor));
  let onePercentLow = Math.max(2, Math.round(finalFps * (isDualChannel ? 0.8 : 0.62) * (vramOverloaded ? 0.45 : 0.85)));

  // If no dedicated GPU is installed
  if (!gpu) {
    finalFps = Math.min(28, Math.max(4, Math.round(finalFps * 0.2)));
    onePercentLow = Math.max(1, Math.round(finalFps * 0.5));
    notes.push("Tidak ada GPU terpisah yang terpasang! Menggunakan grafis terintegrasi dengan performa terbatas.");
  }

  // 11. Storage Loading Time
  let loadTimeSeconds = 3.2;
  if (m2) {
    loadTimeSeconds = m2.name.includes("Gen4") ? 1.8 : 2.6;
  } else if (sata) {
    loadTimeSeconds = sata.name.includes("HDD") ? 18.5 : 7.2;
    if (sata.name.includes("HDD")) {
      notes.push("Game dimuat dari Hard Disk (HDD). Waktu loading lebih lambat dibanding SSD NVMe.");
    }
  }

  // 12. Evaluation Verdict
  let verdict: LiveFpsTelemetry["evaluationVerdict"] = "Sangat Lancar";
  if (finalFps >= 120) {
    verdict = "Monster Gaming";
  } else if (finalFps >= 60) {
    verdict = "Sangat Lancar";
  } else if (finalFps >= 35) {
    verdict = "Cukup Nyaman";
  } else if (finalFps >= 20) {
    verdict = "Lag / Butuh Upgrade";
  } else {
    verdict = "Tidak Kuat";
  }

  return {
    gameTitle: game.title,
    resolution,
    preset,
    rayTracing,
    fps: finalFps,
    onePercentLow,
    frametimeMs: Math.round((1000 / Math.max(finalFps, 1)) * 10) / 10,
    cpuName: cpu ? cpu.name : "Prosesor Generik",
    cpuUsagePercent: Math.min(99, Math.round(40 + (req.cpuWeight * 45) + (finalFps > 140 ? 25 : 0))),
    cpuTempCelsius: cpuTemp,
    cpuThrottling,
    gpuName: gpu ? gpu.name : "Integrated Graphics (Tanpa GPU)",
    gpuUsagePercent: gpu ? (resolution === "4k" || preset === "Ultra" ? 99 : 94) : 99,
    gpuTempCelsius: gpu ? (gpu.name.includes("4090") ? 71 : 64) : 48,
    vramUsedGb,
    vramTotalGb,
    vramOverloaded,
    ramTotalGb,
    ramUsedGb: Math.min(ramTotalGb, Math.round((req.recommendedRamGb * 0.45 + 3.5) * 10) / 10),
    isDualChannel,
    loadTimeSeconds,
    powerDrawWatts: totalPowerDraw,
    powerThrottling,
    evaluationVerdict: verdict,
    diagnosticNotes: notes,
  };
}
