import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const builds = await prisma.build.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ builds });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const buildName = body.name || `PC Rakitan #${Math.floor(100 + Math.random() * 900)}`;

    const newBuild = await prisma.build.create({
      data: {
        userId: user.id,
        name: buildName,
        status: "IN_PROGRESS",
        progress: 0,
        accuracyScore: 100,
        compatibilityScore: 100,
        cableScore: 100,
        errorsCount: 0,
        buildTimeSeconds: 0,
        isPoweredOn: false,
        currentStep: 1,
        caseState: "OPEN",
        thermalPasteApplied: false,
        cablesConnected: false,
        installedPartsJson: "{}",
      },
    });

    return NextResponse.json({ success: true, build: newBuild });
  } catch (error) {
    console.error("Create build error:", error);
    return NextResponse.json({ error: "Gagal membuat build baru" }, { status: 500 });
  }
}
