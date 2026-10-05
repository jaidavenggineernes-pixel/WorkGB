import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Get user settings and recent builds count
  const buildsCount = await prisma.build.count({ where: { userId: user.id } });
  const completedBuilds = await prisma.build.count({
    where: { userId: user.id, status: "COMPLETED" },
  });
  const achievementsCount = await prisma.userAchievement.count({
    where: { userId: user.id },
  });

  return NextResponse.json({
    user,
    stats: {
      totalBuilds: buildsCount,
      completedBuilds,
      achievementsCount,
    },
  });
}
