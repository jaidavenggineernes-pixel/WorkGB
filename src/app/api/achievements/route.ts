import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ACHIEVEMENTS_LIST = [
  {
    code: "FIRST_BOOT",
    title: "First Post & Boot",
    description: "Berhasil merakit dan menyalakan PC pertamamu hingga masuk BIOS!",
    icon: "Power",
  },
  {
    code: "THERMAL_MASTER",
    title: "Thermal Master",
    description: "Mengaplikasikan pasta termal dengan takaran presisi sebelum cooler.",
    icon: "Droplets",
  },
  {
    code: "CABLE_LEGEND",
    title: "Cable Legend",
    description: "Menghubungkan seluruh daya 24-pin, CPU 8-pin, dan PCIe dengan rapi.",
    icon: "Workflow",
  },
  {
    code: "FLAWLESS_BUILD",
    title: "Zero Mistakes",
    description: "Merakit PC tanpa satupun kesalahan kompatibilitas komponen.",
    icon: "ShieldCheck",
  },
  {
    code: "SILICON_BEAST",
    title: "Silicon Beast",
    description: "Merakit PC dengan prosesor atau kartu grafis tier monster (RTX 4090 / Ryzen 7800X3D).",
    icon: "Cpu",
  },
  {
    code: "SPEED_BUILDER",
    title: "Speed Builder",
    description: "Menyelesaikan perakitan PC dalam waktu kurang dari 3 menit.",
    icon: "Zap",
  },
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unlocked = await prisma.userAchievement.findMany({
    where: { userId: user.id },
  });

  const unlockedCodes = new Set(unlocked.map((a) => a.code));

  const list = ACHIEVEMENTS_LIST.map((ach) => ({
    ...ach,
    unlocked: unlockedCodes.has(ach.code),
    unlockedAt: unlocked.find((a) => a.code === ach.code)?.unlockedAt || null,
  }));

  return NextResponse.json({ achievements: list });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code } = await req.json();
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_code: {
          userId: user.id,
          code,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, newlyUnlocked: false });
    }

    const created = await prisma.userAchievement.create({
      data: {
        userId: user.id,
        code,
      },
    });

    return NextResponse.json({ success: true, newlyUnlocked: true, achievement: created });
  } catch (error) {
    console.error("Achievement unlock error:", error);
    return NextResponse.json({ error: "Gagal membuka achievement" }, { status: 500 });
  }
}
