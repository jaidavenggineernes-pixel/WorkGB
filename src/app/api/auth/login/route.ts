import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { identifier, password, isDemo } = await req.json();

    // Support 1-click Quick Demo login
    if (isDemo) {
      let demoUser = await prisma.user.findUnique({
        where: { email: "demo@workgb.local" },
      });

      if (!demoUser) {
        const passwordHash = await hashPassword("demo1234");
        demoUser = await prisma.user.create({
          data: {
            username: "PCMasterBuilder",
            email: "demo@workgb.local",
            passwordHash,
            settings: {
              create: {
                soundVolume: 0.8,
                musicVolume: 0.5,
                animations: true,
                graphicsQuality: "HIGH",
                language: "ID",
              },
            },
          },
        });
      }

      const token = signToken({
        userId: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: demoUser.id,
          username: demoUser.username,
          email: demoUser.email,
        },
      });

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });

      return response;
    }

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { username: identifier.trim() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Akun dengan username atau email tersebut tidak ditemukan." },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password yang dimasukkan salah." },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat login." },
      { status: 500 }
    );
  }
}
