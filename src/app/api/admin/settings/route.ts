import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json({ settings: map });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ settings: {} });
  }
}

export async function POST(request: Request) {
  return handleSaveSettings(request);
}

export async function PUT(request: Request) {
  return handleSaveSettings(request);
}

async function handleSaveSettings(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên" }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, string>;

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Đã lưu cài đặt website thành công" });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Lỗi lưu cài đặt" }, { status: 500 });
  }
}
