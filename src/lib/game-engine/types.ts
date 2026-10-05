export type ComponentCategory =
  | "CPU"
  | "MOTHERBOARD"
  | "RAM"
  | "GPU"
  | "STORAGE"
  | "PSU"
  | "COOLER"
  | "CASE"
  | "FAN";

export type CpuSocket = "AM4" | "AM5" | "LGA1700";
export type FormFactor = "ATX" | "Micro-ATX" | "Mini-ITX";
export type MemoryType = "DDR4" | "DDR5";
export type StorageType = "NVMe M.2" | "SATA SSD" | "HDD 3.5";

export interface PCComponent {
  id: string;
  name: string;
  brand: string;
  category: ComponentCategory;
  price: number; // in IDR or credits
  image?: string;
  description: string;
  powerWattage: number; // TDP or wattage drawn
  
  // Specifications
  socket?: CpuSocket;
  supportedSockets?: CpuSocket[];
  formFactor?: FormFactor;
  supportedFormFactors?: FormFactor[];
  memoryType?: MemoryType;
  memorySpeedMhz?: number;
  memoryCapacityGb?: number;
  storageType?: StorageType;
  storageCapacityGb?: number;
  gpuLengthMm?: number;
  maxGpuLengthMm?: number;
  psuWattage?: number;
  efficiencyRating?: string;
  coolerType?: "Air Cooler" | "AIO Liquid Cooler" | "Stock Cooler";
  coolerMaxTdp?: number;
  fanSizeMm?: number;
  rgb?: boolean;
  benchmarkScore?: number; // relative power for Cinebench/3DMark simulator
}

export type SlotKey =
  | "case"
  | "motherboard"
  | "cpu"
  | "cooler"
  | "ram_1"
  | "ram_2"
  | "storage_m2"
  | "storage_sata"
  | "psu"
  | "gpu"
  | "fan_front"
  | "fan_rear";

export interface InstalledPartsMap {
  [key: string]: string; // slotKey -> componentId
}

export interface BuildState {
  id?: string;
  name: string;
  status: "IN_PROGRESS" | "COMPLETED";
  progress: number;
  score?: string;
  accuracyScore: number;
  compatibilityScore: number;
  cableScore: number;
  errorsCount: number;
  buildTimeSeconds: number;
  isPoweredOn: boolean;
  currentStep: number;
  caseClosed: boolean;
  thermalPasteApplied: boolean;
  cablesConnected: boolean;
  installedParts: InstalledPartsMap;
}

export interface CompatibilityError {
  slot: SlotKey | "general";
  message: string;
  severity: "error" | "warning";
}

export interface ScoreReport {
  grade: "S+" | "S" | "A+" | "A" | "B" | "C" | "F";
  assemblyAccuracy: number;
  compatibility: number;
  cableManagement: number;
  errors: number;
  buildTime: string;
  totalScore: number;
  summary: string;
}

export interface BenchmarkResult {
  cpuScore: number;
  gpuScore: number;
  fps1080p: number;
  fps1440p: number;
  fps4k: number;
  cpuTempCelsius: number;
  gpuTempCelsius: number;
  systemPowerWatts: number;
}
