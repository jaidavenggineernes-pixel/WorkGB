import { PCComponent, InstalledPartsMap, CompatibilityError } from "./types";
import { getComponentById } from "./components-catalog";

export function checkComponentCompatibility(
  slot: string,
  candidateComponent: PCComponent,
  installedParts: InstalledPartsMap
): { compatible: boolean; error?: string } {
  // 1. Motherboard vs Case
  if (slot === "motherboard") {
    const pcCase = installedParts["case"] ? getComponentById(installedParts["case"]) : null;
    if (pcCase && candidateComponent.formFactor) {
      if (
        pcCase.supportedFormFactors &&
        !pcCase.supportedFormFactors.includes(candidateComponent.formFactor)
      ) {
        return {
          compatible: false,
          error: `Motherboard berukuran ${candidateComponent.formFactor} tidak muat dalam casing ${pcCase.name}! (Hanya mendukung: ${pcCase.supportedFormFactors.join(", ")})`,
        };
      }
    }
  }

  // 2. CPU vs Motherboard
  if (slot === "cpu") {
    const mb = installedParts["motherboard"] ? getComponentById(installedParts["motherboard"]) : null;
    if (mb && mb.socket && candidateComponent.socket) {
      if (mb.socket !== candidateComponent.socket) {
        return {
          compatible: false,
          error: `Socket prosesor (${candidateComponent.socket}) tidak cocok dengan socket motherboard (${mb.socket})!`,
        };
      }
    }
  }

  // 3. RAM vs Motherboard
  if (slot === "ram_1" || slot === "ram_2") {
    const mb = installedParts["motherboard"] ? getComponentById(installedParts["motherboard"]) : null;
    if (mb && mb.memoryType && candidateComponent.memoryType) {
      if (mb.memoryType !== candidateComponent.memoryType) {
        return {
          compatible: false,
          error: `RAM ${candidateComponent.memoryType} tidak dapat dipasang pada motherboard ber-slot ${mb.memoryType}!`,
        };
      }
    }
  }

  // 4. Cooler vs Motherboard & CPU
  if (slot === "cooler") {
    const mb = installedParts["motherboard"] ? getComponentById(installedParts["motherboard"]) : null;
    const cpu = installedParts["cpu"] ? getComponentById(installedParts["cpu"]) : null;

    if (mb && mb.socket && candidateComponent.supportedSockets) {
      if (!candidateComponent.supportedSockets.includes(mb.socket)) {
        return {
          compatible: false,
          error: `Bracket pendingin ini tidak mendukung socket ${mb.socket} motherboard!`,
        };
      }
    }

    if (cpu && candidateComponent.coolerMaxTdp && cpu.powerWattage) {
      if (candidateComponent.coolerMaxTdp < cpu.powerWattage) {
        return {
          compatible: false,
          error: `Cooler ini hanya mendukung TDP hingga ${candidateComponent.coolerMaxTdp}W, sedangkan CPU membutuhkan ${cpu.powerWattage}W! (Risiko Thermal Throttling ekstrim)`,
        };
      }
    }
  }

  // 5. GPU vs Case
  if (slot === "gpu") {
    const pcCase = installedParts["case"] ? getComponentById(installedParts["case"]) : null;
    if (pcCase && pcCase.maxGpuLengthMm && candidateComponent.gpuLengthMm) {
      if (candidateComponent.gpuLengthMm > pcCase.maxGpuLengthMm) {
        return {
          compatible: false,
          error: `Panjang GPU (${candidateComponent.gpuLengthMm}mm) melebihi batas maksimum casing (${pcCase.maxGpuLengthMm}mm)!`,
        };
      }
    }
  }

  // 6. Case changed while parts already installed
  if (slot === "case") {
    const mb = installedParts["motherboard"] ? getComponentById(installedParts["motherboard"]) : null;
    if (mb && mb.formFactor && candidateComponent.supportedFormFactors) {
      if (!candidateComponent.supportedFormFactors.includes(mb.formFactor)) {
        return {
          compatible: false,
          error: `Casing baru ini tidak muat untuk motherboard ${mb.formFactor} yang sudah terpasang!`,
        };
      }
    }
  }

  return { compatible: true };
}

