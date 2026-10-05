import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const build = await prisma.build.findFirst({
    where: { id, userId: user.id },
  });

  if (!build) {
    return NextResponse.json({ error: "Build tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ build });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.build.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Build tidak ditemukan" }, { status: 404 });
  }

  const updated = await prisma.build.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      status: body.status ?? existing.status,
      progress: body.progress ?? existing.progress,
      score: body.score ?? existing.score,
      accuracyScore: body.accuracyScore ?? existing.accuracyScore,
      compatibilityScore: body.compatibilityScore ?? existing.compatibilityScore,
      cableScore: body.cableScore ?? existing.cableScore,
      errorsCount: body.errorsCount ?? existing.errorsCount,
      buildTimeSeconds: body.buildTimeSeconds ?? existing.buildTimeSeconds,
      isPoweredOn: body.isPoweredOn ?? existing.isPoweredOn,
      currentStep: body.currentStep ?? existing.currentStep,
      caseState: body.caseClosed ? "CLOSED" : "OPEN",
      thermalPasteApplied: body.thermalPasteApplied ?? existing.thermalPasteApplied,
      cablesConnected: body.cablesConnected ?? existing.cablesConnected,
      installedPartsJson: body.installedParts
        ? JSON.stringify(body.installedParts)
        : existing.installedPartsJson,
    },
  });

  return NextResponse.json({ success: true, build: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.build.deleteMany({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ success: true, message: "Build berhasil dihapus" });
}
