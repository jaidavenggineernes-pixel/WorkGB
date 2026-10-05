"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cpu,
  FolderKanban,
  PackageOpen,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  LogOut,
  User,
  MonitorPlay,
} from "lucide-react";
import { sound } from "@/lib/sound/sound-engine";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
    if (!nextState) sound.playClick();
  };

  const handleLogout = async () => {
    sound.playClick();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navLinks = [
    { href: "/menu", label: "Menu Utama", icon: MonitorPlay },
    { href: "/builds", label: "PC Builds", icon: FolderKanban },
    { href: "/inventory", label: "Katalog Part", icon: PackageOpen },
    { href: "/achievements", label: "Pencapaian", icon: Trophy },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyber-border bg-cyber-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => sound.playClick()}
          className="flex items-center gap-2 group transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-cyber-card border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan group-hover:border-cyber-cyan group-hover:shadow-cyber-cyan transition-all">
            <Cpu className="w-6 h-6 animate-pulse-glow" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wider text-white group-hover:text-cyber-cyan transition-colors">
              WORK<span className="text-cyber-cyan">GB</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest text-cyber-cyan/70 font-mono uppercase bg-cyber-cyan/10 px-1.5 py-0.5 rounded border border-cyber-cyan/30">
              SIMULATOR
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => sound.playClick()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 shadow-sm shadow-cyber-cyan/20"
                    : "text-slate-400 hover:text-white hover:bg-cyber-card/80 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & User Info */}
        <div className="flex items-center gap-3">
          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? "Aktifkan Suara" : "Matikan Suara"}
            className="p-2 rounded-lg bg-cyber-card border border-cyber-border text-slate-300 hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyber-green" />}
          </button>

          {/* User Profile or Login CTA */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-cyber-border">
              <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 border border-cyber-cyan/50 flex items-center justify-center text-cyber-cyan text-xs font-bold">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white leading-none">
                  {currentUser.username}
                </p>
                <p className="text-[10px] text-slate-400 font-mono leading-none mt-1">
                  Builder Online
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-1.5 text-slate-400 hover:text-red-400 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-cyan text-cyber-dark text-xs font-bold hover:bg-cyber-cyan/90 transition-all shadow-cyber-cyan"
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
