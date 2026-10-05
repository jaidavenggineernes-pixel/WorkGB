import { BuildState, SlotKey } from "./types";
import { validateFullBuild } from "./compatibility";

export const REQUIRED_SLOTS: SlotKey[] = [
  "case",
  "motherboard",
  "cpu",
  "cooler",
  "ram_1",
  "storage_m2",
  "psu",
  "gpu",
];

export function getInitialBuildState(name: string = "PC Rakitan Baru"): BuildState {
  return {
    name,
    status: "IN_PROGRESS",
    progress: 0,
    accuracyScore: 100,
    compatibilityScore: 100,
    cableScore: 100,
    errorsCount: 0,
    buildTimeSeconds: 0,
    isPoweredOn: false,
    currentStep: 1,
    caseClosed: false,
    thermalPasteApplied: false,
    cablesConnected: false,
    installedParts: {},
  };
}

export function calculateBuildProgress(state: BuildState): number {
  let score = 0;
  const totalWeight = 12; // 8 required slots + thermal paste + cables + fans + closed case

  // Count installed required slots (8 slots = 8 weight)
  for (const slot of REQUIRED_SLOTS) {
    if (state.installedParts[slot]) {
      score += 1;
    }
  }

  // Thermal paste = 1 weight
  if (state.thermalPasteApplied) {
    score += 1;
  }

  // Cables connected = 1 weight
  if (state.cablesConnected) {
    score += 1;
  }

  // Extra fan = 0.5 each (max 1)
  if (state.installedParts["fan_front"] || state.installedParts["fan_rear"]) {
    score += 1;
  }

  // Case closed = 1 weight
  if (state.caseClosed) {
    score += 1;
  }

  const percent = Math.min(100, Math.round((score / totalWeight) * 100));
  return percent;
}

export function canPowerOn(state: BuildState): { canBoot: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!state.installedParts["case"]) missing.push("Casing PC");
  if (!state.installedParts["motherboard"]) missing.push("Motherboard");
  if (!state.installedParts["cpu"]) missing.push("Prosesor (CPU)");
  if (!state.thermalPasteApplied) missing.push("Thermal Paste");
  if (!state.installedParts["cooler"]) missing.push("CPU Cooler");
  if (!state.installedParts["ram_1"]) missing.push("RAM (Minimal Slot 1)");
  if (!state.installedParts["storage_m2"] && !state.installedParts["storage_sata"]) {
    missing.push("Penyimpanan (M.2 NVMe / SSD)");
  }
  if (!state.installedParts["psu"]) missing.push("Power Supply (PSU)");
  if (!state.installedParts["gpu"]) missing.push("Kartu Grafis (GPU)");
  if (!state.cablesConnected) missing.push("Kabel Daya PSU (Motherboard, CPU, GPU)");

  // Check critical compatibility
  const comp = validateFullBuild(state.installedParts);
  const criticalErrors = comp.errors.filter((e) => e.severity === "error");
  if (criticalErrors.length > 0) {
    criticalErrors.forEach((e) => missing.push(`[Error Kompatibilitas] ${e.message}`));
  }

  return {
    canBoot: missing.length === 0,
    missing,
  };
}
