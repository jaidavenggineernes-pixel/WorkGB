import { BuildState, ScoreReport, BenchmarkResult } from "./types";
import { validateFullBuild } from "./compatibility";
import { getComponentById } from "./components-catalog";

export function calculateBuildScore(state: BuildState): ScoreReport {
  const compValidation = validateFullBuild(state.installedParts);
  const compatibilityScore = compValidation.score;

  // Accuracy penalizes misclicks and incompatible installation attempts
  const accuracy = Math.max(40, 100 - state.errorsCount * 6);

  // Cable management score
  let cableScore = state.cablesConnected ? 95 : 0;
  if (state.installedParts["case"]?.includes("lianli") || state.installedParts["case"]?.includes("nzxt")) {
    cableScore = Math.min(100, cableScore + 5);
  }

  // Weighted total score
  const total = Math.round(accuracy * 0.35 + compatibilityScore * 0.45 + cableScore * 0.2);

  let grade: ScoreReport["grade"] = "F";
  if (total >= 97) grade = "S+";
  else if (total >= 92) grade = "S";
  else if (total >= 85) grade = "A+";
  else if (total >= 75) grade = "A";
  else if (total >= 60) grade = "B";
  else if (total >= 50) grade = "C";

  // Build time format
  const mins = Math.floor(state.buildTimeSeconds / 60);
  const secs = state.buildTimeSeconds % 60;
  const timeFormatted = `${mins}m ${secs}s`;

  let summary = "Perakitan PC luar biasa sempurna tanpa kompromi!";
  if (state.errorsCount > 2) {
    summary = "Perakitan berhasil, namun ada beberapa percobaan komponen yang kurang tepat.";
  }
  if (!compValidation.isValid) {
    summary = "PC mengalami kendala kompatibilitas pada komponen tertentu!";
  }

  return {
    grade,
    assemblyAccuracy: accuracy,
    compatibility: compatibilityScore,
    cableManagement: cableScore,
    errors: state.errorsCount,
    buildTime: timeFormatted,
    totalScore: total,
    summary,
  };
}

export function runBenchmarkSimulation(state: BuildState): BenchmarkResult {
  const cpu = state.installedParts["cpu"] ? getComponentById(state.installedParts["cpu"]) : null;
  const gpu = state.installedParts["gpu"] ? getComponentById(state.installedParts["gpu"]) : null;
  const cooler = state.installedParts["cooler"] ? getComponentById(state.installedParts["cooler"]) : null;

  const baseCpuScore = cpu?.benchmarkScore || 5000;
  const baseGpuScore = gpu?.benchmarkScore || 6000;

  // Calculate temperatures
  let cpuTemp = 42; // idle
  if (cooler?.coolerType === "AIO Liquid Cooler") {
    cpuTemp = 58;
  } else if (cooler?.coolerType === "Air Cooler") {
    cpuTemp = 68;
  } else {
    cpuTemp = 78;
  }

  let gpuTemp = 65;
  if (gpu?.id.includes("4090")) gpuTemp = 72;

  // Calculate FPS estimates
  const fps1080p = Math.round((baseGpuScore / 100) * 1.6 + (baseCpuScore / 200));
  const fps1440p = Math.round((baseGpuScore / 100) * 1.1 + (baseCpuScore / 300));
  const fps4k = Math.max(30, Math.round((baseGpuScore / 100) * 0.65));

  const systemPower = (cpu?.powerWattage || 65) + (gpu?.powerWattage || 150) + 70;

  return {
    cpuScore: baseCpuScore,
    gpuScore: baseGpuScore,
    fps1080p,
    fps1440p,
    fps4k,
    cpuTempCelsius: cpuTemp,
    gpuTempCelsius: gpuTemp,
    systemPowerWatts: systemPower,
  };
}
