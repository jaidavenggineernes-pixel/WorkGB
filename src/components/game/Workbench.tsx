"use client";

import React, { useState } from "react";
import {
  BuildState,
  SlotKey,
} from "@/lib/game-engine/types";
import { getComponentById } from "@/lib/game-engine/components-catalog";
import { sound } from "@/lib/sound/sound-engine";
import {
  Cpu,
  Fan,
  Zap,
  Layers,
  Sparkles,
  Power,
  Shield,
  Cable,
  HardDrive,
  Monitor,
} from "lucide-react";

interface WorkbenchProps {
  buildState: BuildState;
  activeSlot: SlotKey | null;
  onSelectSlot: (slot: SlotKey) => void;
  onApplyThermalPaste: () => void;
  onConnectCables: () => void;
  onToggleCaseGlass: () => void;
  onPowerOn: () => void;
  onRemovePart: (slot: SlotKey) => void;
  onOpenMonitor?: () => void;
}

export default function Workbench({
  buildState,
  activeSlot,
  onSelectSlot,
  onApplyThermalPaste,
  onConnectCables,
  onToggleCaseGlass,
  onPowerOn,
  onOpenMonitor,
}: WorkbenchProps) {
  const [zoomView, setZoomView] = useState<"CASE" | "MOTHERBOARD">("CASE");

  const pcCase = buildState.installedParts["case"]
    ? getComponentById(buildState.installedParts["case"])
    : null;
  const mb = buildState.installedParts["motherboard"]
    ? getComponentById(buildState.installedParts["motherboard"])
    : null;
  const cpu = buildState.installedParts["cpu"]
    ? getComponentById(buildState.installedParts["cpu"])
    : null;
  const cooler = buildState.installedParts["cooler"]
    ? getComponentById(buildState.installedParts["cooler"])
    : null;
  const ram1 = buildState.installedParts["ram_1"]
    ? getComponentById(buildState.installedParts["ram_1"])
    : null;
  const ram2 = buildState.installedParts["ram_2"]
    ? getComponentById(buildState.installedParts["ram_2"])
    : null;
  const m2 = buildState.installedParts["storage_m2"]
    ? getComponentById(buildState.installedParts["storage_m2"])
    : null;
  const sata = buildState.installedParts["storage_sata"]
    ? getComponentById(buildState.installedParts["storage_sata"])
    : null;
  const gpu = buildState.installedParts["gpu"]
    ? getComponentById(buildState.installedParts["gpu"])
    : null;
  const psu = buildState.installedParts["psu"]
    ? getComponentById(buildState.installedParts["psu"])
    : null;
  const fanFront = buildState.installedParts["fan_front"]
    ? getComponentById(buildState.installedParts["fan_front"])
    : null;
  const fanRear = buildState.installedParts["fan_rear"]
    ? getComponentById(buildState.installedParts["fan_rear"])
    : null;

  const isPowered = buildState.isPoweredOn;

  return (
    <div className="relative w-full h-[620px] bg-gradient-to-b from-[#0b101d] via-[#090d16] to-[#06080e] rounded-xl border border-cyber-border shadow-2xl overflow-hidden flex flex-col justify-between">
      {/* Workbench Top Bar / Controls */}
      <div className="relative z-20 flex items-center justify-between px-5 py-3 border-b border-cyber-border/80 bg-cyber-dark/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              MEJA KERJA RAKITAN
            </span>
          </div>

          <div className="h-4 w-px bg-cyber-border" />

          {/* View Mode Toggle */}
          <div className="flex items-center bg-cyber-card rounded-lg p-0.5 border border-cyber-border text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setZoomView("CASE");
              }}
              className={`px-3 py-1 rounded font-medium transition-all ${
                zoomView === "CASE"
                  ? "bg-cyber-cyan text-cyber-dark font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tampilan Casing
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setZoomView("MOTHERBOARD");
              }}
              className={`px-3 py-1 rounded font-medium transition-all ${
                zoomView === "MOTHERBOARD"
                  ? "bg-cyber-cyan text-cyber-dark font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Fokus Motherboard
            </button>
          </div>
        </div>

        {/* Workbench Quick Action Tools */}
        <div className="flex items-center gap-2">
          {/* Thermal Paste button */}
          {cpu && !cooler && (
            <button
              onClick={() => {
                sound.playThermalPaste();
                onApplyThermalPaste();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                buildState.thermalPasteApplied
                  ? "bg-cyber-green/15 text-cyber-green border-cyber-green/40"
                  : "bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/50 hover:bg-cyber-cyan/25 animate-pulse"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {buildState.thermalPasteApplied ? "Thermal Paste: Teroles" : "Oles Thermal Paste"}
              </span>
            </button>
          )}

          {/* PSU Cables button */}
          {psu && mb && (
            <button
              onClick={() => {
                sound.playSnap();
                onConnectCables();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                buildState.cablesConnected
                  ? "bg-cyber-green/15 text-cyber-green border-cyber-green/40"
                  : "bg-cyber-amber/15 text-cyber-amber border-cyber-amber/50 hover:bg-cyber-amber/25 animate-pulse"
              }`}
            >
              <Cable className="w-3.5 h-3.5" />
              <span>
                {buildState.cablesConnected ? "Kabel PSU: Terpasang" : "Pasang Kabel PSU"}
              </span>
            </button>
          )}

          {/* Toggle Side Glass */}
          <button
            onClick={() => {
              sound.playScrew();
              onToggleCaseGlass();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              buildState.caseClosed
                ? "bg-slate-700/50 text-slate-200 border-slate-600"
                : "bg-cyber-card text-slate-300 border-cyber-border hover:border-slate-500"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{buildState.caseClosed ? "Buka Kaca Casing" : "Pasang Kaca Casing"}</span>
          </button>

          {/* Big Tactile Power Switch */}
          <button
            onClick={onPowerOn}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-lg ${
              isPowered
                ? "bg-cyber-green text-cyber-dark shadow-cyber-green animate-pulse"
                : "bg-gradient-to-r from-red-600 to-rose-700 text-white hover:brightness-110 active:scale-95"
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isPowered ? "PC ON (BERJALAN)" : "POWER ON"}</span>
          </button>

          {/* Quick Enter Monitor View */}
          {onOpenMonitor && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenMonitor();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyber-cyan/20 hover:bg-cyber-cyan text-cyber-cyan hover:text-cyber-dark border border-cyber-cyan/50 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              <Monitor className="w-4 h-4" />
              <span>Masuk Monitor PC ↗</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Assembly Workspace Viewport */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden select-none bg-tech-grid">
        <div className="absolute inset-x-8 bottom-0 h-14 bg-gradient-to-t from-[#111622] to-transparent border-t border-slate-800/60 pointer-events-none" />

        <div
          className={`relative transition-all duration-500 ease-out ${
            zoomView === "MOTHERBOARD"
              ? "scale-125 translate-y-8"
              : "scale-100"
          } w-[680px] h-[480px] bg-[#0c101a] rounded-xl border-4 border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden`}
        >
          {/* Chassis Outer Frame & Front I/O Header */}
          <div className="h-8 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                {pcCase ? pcCase.name : "Slot Casing PC (Klik untuk Pasang Casing)"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan" />
              <div className="w-3 h-1.5 bg-slate-600 rounded-sm" />
              <div className="w-3 h-1.5 bg-slate-600 rounded-sm" />
              <button
                onClick={onPowerOn}
                title="Tombol Power Fisik Casing"
                className="w-4 h-4 rounded-full bg-slate-700 hover:bg-cyber-cyan border border-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <Power className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          </div>

          {/* Chassis Main Cavity */}
          <div className="relative flex-1 flex p-2 gap-2 bg-[#080c14]">
            {/* Left/Front Fan Intake Column */}
            <div
              onClick={() => onSelectSlot("fan_front")}
              className={`w-16 h-full rounded border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeSlot === "fan_front"
                  ? "border-cyber-cyan bg-cyber-cyan/10"
                  : fanFront
                  ? "border-slate-700 bg-slate-900/60"
                  : "border-slate-800 hover:border-cyber-cyan/50 bg-slate-950/40"
              }`}
            >
              {fanFront ? (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Fan
                    className={`w-10 h-10 ${
                      isPowered ? "fan-spinning-fast text-cyber-cyan" : "text-slate-500"
                    }`}
                  />
                  <span className="text-[8px] font-mono text-slate-400">Front Fan</span>
                </div>
              ) : (
                <div className="text-center p-1">
                  <Fan className="w-6 h-6 mx-auto text-slate-600 mb-1" />
                  <span className="text-[8px] text-slate-500 font-mono">Fan Depan</span>
                </div>
              )}
            </div>

            {/* Central Area: Motherboard + GPU + PSU Chamber */}
            <div className="flex-1 flex flex-col gap-2">
              <div
                onClick={() => {
                  if (!mb) onSelectSlot("motherboard");
                }}
                className={`relative flex-1 rounded-lg border-2 transition-all p-3 flex flex-col justify-between ${
                  !mb
                    ? activeSlot === "motherboard"
                      ? "border-cyber-cyan bg-cyber-cyan/10 border-dashed cursor-pointer"
                      : "border-slate-800 hover:border-cyber-cyan/40 border-dashed bg-slate-950/60 cursor-pointer"
                    : "border-slate-700 bg-[#0e1626]"
                }`}
              >
                {!mb ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <Layers className="w-10 h-10 text-slate-600 mb-2 animate-bounce" />
                    <span className="text-xs font-semibold text-slate-400">
                      Motherboard Belum Terpasang
                    </span>
                    <span className="text-[10px] text-slate-600 mt-1">
                      Klik di sini atau pilih Motherboard dari daftar komponen
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-700/60 pb-1">
                      <span className="text-cyber-cyan font-bold truncate max-w-[240px]">
                        {mb.name}
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px]">
                        Socket {mb.socket} • {mb.memoryType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 my-1">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSlot("fan_rear");
                        }}
                        className={`w-14 h-24 rounded border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                          activeSlot === "fan_rear"
                            ? "border-cyber-cyan bg-cyber-cyan/10"
                            : fanRear
                            ? "border-slate-700 bg-slate-900/40"
                            : "border-slate-800 hover:border-slate-600"
                        }`}
                      >
                        {fanRear ? (
                          <Fan
                            className={`w-8 h-8 ${
                              isPowered ? "fan-spinning-fast text-cyber-purple" : "text-slate-500"
                            }`}
                          />
                        ) : (
                          <span className="text-[8px] text-slate-600 text-center">Fan Belakang</span>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-center">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!cpu) onSelectSlot("cpu");
                            else if (!cooler) onSelectSlot("cooler");
                          }}
                          className={`relative w-32 h-32 rounded-lg border-2 transition-all flex flex-col items-center justify-center p-1.5 cursor-pointer ${
                            !cpu
                              ? activeSlot === "cpu"
                                ? "border-cyber-cyan bg-cyber-cyan/15 animate-pulse"
                                : "border-amber-500/40 bg-amber-500/5 hover:border-amber-400"
                              : !cooler
                              ? activeSlot === "cooler"
                                ? "border-cyber-cyan bg-cyber-cyan/15"
                                : "border-slate-600 bg-slate-900 hover:border-slate-500"
                              : "border-slate-600 bg-slate-950 shadow-inner"
                          }`}
                        >
                          {!cpu && (
                            <div className="text-center">
                              <Cpu className="w-8 h-8 mx-auto text-amber-400/80 mb-1" />
                              <span className="text-[9px] font-bold text-amber-300 block">
                                Socket {mb.socket}
                              </span>
                              <span className="text-[8px] text-slate-500">Pasang CPU</span>
                            </div>
                          )}

                          {cpu && !cooler && (
                            <div className="w-full h-full rounded bg-gradient-to-br from-slate-700 to-slate-900 p-2 flex flex-col justify-between border border-slate-500 relative">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-bold font-mono text-white">
                                  {cpu.brand}
                                </span>
                                <span className="text-[7px] text-slate-400">{cpu.socket}</span>
                              </div>
                              {buildState.thermalPasteApplied ? (
                                <div className="w-6 h-6 rounded-full bg-slate-400 border border-slate-300 mx-auto shadow-md flex items-center justify-center">
                                  <span className="text-[6px] text-slate-800 font-bold">PASTE</span>
                                </div>
                              ) : (
                                <div className="text-center py-1">
                                  <span className="text-[8px] font-mono text-cyan-400 font-semibold block">
                                    {cpu.name.substring(0, 16)}
                                  </span>
                                  <span className="text-[7px] text-amber-400">
                                    (Belum Ada Pasta)
                                  </span>
                                </div>
                              )}
                              <span className="text-[7px] text-center text-slate-400">
                                Klik untuk Pasang Cooler
                              </span>
                            </div>
                          )}

                          {cooler && (
                            <div className="w-full h-full rounded bg-[#10192a] border border-slate-600 p-1 flex flex-col items-center justify-center relative overflow-hidden">
                              <div
                                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isPowered
                                    ? cooler.rgb
                                      ? "border-cyber-cyan shadow-[0_0_15px_#00f3ff]"
                                      : "border-slate-500"
                                    : "border-slate-700"
                                }`}
                              >
                                <Fan
                                  className={`w-14 h-14 ${
                                    isPowered
                                      ? "fan-spinning-fast text-cyber-cyan"
                                      : "text-slate-600"
                                  }`}
                                />
                              </div>
                              <span className="text-[8px] font-mono text-slate-300 font-semibold mt-1 truncate max-w-full">
                                {cooler.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 h-32 items-center">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSlot("ram_1");
                          }}
                          className={`w-6 h-28 rounded-sm border transition-all flex flex-col items-center justify-between py-1 cursor-pointer ${
                            activeSlot === "ram_1"
                              ? "border-cyber-cyan bg-cyber-cyan/20 ring-1 ring-cyber-cyan"
                              : ram1
                              ? "border-cyber-cyan/60 bg-slate-900"
                              : "border-slate-700 hover:border-slate-500 bg-slate-950/60"
                          }`}
                        >
                          <div className="w-4 h-1 bg-slate-600 rounded-full" />
                          {ram1 ? (
                            <div
                              className={`w-4 h-20 rounded-sm flex flex-col items-center justify-center transition-all ${
                                isPowered && ram1.rgb
                                  ? "bg-gradient-to-t from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_8px_#bd00ff]"
                                  : "bg-slate-700"
                              }`}
                            >
                              <span className="text-[6px] font-mono text-white -rotate-90 whitespace-nowrap">
                                RAM 1
                              </span>
                            </div>
                          ) : (
                            <span className="text-[7px] font-mono text-slate-600 -rotate-90">
                              DIMM 1
                            </span>
                          )}
                          <div className="w-4 h-1 bg-slate-600 rounded-full" />
                        </div>

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSlot("ram_2");
                          }}
                          className={`w-6 h-28 rounded-sm border transition-all flex flex-col items-center justify-between py-1 cursor-pointer ${
                            activeSlot === "ram_2"
                              ? "border-cyber-cyan bg-cyber-cyan/20 ring-1 ring-cyber-cyan"
                              : ram2
                              ? "border-cyber-cyan/60 bg-slate-900"
                              : "border-slate-700 hover:border-slate-500 bg-slate-950/60"
                          }`}
                        >
                          <div className="w-4 h-1 bg-slate-600 rounded-full" />
                          {ram2 ? (
                            <div
                              className={`w-4 h-20 rounded-sm flex flex-col items-center justify-center transition-all ${
                                isPowered && ram2.rgb
                                  ? "bg-gradient-to-t from-cyan-400 via-green-400 to-yellow-400 shadow-[0_0_8px_#00ff88]"
                                  : "bg-slate-700"
                              }`}
                            >
                              <span className="text-[6px] font-mono text-white -rotate-90 whitespace-nowrap">
                                RAM 2
                              </span>
                            </div>
                          ) : (
                            <span className="text-[7px] font-mono text-slate-600 -rotate-90">
                              DIMM 2
                            </span>
                          )}
                          <div className="w-4 h-1 bg-slate-600 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSlot("storage_m2");
                      }}
                      className={`h-5 w-44 mx-auto rounded border transition-all flex items-center justify-between px-2 cursor-pointer ${
                        activeSlot === "storage_m2"
                          ? "border-cyber-cyan bg-cyber-cyan/20 ring-1 ring-cyber-cyan"
                          : m2
                          ? "border-slate-600 bg-slate-900"
                          : "border-slate-800 hover:border-slate-600 bg-slate-950"
                      }`}
                    >
                      <span className="text-[7px] font-mono text-slate-400">
                        {m2 ? `NVMe: ${m2.name.substring(0, 18)}` : "Slot M.2 NVMe SSD (Klik)"}
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSlot("gpu");
                      }}
                      className={`h-16 w-full rounded border-2 transition-all flex items-center justify-between px-3 cursor-pointer ${
                        activeSlot === "gpu"
                          ? "border-cyber-cyan bg-cyber-cyan/15 ring-1 ring-cyber-cyan"
                          : gpu
                          ? "border-slate-600 bg-slate-900/90 shadow-md"
                          : "border-slate-800 hover:border-slate-600 border-dashed bg-slate-950/60"
                      }`}
                    >
                      {gpu ? (
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <Fan
                                className={`w-8 h-8 ${
                                  isPowered ? "fan-spinning-fast text-cyber-cyan" : "text-slate-600"
                                }`}
                              />
                              <Fan
                                className={`w-8 h-8 ${
                                  isPowered ? "fan-spinning-fast text-cyber-cyan" : "text-slate-600"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white leading-tight">
                                {gpu.name}
                              </p>
                              <p className="text-[8px] font-mono text-slate-400">
                                PCIe 4.0 x16 • {gpu.powerWattage}W TDP
                              </p>
                            </div>
                          </div>
                          {isPowered && gpu.rgb && (
                            <span className="text-[8px] font-bold font-mono text-cyber-green bg-cyber-green/10 px-1.5 py-0.5 rounded border border-cyber-green/30 animate-pulse">
                              GEFORCE RTX
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-full text-center">
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            Slot PCIe x16 (Kartu Grafis GPU)
                          </span>
                          <span className="text-[8px] text-slate-600">
                            Klik di sini untuk memasang GPU
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Lower Chamber: PSU Bay (65%) and SATA Drive Cage (35%) */}
              <div className="h-16 w-full flex gap-2">
                {/* PSU Bay */}
                <div
                  onClick={() => onSelectSlot("psu")}
                  className={`h-full flex-1 rounded-lg border-2 transition-all flex items-center justify-between px-3 cursor-pointer ${
                    activeSlot === "psu"
                      ? "border-cyber-cyan bg-cyber-cyan/15 ring-1 ring-cyber-cyan"
                      : psu
                      ? "border-slate-700 bg-slate-900"
                      : "border-slate-800 hover:border-slate-600 border-dashed bg-slate-950/60"
                  }`}
                >
                  {psu ? (
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap
                          className={`w-5 h-5 ${
                            isPowered ? "text-yellow-400 animate-pulse" : "text-slate-500"
                          }`}
                        />
                        <div className="truncate max-w-[170px]">
                          <p className="text-[9px] font-bold text-white leading-tight truncate">
                            {psu.name}
                          </p>
                          <p className="text-[7px] font-mono text-slate-400">
                            {psu.psuWattage}W • {psu.efficiencyRating}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[7px] font-mono px-1.5 py-0.5 rounded border ${
                          buildState.cablesConnected
                            ? "bg-cyber-green/20 text-cyber-green border-cyber-green/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {buildState.cablesConnected ? "Kabel Rapi" : "Kabel Lepas"}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full text-center">
                      <span className="text-[9px] font-semibold text-slate-400 block">
                        PSU Bay
                      </span>
                      <span className="text-[7px] text-slate-600">Klik Pasang PSU</span>
                    </div>
                  )}
                </div>

                {/* SATA SSD / 3.5" HDD Drive Cage */}
                <div
                  onClick={() => onSelectSlot("storage_sata")}
                  className={`h-full w-44 rounded-lg border-2 transition-all flex items-center justify-between px-2.5 cursor-pointer ${
                    activeSlot === "storage_sata"
                      ? "border-cyber-cyan bg-cyber-cyan/15 ring-1 ring-cyber-cyan"
                      : sata
                      ? "border-slate-700 bg-slate-900"
                      : "border-slate-800 hover:border-slate-600 border-dashed bg-slate-950/60"
                  }`}
                >
                  {sata ? (
                    <div className="flex items-center gap-2 truncate">
                      <HardDrive className="w-4 h-4 text-cyber-cyan flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-[8px] font-bold text-white leading-tight truncate">
                          {sata.name}
                        </p>
                        <p className="text-[7px] font-mono text-slate-400">
                          {sata.storageType} • {sata.storageCapacityGb}GB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-center">
                      <span className="text-[8px] font-semibold text-slate-400 block">
                        Drive Bay (HDD/SSD)
                      </span>
                      <span className="text-[7px] text-slate-600">Pasang SATA / HDD</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {buildState.caseClosed && (
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-transparent to-white/[0.08] pointer-events-none border-2 border-slate-500/40 backdrop-blur-[0.5px]">
              <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-400 border border-slate-600 shadow-md" />
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-400 border border-slate-600 shadow-md" />
              <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-slate-400 border border-slate-600 shadow-md" />
              <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-slate-400 border border-slate-600 shadow-md" />
              <div className="absolute bottom-4 right-6 text-[9px] font-mono text-slate-400/60 uppercase tracking-widest">
                TEMPERED GLASS
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-cyber-border/80 bg-cyber-dark/80 backdrop-blur-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Petunjuk:</span>
          <span className="text-cyber-cyan font-mono text-[11px]">
            {!pcCase
              ? "1. Pilih Casing terlebih dahulu dari laci komponen di bawah."
              : !mb
              ? "2. Pilih Motherboard yang sesuai untuk dipasang ke dalam casing."
              : !cpu
              ? "3. Pasang Prosesor (CPU) yang kompatibel dengan socket motherboard."
              : !buildState.thermalPasteApplied
              ? "4. Klik tombol 'Oles Thermal Paste' di bilah atas sebelum memasang cooler!"
              : !cooler
              ? "5. Pasang CPU Cooler di atas prosesor."
              : !ram1
              ? "6. Pasang minimal 1 keping RAM ke slot DIMM 1."
              : !m2 && !sata
              ? "7. Pasang SSD M.2 NVMe atau SATA Drive untuk instalasi sistem operasi."
              : !psu
              ? "8. Pasang Power Supply (PSU) dengan watt yang cukup."
              : !gpu
              ? "9. Pasang Kartu Grafis (GPU) ke slot PCIe x16."
              : !buildState.cablesConnected
              ? "10. Klik 'Pasang Kabel PSU' untuk mengalirkan daya ke komponen."
              : !buildState.caseClosed
              ? "11. Pasang kaca samping casing lalu tekan tombol 'POWER ON'!"
              : "Semua siap! Tekan tombol 'POWER ON' untuk menyalakan PC!"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            Komponen Terpasang:{" "}
            <strong className="text-white">
              {Object.keys(buildState.installedParts).length}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