export function calculateTotalWattage(installedParts: InstalledPartsMap): number {
  let total = 0;
  for (const compId of Object.values(installedParts)) {
    const comp = getComponentById(compId);
    if (comp) {
      total += comp.powerWattage || 0;
    }
  }
  // Add base motherboard + chipset + fan overhead: 60W
  return total + 60;
}

export function validateFullBuild(installedParts: InstalledPartsMap): {
  isValid: boolean;
  errors: CompatibilityError[];
  score: number;
  totalWattage: number;
} {
  const errors: CompatibilityError[] = [];
  const cpu = installedParts["cpu"] ? getComponentById(installedParts["cpu"]) : null;
  const mb = installedParts["motherboard"] ? getComponentById(installedParts["motherboard"]) : null;
  const pcCase = installedParts["case"] ? getComponentById(installedParts["case"]) : null;
  const cooler = installedParts["cooler"] ? getComponentById(installedParts["cooler"]) : null;
  const psu = installedParts["psu"] ? getComponentById(installedParts["psu"]) : null;
  const gpu = installedParts["gpu"] ? getComponentById(installedParts["gpu"]) : null;
  const ram1 = installedParts["ram_1"] ? getComponentById(installedParts["ram_1"]) : null;

  // CPU vs MB Socket
  if (cpu && mb && cpu.socket !== mb.socket) {
    errors.push({
      slot: "cpu",
      message: `Ketidakcocokan Socket: CPU ${cpu.name} (${cpu.socket}) tidak cocok dengan Motherboard ${mb.name} (${mb.socket})`,
      severity: "error",
    });
  }

  // RAM vs MB DDR
  if (ram1 && mb && ram1.memoryType !== mb.memoryType) {
    errors.push({
      slot: "ram_1",
      message: `Ketidakcocokan RAM: ${ram1.memoryType} tidak cocok dengan slot ${mb.memoryType} motherboard`,
      severity: "error",
    });
  }

  // MB vs Case Form Factor
  if (mb && pcCase && mb.formFactor && pcCase.supportedFormFactors) {
    if (!pcCase.supportedFormFactors.includes(mb.formFactor)) {
      errors.push({
        slot: "motherboard",
        message: `Ukuran Motherboard ${mb.formFactor} tidak cocok dengan Casing ${pcCase.name}`,
        severity: "error",
      });
    }
  }

  // Cooler socket
  if (cooler && mb && mb.socket && cooler.supportedSockets) {
    if (!cooler.supportedSockets.includes(mb.socket)) {
      errors.push({
        slot: "cooler",
        message: `Cooler ${cooler.name} tidak memiliki bracket untuk socket ${mb.socket}`,
        severity: "error",
      });
    }
  }

  // GPU clearance
  if (gpu && pcCase && gpu.gpuLengthMm && pcCase.maxGpuLengthMm) {
    if (gpu.gpuLengthMm > pcCase.maxGpuLengthMm) {
      errors.push({
        slot: "gpu",
        message: `GPU terlalu panjang (${gpu.gpuLengthMm}mm) untuk casing (${pcCase.maxGpuLengthMm}mm)`,
        severity: "error",
      });
    }
  }

  // PSU capacity
  const totalWattage = calculateTotalWattage(installedParts);
  if (psu && psu.psuWattage) {
    if (psu.psuWattage < totalWattage) {
      errors.push({
        slot: "psu",
        message: `Daya PSU tidak memadai! Sistem membutuhkan ~${totalWattage}W, tetapi PSU hanya ${psu.psuWattage}W`,
        severity: "error",
      });
    } else if (psu.psuWattage < totalWattage + 50) {
      errors.push({
        slot: "psu",
        message: `Peringatan PSU: Headroom daya tipis (~${totalWattage}W dari kapasitas ${psu.psuWattage}W)`,
        severity: "warning",
      });
    }
  }

  const criticalErrors = errors.filter((e) => e.severity === "error").length;
  let score = 100 - criticalErrors * 25 - errors.filter((e) => e.severity === "warning").length * 10;
  if (score < 0) score = 0;

  return {
    isValid: criticalErrors === 0,
    errors,
    score,
    totalWattage,
  };
}
