"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { COMPONENTS_CATALOG } from "@/lib/game-engine/components-catalog";
import { sound } from "@/lib/sound/sound-engine";
import {
  PackageOpen,
  Search,
} from "lucide-react";

export default function InventoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { key: "ALL", label: "Semua Komponen" },
    { key: "CASE", label: "Casing" },
    { key: "MOTHERBOARD", label: "Motherboard" },
    { key: "CPU", label: "Prosesor" },
    { key: "COOLER", label: "Cooler" },
    { key: "RAM", label: "RAM" },
    { key: "GPU", label: "Kartu Grafis" },
    { key: "STORAGE", label: "Storage" },
    { key: "PSU", label: "Power Supply" },
    { key: "FAN", label: "Kipas Fan" },
  ];

  const filteredComponents = COMPONENTS_CATALOG.filter((comp) => {
    const matchesCategory =
      selectedCategory === "ALL" || comp.category === selectedCategory;
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-cyber-dark text-white flex flex-col bg-tech-grid">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <PackageOpen className="w-6 h-6 text-cyber-cyan" />
              <span>KATALOG KOMPONEN PC (INVENTORY)</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Daftar seluruh komponen komputer resmi yang tersedia untuk disimulasikan di WorkGb
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari prosesor, GPU, RAM..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat.key);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? "bg-cyber-cyan text-cyber-dark font-bold shadow-cyber-cyan"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredComponents.map((comp) => (
            <div
              key={comp.id}
              className="bg-cyber-card border border-cyber-border rounded-xl p-4 flex flex-col justify-between hover:border-cyber-cyan/40 hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="text-cyber-cyan font-bold uppercase">{comp.brand}</span>
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    {comp.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{comp.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-3">
                  {comp.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {comp.socket && (
                    <span className="text-[10px] font-mono bg-slate-900 text-amber-300 px-2 py-0.5 rounded border border-slate-800">
                      Socket {comp.socket}
                    </span>
                  )}
                  {comp.memoryType && (
                    <span className="text-[10px] font-mono bg-slate-900 text-cyan-300 px-2 py-0.5 rounded border border-slate-800">
                      {comp.memoryType}
                    </span>
                  )}
                  {comp.powerWattage > 0 && (
                    <span className="text-[10px] font-mono bg-slate-900 text-rose-300 px-2 py-0.5 rounded border border-slate-800">
                      {comp.powerWattage}W TDP
                    </span>
                  )}
                  {comp.psuWattage && (
                    <span className="text-[10px] font-mono bg-slate-900 text-yellow-300 px-2 py-0.5 rounded border border-slate-800">
                      {comp.psuWattage}W Kapasitas
                    </span>
                  )}
                  {comp.formFactor && (
                    <span className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {comp.formFactor}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Harga Estimasi</span>
                <span className="font-mono font-bold text-cyber-cyan">
                  Rp {comp.price.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
